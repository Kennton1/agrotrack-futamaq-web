'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Plus, Search, Filter, Edit, Trash2, Eye, MapPin,
  Truck, Wrench, Clock, Fuel, Settings, AlertTriangle, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { formatCLP, formatHours } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { AuditLogViewer } from '@/components/audit/AuditLogViewer'
import MachineryMap from '@/components/maps/MachineryMap'
import { ImageCarousel } from '@/components/maquinarias/ImageCarousel'
import { Machinery } from '@/contexts/AppContext'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { MachineryImage } from '@/components/maquinarias/ImageCarousel'
import { ImageUpload } from '@/components/maquinarias/ImageUpload'
import { CreditCard, Calendar, Activity, DollarSign } from 'lucide-react'

export default function MaquinariasPage() {
  const { machinery, deleteMachinery, addMachinery, updateMachinery, workOrders, currentUser } = useApp()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'in_use' | 'maintenance'>('all')
  const [selectedMachinery, setSelectedMachinery] = useState<Machinery | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showNewMachineryModal, setShowNewMachineryModal] = useState(false)
  const [showEditMachineryModal, setShowEditMachineryModal] = useState(false)
  const [machineryToEdit, setMachineryToEdit] = useState<Machinery | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    setLoading(false)
    console.log('Maquinarias en contexto:', machinery)
  }, [machinery])

  const getActiveWorkOrder = (machineryId: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return workOrders.find(wo => {
      // Check if WO is active
      if (wo.status === 'completada' || wo.status === 'cancelada') return false

      const hasMachine = wo.assigned_machinery.includes(machineryId)
      if (!hasMachine) return false

      // Check dates
      const start = new Date(wo.planned_start_date)
      const end = new Date(wo.planned_end_date)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)

      return today >= start && today <= end
    })
  }

  const filteredMachinery = machinery.filter(item => {
    const matchesSearch = item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    let matchesActiveFilter = true
    if (activeFilter === 'available') {
      matchesActiveFilter = item.status === 'disponible' && !getActiveWorkOrder(item.id)
    } else if (activeFilter === 'in_use') {
      matchesActiveFilter = !!getActiveWorkOrder(item.id)
    } else if (activeFilter === 'maintenance') {
      matchesActiveFilter = item.status === 'en_mantencion'
    }

    return matchesSearch && matchesType && matchesStatus && matchesActiveFilter
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredMachinery.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMachinery = filteredMachinery.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, statusFilter, activeFilter])

  // Función para determinar la categoría de la maquinaria
  const getMachineryCategory = (mach: Machinery): string => {
    const brand = mach.brand.toLowerCase()

    // Tractores (categoría específica)
    if (mach.type === 'tractor') return 'tractores'

    // Preparación del suelo
    if (brand.includes('arado')) return 'preparacion_suelo'
    if (brand.includes('rastra')) return 'preparacion_suelo'
    if (brand.includes('subsolador')) return 'preparacion_suelo'
    if (brand.includes('rodillo')) return 'preparacion_suelo'

    // Siembra y plantación
    if (brand.includes('sembradora')) return 'siembra_plantacion'
    if (brand.includes('plantadora')) return 'siembra_plantacion'
    if (brand.includes('trasplantadora')) return 'siembra_plantacion'
    if (brand.includes('abonadora') || brand.includes('fertilizadora')) return 'siembra_plantacion'
    if (brand.includes('cisterna') || brand.includes('tanque fertilizador')) return 'siembra_plantacion'

    // Cuidado del cultivo
    if (brand.includes('pulverizadora') || brand.includes('fumigadora')) return 'cuidado_cultivo'
    if (brand.includes('cultivador')) return 'cuidado_cultivo'
    if (brand.includes('desmalezadora') || brand.includes('motoguadaña')) return 'cuidado_cultivo'
    if (brand.includes('cortacésped') || brand.includes('rotativa')) return 'cuidado_cultivo'
    if (brand.includes('riego')) return 'cuidado_cultivo'

    // Cosecha
    if (brand.includes('cosechadora')) return 'cosecha'
    if (brand.includes('cabezal')) return 'cosecha'
    if (brand.includes('segadora')) return 'cosecha'
    if (brand.includes('acondicionadora')) return 'cosecha'
    if (brand.includes('hileradora')) return 'cosecha'
    if (brand.includes('embaladora') || brand.includes('empacadora')) return 'cosecha'

    // Transporte
    if (mach.type === 'camion') return 'transporte'

    return 'otros'
  }

  // Agrupar maquinarias por categoría
  const groupedMachinery = filteredMachinery.reduce((acc, mach) => {
    const category = getMachineryCategory(mach)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(mach)
    return acc
  }, {} as Record<string, Machinery[]>)

  const categoryLabels: Record<string, string> = {
    'tractores': 'Tractores',
    'preparacion_suelo': 'Preparación del Suelo',
    'siembra_plantacion': 'Siembra y Plantación',
    'cuidado_cultivo': 'Cuidado del Cultivo',
    'cosecha': 'Cosecha',
    'transporte': 'Transporte',
    'otros': 'Otros'
  }

  const categoryOrder = ['tractores', 'preparacion_suelo', 'siembra_plantacion', 'cuidado_cultivo', 'cosecha', 'transporte', 'otros']

  const handleEdit = (machinery: Machinery) => {
    setMachineryToEdit(machinery)
    setShowEditMachineryModal(true)
  }

  const handleView = (machinery: Machinery) => {
    setSelectedMachinery(machinery)
  }

  const handleDelete = (machinery: Machinery) => {
    setSelectedMachinery(machinery)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedMachinery) {
      deleteMachinery(selectedMachinery.id)
      setShowDeleteModal(false)
      setSelectedMachinery(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tractor':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'implemento':
        return <Settings className="h-5 w-5 text-green-500" />
      case 'camion':
        return <Truck className="h-5 w-5 text-orange-500" />
      case 'cosechadora':
        return <Truck className="h-5 w-5 text-purple-500" />
      case 'pulverizador':
        return <Settings className="h-5 w-5 text-cyan-500" />
      case 'sembradora':
        return <Settings className="h-5 w-5 text-yellow-500" />
      default:
        return <Truck className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: string, isInUse?: boolean) => {
    if (isInUse) return 'info'
    switch (status) {
      case 'disponible':
        return 'success' as const
      case 'en_faena':
        return 'info' as const
      case 'en_mantencion':
        return 'warning' as const
      case 'fuera_servicio':
        return 'danger' as const
      default:
        return 'default' as const
    }
  }

  const getStatusLabel = (status: string, isInUse?: boolean) => {
    if (isInUse) return 'En Uso'
    switch (status) {
      case 'disponible':
        return 'Disponible'
      case 'en_faena':
        return 'En Faena'
      case 'en_mantencion':
        return 'En Mantención'
      case 'fuera_servicio':
        return 'Fuera de Servicio'
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tractor':
        return 'Tractor'
      case 'implemento':
        return 'Implemento'
      case 'camion':
        return 'Camión'
      case 'cosechadora':
        return 'Cosechadora'
      case 'pulverizador':
        return 'Pulverizador'
      case 'sembradora':
        return 'Sembradora'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Maquinarias</h1>
          <p className="text-gray-600 dark:text-gray-300">Administra el inventario de equipos agrícolas</p>
        </div>
        <div className="flex space-x-2 justify-center">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>Ver Mapa</span>
          </button>

          {currentUser?.role === 'administrador' && (
            <button
              type="button"
              className="flex items-center space-x-2 h-10 px-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-colors shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2"
              onClick={() => setShowNewMachineryModal(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Maquinaria</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros y búsqueda - PRIMERO */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo, patente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">Todos los tipos</option>
                <option value="tractor">Tractor</option>
                <option value="implemento">Implemento</option>
                <option value="camion">Camión</option>
                <option value="cosechadora">Cosechadora</option>
                <option value="pulverizador">Pulverizador</option>
                <option value="sembradora">Sembradora</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="en_faena">En Faena</option>
                <option value="en_mantencion">En Mantención</option>
                <option value="fuera_servicio">Fuera de Servicio</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas - DESPUÉS de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div onClick={() => setActiveFilter('all')} className="cursor-pointer transition-transform hover:scale-105">
          <Card className={`${activeFilter === 'all' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Equipos</p>
                  <p className="text-2xl font-bold text-gray-900">{machinery.length}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div onClick={() => setActiveFilter('available')} className="cursor-pointer transition-transform hover:scale-105">
          <Card className={`${activeFilter === 'available' ? 'ring-2 ring-green-500 border-green-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">
                    {machinery.filter(m => m.status === 'disponible' && !getActiveWorkOrder(m.id)).length}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div onClick={() => setActiveFilter('in_use')} className="cursor-pointer transition-transform hover:scale-105">
          <Card className={`${activeFilter === 'in_use' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Uso (Hoy)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {machinery.filter(m => !!getActiveWorkOrder(m.id)).length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div onClick={() => setActiveFilter('maintenance')} className="cursor-pointer transition-transform hover:scale-105">
          <Card className={`${activeFilter === 'maintenance' ? 'ring-2 ring-yellow-500 border-yellow-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Mantención</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {machinery.filter(m => m.status === 'en_mantencion').length}
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de maquinarias con paginación */}
      <div className="space-y-6">
        {/* Grid de maquinarias - 9 por página */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedMachinery.map((item) => {
            const activeWO = getActiveWorkOrder(item.id)
            const isInUse = !!activeWO

            return (
              <Card key={item.id} className={`hover:shadow-md transition-shadow ${isInUse ? 'border-blue-300 bg-blue-50/30' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <div>
                        <CardTitle className="text-base">{item.brand} {item.model}</CardTitle>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(item.status, isInUse)} size="sm">
                      {getStatusLabel(item.status, isInUse)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Carrusel de imágenes - más pequeño */}
                  {item.images && item.images.length > 0 ? (
                    <div className="mb-2 h-48 rounded-lg overflow-hidden bg-gray-100 relative flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <img
                        src={item.images[0]?.url || ''}
                        alt={item.images[0]?.alt || `${item.brand} ${item.model}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="mb-2 h-48 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <Truck className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Visual indicator for active usage */}
                  {activeWO && (
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md border border-blue-200 dark:border-blue-800 text-sm mb-2">
                      <div className="flex items-start gap-2">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-blue-800 dark:text-blue-300 text-xs uppercase tracking-wide truncate">
                            Trabajando en:
                          </p>
                          <p className="font-medium text-blue-900 dark:text-blue-100 truncate">
                            {activeWO.task_type}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                            OT #{(activeWO as any).numero_orden || activeWO.id} • {activeWO.field_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Año</p>
                      <p className="font-medium">{item.year}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Patente</p>
                      <p className="font-medium">{item.patent}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Horas</p>
                      <p className="font-medium">{formatHours(item.total_hours)}</p>
                    </div>
                    {currentUser?.role === 'administrador' && (
                      <div>
                        <p className="text-gray-500">Costo/Hora</p>
                        <p className="font-medium text-xs">{formatCLP(item.hourly_cost)}</p>
                      </div>
                    )}
                  </div>

                  {item.fuel_capacity > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Fuel className="h-3 w-3" />
                      <span>{item.fuel_capacity}L</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{item.last_location.address}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(item)}
                        title="Ver detalles"
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {currentUser?.role === 'administrador' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          title="Editar"
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {currentUser?.role === 'administrador' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          title="Eliminar"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1 pt-4">
            {currentPage > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-8 px-3 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 font-medium mr-1"
              >
                Anterior
              </Button>
            )}
            {Array.from({ length: Math.min(9, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 9) {
                pageNum = i + 1
              } else if (currentPage <= 5) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 4) {
                pageNum = totalPages - 8 + i
              } else {
                pageNum = currentPage - 4 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 p-0 rounded-md font-medium transition-all duration-200 ${currentPage === pageNum
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md border-transparent'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700'
                    }`}
                >
                  {pageNum}
                </Button>
              )
            })}

            {currentPage < totalPages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8 px-3 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 font-medium ml-1"
              >
                Siguiente
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredMachinery.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron maquinarias</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedMachinery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Eliminar Maquinaria</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                ¿Estás seguro de que quieres eliminar la maquinaria{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{selectedMachinery.brand} {selectedMachinery.model}</span>?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Patente: {selectedMachinery.patent}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista de detalles */}
      {selectedMachinery && !showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {getTypeIcon(selectedMachinery.type)}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedMachinery.brand} {selectedMachinery.model}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Patente: {selectedMachinery.patent}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMachinery(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Carrusel de imágenes en el modal */}
            {selectedMachinery.images && selectedMachinery.images.length > 0 && (
              <div className="mb-6">
                <ImageCarousel
                  images={selectedMachinery.images}
                  machineryName={`${selectedMachinery.brand} ${selectedMachinery.model}`}
                  showThumbnails={true}
                  className="w-full"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Patente:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedMachinery.patent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Año:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedMachinery.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{getTypeLabel(selectedMachinery.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                      <Badge variant={getStatusBadgeVariant(selectedMachinery.status)}>
                        {getStatusLabel(selectedMachinery.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Especificaciones Técnicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Horas Totales:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatHours(selectedMachinery.total_hours)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Costo por Hora:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCLP(selectedMachinery.hourly_cost)}</span>
                    </div>
                    {selectedMachinery.fuel_capacity > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Capacidad Combustible:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedMachinery.fuel_capacity}L</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ubicación Actual</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedMachinery.last_location.address}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Fecha de Registro</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(selectedMachinery.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <AuditLogViewer tableName="machinery" recordId={selectedMachinery.id} />
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setSelectedMachinery(null)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleEdit(selectedMachinery)}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mapa de maquinarias */}
      {showMap && (
        <MachineryMap
          machinery={machinery}
          onClose={() => setShowMap(false)}
        />
      )}

      {/* Modal de Nueva Maquinaria */}
      {showNewMachineryModal && (
        <NewMachineryModal
          onClose={() => setShowNewMachineryModal(false)}
          addMachinery={addMachinery}
        />
      )}

      {/* Modal de Editar Maquinaria */}
      {showEditMachineryModal && machineryToEdit && (
        <EditMachineryModal
          machinery={machineryToEdit}
          onClose={() => {
            setShowEditMachineryModal(false)
            setMachineryToEdit(null)
          }}
          updateMachinery={updateMachinery}
        />
      )}
    </div>
  )
}

// Esquema de validación para el formulario de maquinaria
const machinerySchema = z.object({
  patent: z.string().min(1, 'La patente es requerida'),
  type: z.enum(['tractor', 'implemento', 'camion', 'cosechadora', 'pulverizador', 'sembradora'], {
    message: 'El tipo de maquinaria es requerido',
  }),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().min(1900, 'El año debe ser válido').max(new Date().getFullYear() + 1, 'El año no puede ser futuro'),
  total_hours: z.number().min(0, 'Las horas totales no pueden ser negativas'),
  status: z.enum(['disponible', 'en_faena', 'en_mantencion', 'fuera_servicio'], {
    message: 'El estado es requerido',
  }),
  fuel_capacity: z.number().min(0, 'La capacidad de combustible no puede ser negativa'),
  hourly_cost: z.number().min(0, 'El costo por hora no puede ser negativo'),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    alt: z.string(),
    is_primary: z.boolean(),
  })).optional(),
  last_location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1, 'La dirección es requerida'),
  }),
})

type MachineryFormData = z.infer<typeof machinerySchema>

// Componente Modal de Nueva Maquinaria
function NewMachineryModal({
  onClose,
  addMachinery,
}: {
  onClose: () => void
  addMachinery: (machinery: any) => void
}) {
  const [images, setImages] = useState<MachineryImage[]>([])

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MachineryFormData>({
    resolver: zodResolver(machinerySchema),
    defaultValues: {
      patent: '',
      type: 'tractor',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      total_hours: 0,
      status: 'disponible',
      fuel_capacity: 0,
      hourly_cost: 0,
      images: [],
      last_location: {
        lat: -39.7500,
        lng: -73.1800,
        address: '',
      },
    },
  })

  const onSubmit = (data: MachineryFormData) => {
    const imagesToSave = images && images.length > 0
      ? JSON.parse(JSON.stringify(images))
      : []

    const newMachinery = {
      ...data,
      code: '',
      images: imagesToSave,
      id: Math.floor(Math.random() * 10000) + 1000,
      created_at: new Date().toISOString(),
    }

    addMachinery(newMachinery)
    toast.success('Maquinaria agregada exitosamente!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full mx-auto space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header mejorado */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Nueva Maquinaria</h1>
                <p className="text-blue-100 text-sm">Registra una nueva maquinaria en el inventario</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Información Principal */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Principal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patente */}
                <div className="space-y-2">
                  <Label htmlFor="patent" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Patente *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="patent"
                      {...register('patent')}
                      placeholder="Ej: JKL012"
                      className={`h-11 pl-10 ${errors.patent ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.patent && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.patent.message}</span></p>}
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Tipo de Maquinaria *</span>
                  </Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={`h-11 ${errors.type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                          <SelectValue placeholder="Selecciona un tipo" className="dark:text-gray-400" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="tractor" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Tractor</SelectItem>
                          <SelectItem value="implemento" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Implemento</SelectItem>
                          <SelectItem value="camion" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Camión</SelectItem>
                          <SelectItem value="cosechadora" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Cosechadora</SelectItem>
                          <SelectItem value="pulverizador" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Pulverizador</SelectItem>
                          <SelectItem value="sembradora" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Sembradora</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.type.message}</span></p>}
                </div>

                {/* Marca */}
                <div className="space-y-2">
                  <Label htmlFor="brand" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Marca *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="brand"
                      {...register('brand')}
                      placeholder="Ej: John Deere"
                      className={`h-11 pl-10 ${errors.brand ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.brand && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.brand.message}</span></p>}
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <Label htmlFor="model" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Modelo *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="model"
                      {...register('model')}
                      placeholder="Ej: 6120M"
                      className={`h-11 pl-10 ${errors.model ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.model && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.model.message}</span></p>}
                </div>

                {/* Año */}
                <div className="space-y-2">
                  <Label htmlFor="year" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Año *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="year"
                      type="number"
                      {...register('year', { valueAsNumber: true })}
                      placeholder="Ej: 2023"
                      className={`h-11 pl-10 ${errors.year ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.year && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.year.message}</span></p>}
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Estado *</span>
                  </Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={`h-11 ${errors.status ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                          <SelectValue placeholder="Selecciona un estado" className="dark:text-gray-400" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="disponible" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Disponible</SelectItem>
                          <SelectItem value="en_faena" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">En Faena</SelectItem>
                          <SelectItem value="en_mantencion" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">En Mantención</SelectItem>
                          <SelectItem value="fuera_servicio" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Fuera de Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.status.message}</span></p>}
                </div>

                {/* Horas Totales */}
                <div className="space-y-2">
                  <Label htmlFor="total_hours" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Horas Totales</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="total_hours"
                      type="number"
                      {...register('total_hours', { valueAsNumber: true })}
                      placeholder="Ej: 2500"
                      className={`h-11 pl-10 ${errors.total_hours ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.total_hours && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.total_hours.message}</span></p>}
                </div>

                {/* Capacidad de Combustible */}
                <div className="space-y-2">
                  <Label htmlFor="fuel_capacity" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Fuel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Capacidad de Combustible (L)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="fuel_capacity"
                      type="number"
                      {...register('fuel_capacity', { valueAsNumber: true })}
                      placeholder="Ej: 120"
                      className={`h-11 pl-10 ${errors.fuel_capacity ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.fuel_capacity && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.fuel_capacity.message}</span></p>}
                </div>

                {/* Costo por Hora */}
                <div className="space-y-2">
                  <Label htmlFor="hourly_cost" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Costo por Hora ($)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="hourly_cost"
                      type="number"
                      {...register('hourly_cost', { valueAsNumber: true })}
                      placeholder="Ej: 45000"
                      className={`h-11 pl-10 ${errors.hourly_cost ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.hourly_cost && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.hourly_cost.message}</span></p>}
                </div>

                {/* Ubicación */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Ubicación Actual *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="address"
                      {...register('last_location.address')}
                      placeholder="Ej: Camino a Melipilla Km 15, San Antonio"
                      className={`h-11 pl-10 ${errors.last_location?.address ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.last_location?.address && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.last_location.address.message}</span></p>}
                </div>
              </div>
            </div>

            {/* Carga de imágenes */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <ImageUpload
                images={images}
                onChange={setImages}
                maxImages={10}
                label="Imágenes de la Maquinaria"
              />
            </div>

            {/* Botones de Acción Mejorados */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 h-11 text-sm font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Guardar Maquinaria
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Componente Modal de Editar Maquinaria
function EditMachineryModal({
  machinery,
  onClose,
  updateMachinery,
}: {
  machinery: Machinery
  onClose: () => void
  updateMachinery: (id: number, machinery: Partial<Machinery>) => void
}) {
  const { currentUser } = useApp()
  const [images, setImages] = useState<MachineryImage[]>([])

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MachineryFormData>({
    resolver: zodResolver(machinerySchema),
    defaultValues: {
      patent: machinery.patent,
      type: machinery.type,
      brand: machinery.brand,
      model: machinery.model,
      year: machinery.year,
      total_hours: machinery.total_hours,
      status: machinery.status,
      fuel_capacity: machinery.fuel_capacity,
      hourly_cost: machinery.hourly_cost,
      images: machinery.images || [],
      last_location: machinery.last_location,
    },
  })

  useEffect(() => {
    reset({
      patent: machinery.patent,
      type: machinery.type,
      brand: machinery.brand,
      model: machinery.model,
      year: machinery.year,
      total_hours: machinery.total_hours,
      status: machinery.status,
      fuel_capacity: machinery.fuel_capacity,
      hourly_cost: machinery.hourly_cost,
      images: machinery.images || [],
      last_location: machinery.last_location,
    })
    if (machinery.images && machinery.images.length > 0) {
      setImages(JSON.parse(JSON.stringify(machinery.images)))
    } else {
      setImages([])
    }
  }, [machinery, reset])

  const onSubmit = (data: MachineryFormData) => {
    const imagesToSave = images && images.length > 0
      ? JSON.parse(JSON.stringify(images))
      : []

    const updatedMachinery: Partial<Machinery> = {
      ...data,
      images: imagesToSave,
    }

    updateMachinery(machinery.id, updatedMachinery)
    toast.success('Maquinaria actualizada exitosamente!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full mx-auto space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header mejorado */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Editar Maquinaria: {machinery.brand} {machinery.model}</h1>
                <p className="text-blue-100 text-sm">Actualiza la información de la maquinaria</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Información Principal */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Principal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patente */}
                <div className="space-y-2">
                  <Label htmlFor="edit_patent" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Patente *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_patent"
                      {...register('patent')}
                      placeholder="Ej: JKL012"
                      className={`h-11 pl-10 ${errors.patent ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.patent && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.patent.message}</span></p>}
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="edit_type" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Tipo de Maquinaria *</span>
                  </Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={`h-11 ${errors.type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                          <SelectValue placeholder="Selecciona un tipo" className="dark:text-gray-400" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="tractor" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Tractor</SelectItem>
                          <SelectItem value="implemento" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Implemento</SelectItem>
                          <SelectItem value="camion" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Camión</SelectItem>
                          <SelectItem value="cosechadora" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Cosechadora</SelectItem>
                          <SelectItem value="pulverizador" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Pulverizador</SelectItem>
                          <SelectItem value="sembradora" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Sembradora</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.type.message}</span></p>}
                </div>

                {/* Marca */}
                <div className="space-y-2">
                  <Label htmlFor="edit_brand" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Marca *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_brand"
                      {...register('brand')}
                      placeholder="Ej: John Deere"
                      className={`h-11 pl-10 ${errors.brand ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.brand && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.brand.message}</span></p>}
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <Label htmlFor="edit_model" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Modelo *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_model"
                      {...register('model')}
                      placeholder="Ej: 6120M"
                      className={`h-11 pl-10 ${errors.model ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.model && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.model.message}</span></p>}
                </div>

                {/* Año */}
                <div className="space-y-2">
                  <Label htmlFor="edit_year" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Año *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_year"
                      type="number"
                      {...register('year', { valueAsNumber: true })}
                      placeholder="Ej: 2023"
                      className={`h-11 pl-10 ${errors.year ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.year && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.year.message}</span></p>}
                </div>

                {/* Estado */}
                {/* Estado - READ ONLY */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit_status" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Estado *</span>
                    </Label>
                    <span className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Automático
                    </span>
                  </div>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} disabled={true}>
                        <SelectTrigger className="h-11 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-80">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="en_faena">En Faena</SelectItem>
                          <SelectItem value="en_mantencion">En Mantención</SelectItem>
                          <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    El estado cambia automáticamente gestión de mantenimientos (inicio/fin) y asignación de trabajos.
                  </p>
                </div>

                {/* Horas Totales */}
                <div className="space-y-2">
                  <Label htmlFor="edit_total_hours" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Horas Totales</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_total_hours"
                      type="number"
                      {...register('total_hours', { valueAsNumber: true })}
                      placeholder="Ej: 2500"
                      className={`h-11 pl-10 ${errors.total_hours ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.total_hours && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.total_hours.message}</span></p>}
                </div>

                {/* Capacidad de Combustible */}
                <div className="space-y-2">
                  <Label htmlFor="edit_fuel_capacity" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Fuel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Capacidad de Combustible (L)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_fuel_capacity"
                      type="number"
                      {...register('fuel_capacity', { valueAsNumber: true })}
                      placeholder="Ej: 120"
                      className={`h-11 pl-10 ${errors.fuel_capacity ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.fuel_capacity && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.fuel_capacity.message}</span></p>}
                </div>

                {/* Costo por Hora */}
                {currentUser?.role === 'administrador' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit_hourly_cost" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Costo por Hora ($)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="edit_hourly_cost"
                        type="number"
                        {...register('hourly_cost', { valueAsNumber: true })}
                        placeholder="Ej: 45000"
                        className={`h-11 pl-10 ${errors.hourly_cost ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                      />
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.hourly_cost && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.hourly_cost.message}</span></p>}
                  </div>
                )}

                {/* Ubicación */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit_address" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Ubicación Actual *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_address"
                      {...register('last_location.address')}
                      placeholder="Ej: Camino a Melipilla Km 15, San Antonio"
                      className={`h-11 pl-10 ${errors.last_location?.address ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.last_location?.address && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.last_location.address.message}</span></p>}
                </div>
              </div>
            </div>

            {/* Carga de imágenes */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <ImageUpload
                images={images}
                onChange={setImages}
                maxImages={10}
                label="Imágenes de la Maquinaria"
              />
            </div>

            {/* Botones de Acción Mejorados */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 h-11 text-sm font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
