'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Plus, Search, Filter, Edit, Trash2, ClipboardList,
  Calendar, User, MapPin, Clock, TrendingUp, AlertTriangle, X,
  ChevronDown, ChevronRight, ChevronLeft, Eye, Activity
} from 'lucide-react'
import { formatCLP, formatDate, formatHectares, formatHours } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { WorkOrder, Machinery } from '@/contexts/AppContext'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from 'react-hot-toast'
import { NewOrderModal, EditOrderModal } from './modals'

import { useSearchParams } from 'next/navigation'

export default function OrdenesTrabajoPage() {
  const searchParams = useSearchParams()
  const { workOrders, deleteWorkOrder, addWorkOrder, updateWorkOrder, machinery } = useApp()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [showEditOrderModal, setShowEditOrderModal] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<WorkOrder | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const statsCardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(false)
  }, [])

  // Deseleccionar filtros al hacer clic fuera de las tarjetas de estadísticas
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statsCardsRef.current && !statsCardsRef.current.contains(event.target as Node)) {
        // Solo deseleccionar si no se está haciendo clic en un input, select o botón
        const target = event.target as HTMLElement
        if (!target.closest('input') && !target.closest('select') && !target.closest('button') && !target.closest('[role="button"]')) {
          setStatusFilter('all')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.field_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.task_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.assigned_operator.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter

    // Si hay búsqueda activa, mostrar todas las órdenes que coincidan (incluyendo completadas y canceladas)
    // La búsqueda puede encontrar cualquier orden sin importar su estado
    if (searchTerm.length > 0) {
      // Si hay un filtro de estado específico, aplicarlo
      if (statusFilter !== 'all' && statusFilter !== '') {
        return matchesSearch && order.status === statusFilter && matchesPriority
      }
      // Si no hay filtro de estado, mostrar todas las que coincidan con la búsqueda
      return matchesSearch && matchesPriority
    }

    // Si no hay búsqueda activa y el filtro es 'all' o está vacío, mostrar solo órdenes activas
    // Excluir completadas y canceladas del total
    if (statusFilter === 'all' || statusFilter === '') {
      const isActiveStatus = order.status === 'en_ejecucion' ||
        order.status === 'planificada' ||
        order.status === 'retrasada' ||
        order.status === 'detenida'
      return matchesSearch && matchesPriority && isActiveStatus
    }

    // Para filtros específicos, mostrar solo las que coinciden con el estado
    const matchesStatus = order.status === statusFilter

    return matchesSearch && matchesStatus && matchesPriority
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Calcular paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, priorityFilter])

  const handleEdit = (order: WorkOrder) => {
    setOrderToEdit(order)
    setShowEditOrderModal(true)
    setSelectedOrder(null)
  }

  const handleView = (order: WorkOrder) => {
    setSelectedOrder(order)
  }

  const toggleRow = (orderId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleDelete = (order: WorkOrder) => {
    setSelectedOrder(order)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedOrder) {
      deleteWorkOrder(selectedOrder.id)
      setShowDeleteModal(false)
      setSelectedOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada':
        return 'success'
      case 'en_ejecucion':
        return 'info'
      case 'retrasada':
        return 'danger'
      case 'planificada':
        return 'default'
      case 'detenida':
        return 'warning'
      case 'cancelada':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'planificada': 'Planificada',
      'en_ejecucion': 'En Ejecución',
      'detenida': 'Detenida',
      'completada': 'Completada',
      'retrasada': 'Atrasada',
      'cancelada': 'Cancelada'
    }
    return labels[status] || status
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica':
        return 'danger'
      case 'alta':
        return 'warning'
      case 'media':
        return 'info'
      case 'baja':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'critica': 'Crítica'
    }
    return labels[priority] || priority
  }

  // Total de órdenes activas (excluyendo completadas y canceladas)
  const totalOrders = workOrders.filter(o =>
    o.status !== 'completada' && o.status !== 'cancelada'
  ).length
  const delayedOrders = workOrders.filter(o => o.status === 'retrasada').length
  const activeOrders = workOrders.filter(o => o.status === 'en_ejecucion').length
  const completedOrders = workOrders.filter(o => o.status === 'completada').length
  const plannedOrders = workOrders.filter(o => o.status === 'planificada').length

  if (loading) {
    return (
      <div className="p-6">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Órdenes de Trabajo</h1>
          <p className="text-gray-700 dark:text-gray-300">Gestiona y monitorea las órdenes de trabajo</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Orden</span>
          </button>
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
                placeholder="Buscar por ID, campo, tipo, operador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setSearchTerm('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="planificada">Planificada</option>
                <option value="en_ejecucion">En Ejecución</option>
                <option value="completada">Completada</option>
                <option value="retrasada">Atrasada</option>
              </select>
            </div>

            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todas las prioridades</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas - Total, Atrasadas, En Ejecución, Completadas, Planificadas */}
      <div ref={statsCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {/* Total Órdenes */}
        <div
          className="cursor-pointer transition-all duration-300"
          onClick={() => {
            // Si ya está en 'all', mantenerlo (no hacer nada visual, pero quitar cualquier otro filtro)
            setStatusFilter('all')
            setSearchTerm('')
          }}
        >
          <Card className={`transition-all duration-300 rounded-2xl ${statusFilter === 'all' || statusFilter === '' ? '' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:bg-gray-800/90 dark:border-gray-700 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-white mb-1">Total Órdenes</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-white">{totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atrasadas */}
        <div
          className="cursor-pointer transition-all duration-300"
          onClick={() => {
            // Si ya está seleccionado, deseleccionar
            if (statusFilter === 'retrasada') {
              setStatusFilter('all')
            } else {
              setStatusFilter('retrasada')
            }
            setSearchTerm('')
          }}
        >
          <Card className={`transition-all duration-300 rounded-2xl ${statusFilter === 'retrasada' ? 'ring-2 ring-red-500 shadow-xl' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 dark:bg-gray-800/90 dark:border-gray-700 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-white mb-1">Atrasadas</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-white">{delayedOrders}</p>
                </div>
                <div className="p-3 bg-red-500 dark:bg-red-600 rounded-xl shadow-lg">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* En Ejecución */}
        <div
          className="cursor-pointer transition-all duration-300"
          onClick={() => {
            // Si ya está seleccionado, deseleccionar
            if (statusFilter === 'en_ejecucion') {
              setStatusFilter('all')
            } else {
              setStatusFilter('en_ejecucion')
            }
            setSearchTerm('')
          }}
        >
          <Card className={`transition-all duration-300 rounded-2xl ${statusFilter === 'en_ejecucion' ? 'ring-2 ring-yellow-500 shadow-xl' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:bg-gray-800/90 dark:border-gray-700 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-700 dark:text-white mb-1">En Ejecución</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-white">{activeOrders}</p>
                </div>
                <div className="p-3 bg-yellow-500 dark:bg-yellow-600 rounded-xl shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Planificadas */}
        <div
          className="cursor-pointer transition-all duration-300"
          onClick={() => {
            // Si ya está seleccionado, deseleccionar
            if (statusFilter === 'planificada') {
              setStatusFilter('all')
            } else {
              setStatusFilter('planificada')
            }
            setSearchTerm('')
          }}
        >
          <Card className={`transition-all duration-300 rounded-2xl ${statusFilter === 'planificada' ? 'ring-2 ring-purple-500 shadow-xl' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:bg-gray-800/90 dark:border-gray-700 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-700 dark:text-white mb-1">Planificadas</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-white">{plannedOrders}</p>
                </div>
                <div className="p-3 bg-purple-500 dark:bg-purple-600 rounded-xl shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completadas */}
        <div
          className="cursor-pointer transition-all duration-300"
          onClick={() => {
            // Si ya está seleccionado, deseleccionar
            if (statusFilter === 'completada') {
              setStatusFilter('all')
            } else {
              setStatusFilter('completada')
            }
            setSearchTerm('')
          }}
        >
          <Card className={`transition-all duration-300 rounded-2xl ${statusFilter === 'completada' ? 'ring-2 ring-green-500 shadow-xl' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:bg-gray-800/90 dark:border-gray-700 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-white mb-1">Completadas</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-white">{completedOrders}</p>
                </div>
                <div className="p-3 bg-green-500 dark:bg-green-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de órdenes con paginación - formato compacto */}
      <div className="space-y-6">
        {/* Grid de órdenes - formato compacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedOrders.map((order) => {
            // Mapeo de clientes
            const clients: { [key: number]: string } = {
              1: 'Agrícola San Antonio S.A.',
              2: 'Fundo El Carmen',
              3: 'Cooperativa Agrícola Los Ríos',
              4: 'Hacienda Santa Rosa',
              5: 'Agroindustria del Sur',
              6: 'Agrícola San José',
              7: 'Campo Verde Ltda.',
              8: 'Fundo Los Robles',
              9: 'Agrícola del Valle S.A.',
              10: 'Hacienda Los Alamos',
              11: 'Cooperativa Agrícola del Sur',
              12: 'Fundo La Esperanza',
              13: 'Agropecuaria Central',
              14: 'Hacienda El Mirador',
              15: 'Agrícola Los Pinos'
            }

            const clientName = clients[order.client_id] || `Cliente ${order.client_id}`

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-base">{order.id}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-medium">{formatDate(order.created_at)}</span>
                      <Badge variant={getStatusColor(order.status) as any} size="sm">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Campo</p>
                      <p className="font-medium text-xs truncate">{order.field_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cliente</p>
                      <p className="font-medium text-xs truncate">{clientName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="font-medium text-xs truncate">{order.task_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prioridad</p>
                      <Badge variant={getPriorityColor(order.priority) as any} size="sm">
                        {getPriorityLabel(order.priority)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500">Inicio</p>
                      <p className="font-medium text-xs">{formatDate(order.planned_start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fin</p>
                      <p className="font-medium text-xs">{formatDate(order.planned_end_date)}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 line-clamp-2">
                    {order.description}
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${order.progress_percentage >= 100 ? 'bg-green-500' :
                          order.progress_percentage >= 50 ? 'bg-blue-500' :
                            order.progress_percentage > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}
                        style={{ width: `${order.progress_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 min-w-[3rem]">{order.progress_percentage}%</span>
                  </div>

                  {order.assigned_operator && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <User className="h-3 w-3" />
                      <span className="truncate">{order.assigned_operator}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(order)}
                        title="Ver detalles"
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(order)}
                        title="Editar"
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(order)}
                        title="Eliminar"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
                className="h-8 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-white border-slate-600 font-medium mr-1"
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
                  className={`h-8 w-8 p-0 rounded-md font-medium ${currentPage === pageNum
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
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
                className="h-8 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-white border-slate-600 font-medium ml-1"
              >
                Siguiente
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron órdenes de trabajo</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Orden de Trabajo</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar la orden{' '}
                <span className="font-semibold">{selectedOrder.id}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Campo: {selectedOrder.field_name}
              </p>
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
      {selectedOrder && !showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <ClipboardList className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedOrder.id}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedOrder.field_name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
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
                      <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                      <Badge variant={getStatusColor(selectedOrder.status) as any}>
                        {getStatusLabel(selectedOrder.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Prioridad:</span>
                      <Badge variant={getPriorityColor(selectedOrder.priority) as any}>
                        {getPriorityLabel(selectedOrder.priority)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Tipo de Tarea:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.task_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Operador:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.assigned_operator}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Fechas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Inicio Planificado:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.planned_start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Fin Planificado:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.planned_end_date)}</span>
                    </div>
                    {selectedOrder.actual_start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Inicio Real:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.actual_start_date)}</span>
                      </div>
                    )}
                    {selectedOrder.actual_end_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Fin Real:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.actual_end_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Progreso</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Progreso:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-500 dark:bg-primary-600 h-2 rounded-full"
                        style={{ width: `${selectedOrder.progress_percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-3">
                      <span className="text-gray-500 dark:text-gray-400">Hectáreas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatHectares(selectedOrder.actual_hectares)} / {formatHectares(selectedOrder.target_hectares)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Horas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatHours(selectedOrder.actual_hours)} / {formatHours(selectedOrder.target_hours)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedOrder.description}</p>
                </div>
              </div>
            </div>

            {/* Reporte de Avance (View Mode) */}
            <div className="space-y-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 pb-2">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Reporte de Avance</h4>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Notas del Operador</Label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[80px]">
                    {selectedOrder.worker_notes ? (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">{selectedOrder.worker_notes}</p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">Sin notas del operador registradas.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-8 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nueva Orden */}
      {showNewOrderModal && (
        <NewOrderModal
          onClose={() => setShowNewOrderModal(false)}
          addWorkOrder={addWorkOrder}
          machinery={machinery}
        />
      )}

      {/* Modal de Editar Orden */}
      {showEditOrderModal && orderToEdit && (
        <EditOrderModal
          order={orderToEdit}
          onClose={() => {
            setShowEditOrderModal(false)
            setOrderToEdit(null)
          }}
          updateWorkOrder={updateWorkOrder}
          machinery={machinery}
        />
      )}
    </div>
  )
}
