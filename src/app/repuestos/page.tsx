'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Calendar,
  Package, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, TrendingDown, BarChart3, Warehouse,
  ShoppingCart, ArrowUpDown, X, ChevronLeft, ChevronRight, ClipboardList,
  Info, Tag, Box, DollarSign, Truck, Settings, Building2, Save
} from 'lucide-react'
import { formatCLP, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useApp } from '@/contexts/AppContext'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface SparePart {
  id: number
  description: string
  category: string
  current_stock: number
  minimum_stock: number
  unit_cost: number
  supplier: string
  location?: string
  last_restock?: string
  machinery_id?: number | null
  machinery_brand?: string | null
  machinery_model?: string | null
  created_at: string
}

interface PartMovement {
  id: number
  part_id: number
  part_description: string
  movement_type: 'entrada' | 'salida'
  quantity: number
  reason: string
  work_order_id: string | null
  operator: string
  date: string
  created_at: string
}

import { useSearchParams } from 'next/navigation'

export default function RepuestosPage() {
  const searchParams = useSearchParams()
  const { spareParts, deleteSparePart, updateSparePart, machinery, partMovements, deletePartMovement, workOrders } = useApp()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>(searchParams.get('filter') === 'low' ? 'low' : 'all')
  const [machineryFilter, setMachineryFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory')
  const [selectedSparePart, setSelectedSparePart] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [showNewSparePartModal, setShowNewSparePartModal] = useState(false)
  const [showEditSparePartModal, setShowEditSparePartModal] = useState(false)
  const [sparePartToEdit, setSparePartToEdit] = useState<any>(null)
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageMovements, setCurrentPageMovements] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    setLoading(false)
  }, [])

  // CRUD Functions
  const handleEdit = (sparePart: any) => {
    setSparePartToEdit(sparePart)
    setShowEditSparePartModal(true)
    setSelectedSparePart(null)
  }

  const handleView = (sparePart: any) => {
    setSelectedSparePart(sparePart)
  }

  const handleDelete = (sparePart: any) => {
    setSelectedSparePart(sparePart)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedSparePart) {
      deleteSparePart(selectedSparePart.id)
      setShowDeleteModal(false)
      setSelectedSparePart(null)
    }
  }

  const filteredSpareParts = spareParts.filter(part => {
    // Buscar solo por nombre (description), no por código
    const matchesSearch = searchTerm === '' ||
      part.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && part.current_stock <= part.minimum_stock) ||
      (stockFilter === 'normal' && part.current_stock > part.minimum_stock)
    const matchesMachinery = machineryFilter === 'all' ||
      (machineryFilter !== 'all' && part.machinery_id !== null && part.machinery_id !== undefined && part.machinery_id.toString() === machineryFilter)

    return matchesSearch && matchesCategory && matchesStock && matchesMachinery
  })

  // Calcular paginación para inventario
  const totalPages = Math.ceil(filteredSpareParts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSpareParts = filteredSpareParts.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, stockFilter, machineryFilter])

  const totalParts = spareParts.length
  const lowStockParts = spareParts.filter(part => part.current_stock <= part.minimum_stock).length
  const totalValue = spareParts.reduce((sum, part) => sum + (part.current_stock * part.unit_cost), 0)
  const totalMovements = partMovements.length

  // Filtrar y paginar movimientos
  const sortedMovements = [...partMovements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const totalPagesMovements = Math.ceil(sortedMovements.length / itemsPerPage)
  const startIndexMovements = (currentPageMovements - 1) * itemsPerPage
  const endIndexMovements = startIndexMovements + itemsPerPage
  const paginatedMovements = sortedMovements.slice(startIndexMovements, endIndexMovements)

  // Resetear página de movimientos cuando cambia el tab
  useEffect(() => {
    setCurrentPageMovements(1)
  }, [activeTab])

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum) return 'low'
    if (current <= minimum * 1.5) return 'warning'
    return 'good'
  }

  const getStockIcon = (current: number, minimum: number) => {
    const status = getStockStatus(current, minimum)
    switch (status) {
      case 'low':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStockBadgeVariant = (current: number, minimum: number) => {
    const status = getStockStatus(current, minimum)
    switch (status) {
      case 'low':
        return 'danger' as const
      case 'warning':
        return 'warning' as const
      case 'good':
        return 'success' as const
    }
  }

  const getStockLabel = (current: number, minimum: number) => {
    const status = getStockStatus(current, minimum)
    switch (status) {
      case 'low':
        return 'Stock Bajo'
      case 'warning':
        return 'Stock Regular'
      case 'good':
        return 'Stock Bueno'
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Repuestos</h1>
          <p className="text-gray-600 dark:text-gray-300">Control de inventario y movimientos de repuestos</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            className="flex items-center space-x-2 h-10 px-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-colors shadow-sm hover:shadow-md"
            onClick={() => setShowNewSparePartModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Repuesto</span>
          </button>
        </div>
      </div>

      {/* Tabs - Debajo de barra buscadora */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'inventory'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          Inventario
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'movements'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          Movimientos
        </button>
      </div>

      {/* Filtros y búsqueda - PRIMERO */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre del repuesto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">Todas las categorías</option>
                <option value="Filtros">Filtros</option>
                <option value="Encendido">Encendido</option>
                <option value="Lubricantes">Lubricantes</option>
                <option value="Transmisión">Transmisión</option>
                <option value="Frenos">Frenos</option>
              </select>
            </div>

            <div>
              <select
                value={machineryFilter}
                onChange={(e) => setMachineryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">Todas las maquinarias</option>
                {machinery.map((mach) => (
                  <option key={mach.id} value={mach.id.toString()}>
                    {mach.brand} {mach.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">Todos los stocks</option>
                <option value="low">Stock Bajo</option>
                <option value="normal">Stock Normal</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido según tab activo */}
      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          {/* Grid de repuestos - formato compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedSpareParts.map((part) => (
              <Card key={part.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStockIcon(part.current_stock, part.minimum_stock)}
                      <div>
                        <CardTitle className="text-base">{part.description}</CardTitle>
                      </div>
                    </div>
                    <Badge variant={getStockBadgeVariant(part.current_stock, part.minimum_stock)} size="sm">
                      {getStockLabel(part.current_stock, part.minimum_stock)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Categoría</p>
                      <p className="font-medium">{part.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stock Actual</p>
                      <p className="font-medium">{part.current_stock} unidades</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stock Mínimo</p>
                      <p className="font-medium">{part.minimum_stock} unidades</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Costo Unitario</p>
                      <p className="font-medium text-xs">{formatCLP(part.unit_cost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valor Total</p>
                      <p className="font-medium text-xs">{formatCLP(part.current_stock * part.unit_cost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Proveedor</p>
                      <p className="font-medium text-xs truncate">{part.supplier}</p>
                    </div>
                  </div>

                  {part.machinery_brand && part.machinery_model && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Package className="h-3 w-3" />
                      <span className="truncate">Para: {part.machinery_brand} {part.machinery_model}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(part)}
                        title="Ver detalles"
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(part)}
                        title="Editar"
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(part)}
                        title="Eliminar"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setMovementType('entrada')
                  setShowMovementModal(true)
                }}
                className="h-10 px-4 text-sm font-semibold rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 inline-flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Entrada
              </button>
              <button
                type="button"
                onClick={() => {
                  setMovementType('salida')
                  setShowMovementModal(true)
                }}
                className="h-10 px-4 text-sm font-semibold rounded-xl border-2 border-red-500 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 inline-flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Salida
              </button>
            </div>
          </div>

          {partMovements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron movimientos</h3>
                <p className="text-gray-500">Registra el primer movimiento de repuestos</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Grid de movimientos - formato compacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedMovements.map((movement) => (
                  <Card key={movement.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {movement.movement_type === 'entrada' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <CardTitle className="text-base">{movement.part_description}</CardTitle>
                          </div>
                        </div>
                        <Badge variant={movement.movement_type === 'entrada' ? 'success' : 'danger'} size="sm">
                          {movement.movement_type === 'entrada' ? 'Entrada' : 'Salida'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Cantidad</p>
                          <p className="font-medium">{movement.quantity} unidades</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Operador</p>
                          <p className="font-medium text-xs truncate">{movement.operator}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fecha</p>
                          <p className="font-medium text-xs">{formatDate(movement.date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Motivo</p>
                          <p className="font-medium text-xs truncate">{movement.reason}</p>
                        </div>
                      </div>

                      {movement.work_order_id && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <ClipboardList className="h-3 w-3" />
                          <span>OT: {movement.work_order_id}</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('¿Estás seguro de eliminar este movimiento?')) {
                                deletePartMovement(movement.id)
                              }
                            }}
                            title="Eliminar"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginación para movimientos */}
              {totalPagesMovements > 1 && (
                <div className="flex items-center justify-center space-x-1 pt-4">
                  {currentPageMovements > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageMovements(prev => Math.max(1, prev - 1))}
                      className="h-8 px-3 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 font-medium mr-1"
                    >
                      Anterior
                    </Button>
                  )}
                  {Array.from({ length: Math.min(9, totalPagesMovements) }, (_, i) => {
                    let pageNum
                    if (totalPagesMovements <= 9) {
                      pageNum = i + 1
                    } else if (currentPageMovements <= 5) {
                      pageNum = i + 1
                    } else if (currentPageMovements >= totalPagesMovements - 4) {
                      pageNum = totalPagesMovements - 8 + i
                    } else {
                      pageNum = currentPageMovements - 4 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPageMovements === pageNum ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPageMovements(pageNum)}
                        className={`h-8 w-8 p-0 rounded-md font-medium ${currentPageMovements === pageNum
                          ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700'
                          }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  {currentPageMovements < totalPagesMovements && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageMovements(prev => Math.min(totalPagesMovements, prev + 1))}
                      className="h-8 px-3 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 font-medium ml-1"
                    >
                      Siguiente
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {filteredSpareParts.length === 0 && activeTab === 'inventory' && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron repuestos</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}


      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedSparePart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Repuesto</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar el repuesto{' '}
                <span className="font-semibold">{selectedSparePart.description}</span>?
              </p>
              {selectedSparePart.machinery_brand && selectedSparePart.machinery_model && (
                <p className="text-sm text-blue-600 mt-2">
                  Para: {selectedSparePart.machinery_brand} {selectedSparePart.machinery_model}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista de detalles */}
      {selectedSparePart && !showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedSparePart.description}
                  </h3>
                  {selectedSparePart.machinery_brand && selectedSparePart.machinery_model && (
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      Para: {selectedSparePart.machinery_brand} {selectedSparePart.machinery_model}
                    </p>
                  )}
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {selectedSparePart.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSparePart(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedSparePart.category}</span>
                    </div>
                    {selectedSparePart.machinery_brand && selectedSparePart.machinery_model && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Para Maquinaria:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedSparePart.machinery_brand} {selectedSparePart.machinery_model}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Proveedor:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSparePart.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                      <Badge variant={getStockBadgeVariant(selectedSparePart.current_stock, selectedSparePart.minimum_stock)}>
                        {getStockLabel(selectedSparePart.current_stock, selectedSparePart.minimum_stock)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Stock</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Stock Actual:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSparePart.current_stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Stock Mínimo:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSparePart.minimum_stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Costo Unitario:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCLP(selectedSparePart.unit_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Valor Total:</span>
                      <span className="font-medium text-lg text-gray-900 dark:text-white">{formatCLP(selectedSparePart.current_stock * selectedSparePart.unit_cost)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedSparePart.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Fecha de Registro</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(selectedSparePart.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setSelectedSparePart(null)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleEdit(selectedSparePart)}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de registro de movimiento */}
      {showMovementModal && (
        <MovementModal
          type={movementType}
          spareParts={spareParts}
          workOrders={workOrders}
          onClose={() => setShowMovementModal(false)}
        />
      )}

      {/* Modal de nuevo repuesto */}
      {showNewSparePartModal && (
        <NewSparePartModal
          machinery={machinery}
          onClose={() => setShowNewSparePartModal(false)}
        />
      )}

      {/* Modal de editar repuesto */}
      {showEditSparePartModal && sparePartToEdit && (
        <EditSparePartModal
          sparePart={sparePartToEdit}
          machinery={machinery}
          onClose={() => {
            setShowEditSparePartModal(false)
            setSparePartToEdit(null)
          }}
          updateSparePart={updateSparePart}
        />
      )}
    </div>
  )
}

// Componente Modal de Movimiento
function MovementModal({
  type,
  spareParts,
  workOrders,
  onClose
}: {
  type: 'entrada' | 'salida'
  spareParts: any[]
  workOrders: any[]
  onClose: () => void
}) {
  const { addPartMovement } = useApp()
  const [selectedPartId, setSelectedPartId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [reason, setReason] = useState('')
  const [workOrderId, setWorkOrderId] = useState<string>('')
  const [operator, setOperator] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const selectedPart = spareParts.find(p => p.id === selectedPartId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPartId || !reason || !operator || !date) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }

    if (type === 'salida' && selectedPart && quantity > selectedPart.current_stock) {
      toast.error(`No hay suficiente stock. Stock disponible: ${selectedPart.current_stock} unidades`)
      return
    }

    addPartMovement({
      part_id: selectedPartId as number,
      part_description: selectedPart?.description || '',
      movement_type: type,
      quantity,
      reason,
      work_order_id: workOrderId || null,
      operator,
      date,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {type === 'entrada' ? (
              <TrendingUp className="h-8 w-8 text-green-500 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500 dark:text-red-400" />
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Registrar {type === 'entrada' ? 'Entrada' : 'Salida'} de Repuesto
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {type === 'entrada' ? 'Registra la entrada de repuestos al inventario' : 'Registra la salida de repuestos del inventario'}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="dark:text-gray-300 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Repuesto */}
            <div className="md:col-span-2">
              <Label htmlFor="part_id">Repuesto *</Label>
              <Select value={selectedPartId.toString()} onValueChange={(value) => setSelectedPartId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un repuesto" />
                </SelectTrigger>
                <SelectContent>
                  {spareParts.map((part) => (
                    <SelectItem key={part.id} value={part.id.toString()}>
                      {part.description} {part.machinery_brand && part.machinery_model && `(${part.machinery_brand} ${part.machinery_model})`}
                      {type === 'salida' && ` - Stock: ${part.current_stock}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPart && type === 'salida' && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Stock disponible: <span className="font-medium">{selectedPart.current_stock} unidades</span>
                </p>
              )}
            </div>

            {/* Cantidad */}
            <div>
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Operador */}
            <div>
              <Label htmlFor="operator">Operador *</Label>
              <Input
                id="operator"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="Nombre del operador"
                required
              />
            </div>

            {/* Orden de Trabajo (opcional) */}
            <div>
              <Label htmlFor="work_order_id">Orden de Trabajo (opcional)</Label>
              <Select value={workOrderId} onValueChange={setWorkOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una OT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin orden de trabajo</SelectItem>
                  {workOrders.map((wo) => (
                    <SelectItem key={wo.id} value={wo.id}>
                      {wo.id} - {wo.field_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Motivo */}
            <div className="md:col-span-2">
              <Label htmlFor="reason">Motivo *</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={type === 'entrada' ? 'Ej: Compra de proveedor, Recepción de pedido' : 'Ej: Uso en mantenimiento, Asignación a OT'}
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 px-4 text-sm font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/50 focus-visible:ring-offset-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 h-10 px-4 text-sm font-semibold rounded-xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${type === 'entrada'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus-visible:ring-green-500/50'
                : 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500/50'
                }`}
            >
              Registrar {type === 'entrada' ? 'Entrada' : 'Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Schema de validación para nuevo repuesto
const sparePartSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  current_stock: z.number().min(0, 'El stock actual no puede ser negativo'),
  minimum_stock: z.number().min(0, 'El stock mínimo no puede ser negativo'),
  unit_cost: z.number().min(0, 'El costo unitario no puede ser negativo'),
  supplier: z.string().min(1, 'El proveedor es requerido'),
  machinery_id: z.number().nullable().optional(),
})

type SparePartFormData = z.infer<typeof sparePartSchema>

// Componente Modal de Nuevo Repuesto
function NewSparePartModal({
  machinery,
  onClose
}: {
  machinery: any[]
  onClose: () => void
}) {
  const { addSparePart } = useApp()

  // Lista de proveedores
  const suppliers = [
    'Repuestos Agrícolas S.A.',
    'Distribuidora de Maquinaria Ltda.',
    'Agrorepuestos del Sur',
    'Futamq Parts & Service',
    'Repuestos John Deere Chile',
    'Distribuidora New Holland',
    'Agroservicios Valdivia',
    'Repuestos y Accesorios Agrícolas',
    'Distribuidora de Filtros S.A.',
    'Lubricantes y Repuestos del Campo',
    'Repuestos Universales',
    'Agroequipos y Repuestos',
    'Distribuidora Nacional de Repuestos',
    'Repuestos Especializados S.A.',
    'Otro'
  ]

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SparePartFormData>({
    resolver: zodResolver(sparePartSchema),
    defaultValues: {
      description: '',
      category: '',
      current_stock: 0,
      minimum_stock: 0,
      unit_cost: 0,
      supplier: '',
      machinery_id: null,
    },
  })

  const currentStock = watch('current_stock')
  const minimumStock = watch('minimum_stock')
  const unitCost = watch('unit_cost')
  const machineryId = watch('machinery_id')
  const isLowStock = currentStock <= minimumStock
  const totalValue = (currentStock || 0) * (unitCost || 0)

  const selectedMachinery = machineryId ? machinery.find(m => m.id === machineryId) : null

  const onSubmit = (data: SparePartFormData) => {
    const selectedMach = data.machinery_id ? machinery.find(m => m.id === data.machinery_id) : null
    const newSparePart = {
      ...data,
      machinery_id: data.machinery_id || null,
      machinery_brand: selectedMach?.brand || null,
      machinery_model: selectedMach?.model || null,
    }

    addSparePart(newSparePart)
    toast.success('Repuesto agregado exitosamente!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto border dark:border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 rounded-xl mb-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Nuevo Repuesto</h2>
                <p className="text-blue-100 dark:text-blue-200 text-sm">Completa la información para registrar un nuevo repuesto en el inventario</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              {/* Sección 1: Información Básica */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Básica</h3>
                </div>
                <div className="space-y-4">
                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Categoría *</span>
                    </Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-11 ${errors.category ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Filtros">Filtros</SelectItem>
                            <SelectItem value="Lubricantes">Lubricantes</SelectItem>
                            <SelectItem value="Encendido">Encendido</SelectItem>
                            <SelectItem value="Transmisión">Transmisión</SelectItem>
                            <SelectItem value="Frenos">Frenos</SelectItem>
                            <SelectItem value="Repuestos Motor">Repuestos Motor</SelectItem>
                            <SelectItem value="Repuestos Hidráulicos">Repuestos Hidráulicos</SelectItem>
                            <SelectItem value="Herramientas">Herramientas</SelectItem>
                            <SelectItem value="Otros">Otros</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.category.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Descripción del Repuesto *</span>
                    </Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="Ej: Filtro de aceite para motor John Deere 6120M"
                      className={`h-11 ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
                    />
                    {errors.description && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.description.message}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <Info className="h-3 w-3" />
                      <span>Nombre completo y descriptivo</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 2: Stock e Inventario */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Warehouse className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock e Inventario</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stock Actual */}
                  <div className="space-y-2">
                    <Label htmlFor="current_stock" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Box className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span>Stock Actual *</span>
                    </Label>
                    <Input
                      id="current_stock"
                      type="number"
                      min="0"
                      {...register('current_stock', { valueAsNumber: true })}
                      placeholder="0"
                      className={`h-11 ${errors.current_stock ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500'}`}
                    />
                    {errors.current_stock && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.current_stock.message}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad disponible</p>
                  </div>

                  {/* Stock Mínimo */}
                  <div className="space-y-2">
                    <Label htmlFor="minimum_stock" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <AlertTriangle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span>Stock Mínimo *</span>
                    </Label>
                    <Input
                      id="minimum_stock"
                      type="number"
                      min="0"
                      {...register('minimum_stock', { valueAsNumber: true })}
                      placeholder="0"
                      className={`h-11 ${errors.minimum_stock ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500'}`}
                    />
                    {errors.minimum_stock && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.minimum_stock.message}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nivel mínimo</p>
                  </div>
                </div>

                {/* Estado del stock */}
                <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Estado del Stock</span>
                    {currentStock > 0 && minimumStock > 0 ? (
                      isLowStock ? (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Bajo</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-semibold text-green-700 dark:text-green-300">Normal</span>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Sin definir</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              {/* Sección 3: Costos y Proveedor */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Costos y Proveedor</h3>
                </div>
                <div className="space-y-4">
                  {/* Costo Unitario */}
                  <div className="space-y-2">
                    <Label htmlFor="unit_cost" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span>Costo Unitario (CLP) *</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="unit_cost"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('unit_cost', { valueAsNumber: true })}
                        placeholder="0"
                        className={`h-11 pl-10 ${errors.unit_cost ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500'}`}
                      />
                    </div>
                    {errors.unit_cost && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.unit_cost.message}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Precio de compra por unidad</p>
                  </div>

                  {/* Proveedor */}
                  <div className="space-y-2">
                    <Label htmlFor="supplier" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span>Proveedor *</span>
                    </Label>
                    <Controller
                      name="supplier"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-11 ${errors.supplier ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500'}`}>
                            <SelectValue placeholder="Selecciona un proveedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier} value={supplier}>
                                {supplier}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.supplier && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.supplier.message}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Selecciona el proveedor o distribuidor</p>
                  </div>
                </div>
              </div>

              {/* Sección 4: Compatibilidad */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compatibilidad</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machinery_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Settings className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span>Maquinaria Compatible</span>
                  </Label>
                  <Controller
                    name="machinery_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))}
                        value={field.value?.toString() || 'none'}
                      >
                        <SelectTrigger className={`h-11 ${errors.machinery_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500'}`}>
                          {selectedMachinery ? (
                            <span className="text-gray-900 dark:text-white">
                              {selectedMachinery.brand} {selectedMachinery.model} - {selectedMachinery.code}
                            </span>
                          ) : (
                            <SelectValue placeholder="Selecciona una maquinaria (opcional)" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin maquinaria específica (Repuesto genérico)</SelectItem>
                          {machinery.map((mach) => (
                            <SelectItem key={mach.id} value={mach.id.toString()}>
                              {mach.brand} {mach.model} - {mach.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.machinery_id && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{errors.machinery_id.message}</span>
                    </p>
                  )}
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3 mt-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start space-x-2">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Importante:</strong> Selecciona la maquinaria específica para evitar usar repuestos incompatibles.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Valor */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
            <div className="relative p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-blue-600 dark:bg-blue-700 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Valor</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stock Actual</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{currentStock || 0} unidades</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Costo Unitario</p>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{formatCLP(unitCost || 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg p-4 text-white shadow-lg">
                  <p className="text-sm text-blue-100 mb-1">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCLP(totalValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 h-11 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/50 focus-visible:ring-offset-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Guardar Repuesto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente Modal de Editar Repuesto
function EditSparePartModal({
  sparePart,
  machinery,
  onClose,
  updateSparePart,
}: {
  sparePart: any
  machinery: any[]
  onClose: () => void
  updateSparePart: (id: number, sparePart: Partial<any>) => void
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(z.object({
      description: z.string().min(1, 'La descripción es requerida'),
      category: z.string().min(1, 'La categoría es requerida'),
      current_stock: z.number().min(0, 'El stock actual no puede ser negativo'),
      minimum_stock: z.number().min(0, 'El stock mínimo no puede ser negativo'),
      unit_cost: z.number().min(0, 'El costo unitario no puede ser negativo'),
      supplier: z.string().min(1, 'El proveedor es requerido'),
      machinery_id: z.number().nullable().optional(),
    })),
    defaultValues: {
      description: sparePart.description,
      category: sparePart.category,
      current_stock: sparePart.current_stock,
      minimum_stock: sparePart.minimum_stock,
      unit_cost: sparePart.unit_cost,
      supplier: sparePart.supplier,
      machinery_id: sparePart.machinery_id || null,
    },
  })

  useEffect(() => {
    reset({
      description: sparePart.description,
      category: sparePart.category,
      current_stock: sparePart.current_stock,
      minimum_stock: sparePart.minimum_stock,
      unit_cost: sparePart.unit_cost,
      supplier: sparePart.supplier,
      machinery_id: sparePart.machinery_id || null,
    })
  }, [sparePart, reset])

  const currentStock = watch('current_stock')
  const minimumStock = watch('minimum_stock')
  const unitCost = watch('unit_cost')
  const isLowStock = currentStock <= minimumStock
  const totalValue = (currentStock || 0) * (unitCost || 0)

  const onSubmit = (data: any) => {
    const selectedMachinery = data.machinery_id ? machinery.find(m => m.id === data.machinery_id) : null
    const updatedSparePart = {
      ...sparePart,
      ...data,
      machinery_id: data.machinery_id || null,
      machinery_brand: selectedMachinery?.brand || null,
      machinery_model: selectedMachinery?.model || null,
    }

    updateSparePart(sparePart.id, updatedSparePart)
    toast.success('Repuesto actualizado exitosamente!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full mx-auto space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header mejorado con banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Editar Repuesto</h1>
                <p className="text-blue-100 text-sm">{sparePart.description}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-6">
                {/* Sección 1: Información Básica */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Básica</h2>
                  </div>
                  <div className="space-y-4">
                    {/* Categoría */}
                    <div className="space-y-2">
                      <Label htmlFor="edit_category" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                        <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Categoría *</span>
                      </Label>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={`h-11 ${errors.category ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                              <SelectValue placeholder="Selecciona una categoría" className="dark:text-gray-400" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                              <SelectItem value="Filtros" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Filtros</SelectItem>
                              <SelectItem value="Lubricantes" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Lubricantes</SelectItem>
                              <SelectItem value="Encendido" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Encendido</SelectItem>
                              <SelectItem value="Transmisión" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Transmisión</SelectItem>
                              <SelectItem value="Frenos" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Frenos</SelectItem>
                              <SelectItem value="Repuestos Motor" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Repuestos Motor</SelectItem>
                              <SelectItem value="Repuestos Hidráulicos" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Repuestos Hidráulicos</SelectItem>
                              <SelectItem value="Herramientas" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Herramientas</SelectItem>
                              <SelectItem value="Otros" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Otros</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{errors.category.message as string}</span>
                        </p>
                      )}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                      <Label htmlFor="edit_description" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                        <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Descripción del Repuesto *</span>
                      </Label>
                      <Input
                        id="edit_description"
                        {...register('description')}
                        placeholder="Ej: Filtro de aceite para motor John Deere 6120M"
                        className={`h-11 ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{errors.description.message as string}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                        <Info className="h-3 w-3" />
                        <span>Nombre completo y descriptivo</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Stock e Inventario */}
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <Warehouse className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock e Inventario</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stock Actual */}
                    <div className="space-y-2">
                      <Label htmlFor="edit_current_stock" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                        <Box className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Stock Actual *</span>
                      </Label>
                      <Input
                        id="edit_current_stock"
                        type="number"
                        min="0"
                        {...register('current_stock', { valueAsNumber: true })}
                        placeholder="0"
                        className={`h-11 ${errors.current_stock ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-green-500 dark:focus:border-green-500`}
                      />
                      {errors.current_stock && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{errors.current_stock.message as string}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad disponible</p>
                    </div>

                    {/* Stock Mínimo */}
                    <div className="space-y-2">
                      <Label htmlFor="edit_minimum_stock" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                        <AlertTriangle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Stock Mínimo *</span>
                      </Label>
                      <Input
                        id="edit_minimum_stock"
                        type="number"
                        min="0"
                        {...register('minimum_stock', { valueAsNumber: true })}
                        placeholder="0"
                        className={`h-11 ${errors.minimum_stock ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-green-500 dark:focus:border-green-500`}
                      />
                      {errors.minimum_stock && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{errors.minimum_stock.message as string}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nivel mínimo</p>
                    </div>
                  </div>

                  {/* Resumen de valor */}
                  {(currentStock > 0 || unitCost > 0) && (
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Valor Total Inventario</span>
                        </div>
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          ${totalValue.toLocaleString('es-CL')}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        {currentStock || 0} unidades × ${(unitCost || 0).toLocaleString('es-CL')} c/u
                      </p>
                    </div>
                  )}

                  {/* Estado del stock */}
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Estado del Stock</span>
                      {currentStock > 0 && minimumStock > 0 ? (
                        isLowStock ? (
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Bajo</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-300">Normal</span>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Sin definir</span>
                      )}
                    </div>
                    {currentStock > 0 && minimumStock > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progreso</span>
                          <span>{Math.min(100, Math.round((currentStock / minimumStock) * 100))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${isLowStock ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-green-500 dark:bg-green-600'
                              }`}
                            style={{ width: `${Math.min(100, (currentStock / minimumStock) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alerta de stock bajo */}
                  {isLowStock && currentStock > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-yellow-800 dark:text-yellow-300 font-semibold text-sm">Alerta: Stock Bajo</p>
                          <p className="text-yellow-700 dark:text-yellow-400 text-xs mt-1">
                            Stock actual ({currentStock}) ≤ mínimo ({minimumStock})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">
                {/* Sección 3: Costos y Proveedor */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Costos y Proveedor</h2>
                  </div>
                  <div className="space-y-4">
                    {/* Costo Unitario */}
                    <div className="space-y-2">
                      <Label htmlFor="edit_unit_cost" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                        <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span>Costo Unitario (CLP) *</span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="edit_unit_cost"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register('unit_cost', { valueAsNumber: true })}
                          placeholder="0"
                          className={`h-11 pl-10 ${errors.unit_cost ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-purple-500 dark:focus:border-purple-500`}
                        />
                      </div>
                      {errors.unit_cost && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{errors.unit_cost.message as string}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">Precio de compra por unidad</p>
                    </div>

                    {/* Proveedor */}
                    <div className="space-y-2">
                      <Label htmlFor="edit_supplier" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                        <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span>Proveedor *</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="edit_supplier"
                          {...register('supplier')}
                          placeholder="Ej: Repuestos Agrícolas S.A."
                          className={`h-11 pl-10 ${errors.supplier ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-purple-500 dark:focus:border-purple-500`}
                        />
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.supplier && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{errors.supplier.message as string}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nombre del proveedor o distribuidor</p>
                    </div>
                  </div>
                </div>

                {/* Sección 4: Compatibilidad */}
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compatibilidad</h2>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_machinery_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <Settings className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span>Maquinaria Compatible</span>
                    </Label>
                    <Controller
                      name="machinery_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))}
                          value={field.value?.toString() || 'none'}
                        >
                          <SelectTrigger className={`h-11 ${errors.machinery_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500`}>
                            <SelectValue placeholder="Selecciona una maquinaria (opcional)" className="dark:text-gray-400" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="none" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Sin maquinaria específica (Repuesto genérico)</SelectItem>
                            {machinery.map((mach) => (
                              <SelectItem key={mach.id} value={mach.id.toString()} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                                {mach.brand} {mach.model} - {mach.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.machinery_id && (
                      <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.machinery_id.message as string}</span>
                      </p>
                    )}
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                      <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start space-x-2">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Importante:</strong> Selecciona la maquinaria específica para evitar usar repuestos incompatibles.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de Valor Mejorado */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 rounded-xl border border-blue-200/50 dark:border-gray-600/50 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full -ml-12 -mb-12"></div>
              <div className="relative p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-blue-600 dark:bg-blue-600 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Valor</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 dark:bg-gray-600/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-500/80">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Stock Actual</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{currentStock || 0} unidades</p>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-600/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-500/80">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Costo Unitario</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{formatCLP(unitCost || 0)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg p-4 text-white shadow-lg">
                    <p className="text-sm text-blue-100 mb-1">Valor Total</p>
                    <p className="text-2xl font-bold">{formatCLP(totalValue)}</p>
                  </div>
                </div>
              </div>
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
                className="px-8 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

