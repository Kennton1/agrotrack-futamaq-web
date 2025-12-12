'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Wrench,
  Calendar, User, Clock, AlertTriangle, CheckCircle, X,
  BarChart3, TrendingUp, Download, RefreshCw,
  Droplet, Settings, Sparkles, Package, DollarSign, FileText, History, Truck, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Save
} from 'lucide-react'
import { formatCLP, formatDate, formatHours } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { Maintenance, MaintenanceItem } from '@/contexts/AppContext'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts'

export default function MantenimientosPage() {
  const { maintenances, deleteMaintenance, updateMaintenance, machinery, addMaintenance } = useApp()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all') // Filtro por estado
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'charts' | 'history'>('list')
  const [expandedMachinery, setExpandedMachinery] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [showNewMaintenanceModal, setShowNewMaintenanceModal] = useState(false)
  const [showEditMaintenanceModal, setShowEditMaintenanceModal] = useState(false)
  const [maintenanceToEdit, setMaintenanceToEdit] = useState<Maintenance | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detectar cambios en el tema
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark')
    }

    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => observer.disconnect()
  }, [])

  // CustomTooltip para modo oscuro
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div style={{
        backgroundColor: isDarkMode ? '#1F2937' : 'white',
        border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '12px',
        color: isDarkMode ? '#E7E9EA' : '#0F1419'
      }}>
        {label && (
          <p style={{
            margin: '0 0 8px 0',
            fontWeight: 'bold',
            color: isDarkMode ? '#E7E9EA' : '#0F1419'
          }}>
            {label}
          </p>
        )}
        {payload.map((entry: any, index: number) => {
          const formattedValue = formatter
            ? formatter(entry.value, entry.name)
            : entry.value
          return (
            <p key={index} style={{
              margin: '4px 0',
              color: isDarkMode ? '#E7E9EA' : '#0F1419'
            }}>
              <span style={{ color: entry.color }}>●</span> {entry.name}: {formattedValue}
            </p>
          )
        })}
      </div>
    )
  }

  useEffect(() => {
    setLoading(false)
  }, [])

  // Funciones auxiliares (definidas antes de su uso)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada':
        return 'success'
      case 'en_ejecucion':
        return 'info'
      case 'programada':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'programada': 'Programada',
      'en_ejecucion': 'En Ejecución',
      'completada': 'Completada'
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    return type === 'preventiva' ? 'Preventiva' : 'Correctiva'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica':
        return 'bg-red-200/60 text-red-800 border-red-300/60 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50'
      case 'alta':
        return 'bg-yellow-200/60 text-yellow-800 border-yellow-300/60 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50'
      case 'media':
        return 'bg-blue-200/60 text-blue-800 border-blue-300/60 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50'
      case 'baja':
        return 'bg-gray-200/60 text-gray-800 border-gray-300/60 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600/50'
      default:
        return 'bg-gray-200/60 text-gray-800 border-gray-300/60 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600/50'
    }
  }

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      'critica': 'Crítica',
      'alta': 'Alta',
      'media': 'Media',
      'baja': 'Baja'
    }
    return labels[priority] || priority
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'cambio_aceite':
        return <Droplet className="h-5 w-5 text-blue-500" />
      case 'cambio_correas':
        return <Settings className="h-5 w-5 text-gray-500" />
      case 'cambio_filtros':
        return <Package className="h-5 w-5 text-purple-500" />
      case 'limpieza':
        return <Sparkles className="h-5 w-5 text-green-500" />
      case 'inspeccion':
        return <Eye className="h-5 w-5 text-blue-500" />
      default:
        return <Wrench className="h-5 w-5 text-orange-500" />
    }
  }

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'completado':
        return 'bg-green-200/60 text-green-800 border-green-300/60 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50'
      case 'en_progreso':
        return 'bg-blue-200/60 text-blue-800 border-blue-300/60 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50'
      case 'pendiente':
        return 'bg-purple-200/60 text-purple-800 border-purple-300/60 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50'
      default:
        return 'bg-gray-200/60 text-gray-800 border-gray-300/60 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600/50'
    }
  }

  const getItemStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'completado': 'Completado',
      'en_progreso': 'En Progreso',
      'pendiente': 'Pendiente'
    }
    return labels[status] || status
  }

  // Filtrar mantenimientos: por defecto solo pendientes (no completados)
  const filteredMaintenances = useMemo(() => {
    return maintenances.filter(maint => {
      const matchesSearch = (maint.machinery_code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (maint.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (maint.technician?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || maint.type === typeFilter

      // Si el filtro es 'completada', mostrar solo completadas
      // Si el filtro es 'all', ocultar completadas por defecto
      // Si el filtro es otro estado específico, mostrar solo ese estado
      let matchesStatus = false
      if (statusFilter === 'completada') {
        matchesStatus = maint.status === 'completada'
      } else if (statusFilter === 'all') {
        matchesStatus = maint.status !== 'completada' // Ocultar completadas cuando se muestra "all"
      } else {
        matchesStatus = maint.status === statusFilter
      }

      return matchesSearch && matchesType && matchesStatus
    })
  }, [maintenances, searchTerm, typeFilter, statusFilter])

  // Calcular totalizaciones por máquina
  const totalsByMachinery = useMemo(() => {
    const totals: Record<number, { count: number; totalCost: number; machinery_code: string }> = {}

    filteredMaintenances.forEach(maint => {
      if (!totals[maint.machinery_id]) {
        totals[maint.machinery_id] = {
          count: 0,
          totalCost: 0,
          machinery_code: maint.machinery_code
        }
      }
      totals[maint.machinery_id].count++
      totals[maint.machinery_id].totalCost += maint.cost
    })

    return Object.entries(totals).map(([id, data]) => ({
      machinery_id: parseInt(id),
      ...data
    }))
  }, [filteredMaintenances])

  // Calcular totalizaciones por mes
  const totalsByMonth = useMemo(() => {
    const monthTotals: Record<string, { count: number; totalCost: number; label: string }> = {}

    filteredMaintenances.forEach(maint => {
      const date = new Date(maint.scheduled_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })

      if (!monthTotals[monthKey]) {
        monthTotals[monthKey] = { count: 0, totalCost: 0, label: monthLabel }
      }
      monthTotals[monthKey].count++
      monthTotals[monthKey].totalCost += maint.cost
    })

    return Object.entries(monthTotals)
      .map(([key, data]) => ({ month: key, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredMaintenances])

  // Calcular total del año
  const currentYear = new Date().getFullYear()
  const yearTotal = useMemo(() => {
    return filteredMaintenances
      .filter(m => new Date(m.scheduled_date).getFullYear() === currentYear)
      .reduce((sum, m) => sum + m.cost, 0)
  }, [filteredMaintenances, currentYear])

  const yearCount = useMemo(() => {
    return filteredMaintenances.filter(m =>
      new Date(m.scheduled_date).getFullYear() === currentYear
    ).length
  }, [filteredMaintenances, currentYear])

  // Calcular paginación
  const totalPages = Math.ceil(filteredMaintenances.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMaintenances = filteredMaintenances.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, statusFilter])

  // Datos para gráficos
  const chartDataByMonth = totalsByMonth.map(item => ({
    mes: item.label || item.month,
    cantidad: item.count,
    costo: item.totalCost
  }))

  const chartDataByMachinery = totalsByMachinery.map(item => {
    const mach = machinery.find(m => m.id === item.machinery_id)
    const machineryName = mach
      ? `${mach.brand} ${mach.model}`
      : item.machinery_code
    return {
      maquina: machineryName,
      cantidad: item.count,
      costo: item.totalCost
    }
  })

  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    filteredMaintenances.forEach(m => {
      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1
    })
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusLabel(status),
      value: count
    }))
  }, [filteredMaintenances])

  const handleEdit = (maintenance: Maintenance) => {
    setMaintenanceToEdit(maintenance)
    setShowEditMaintenanceModal(true)
  }

  const handleView = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance)
  }

  const handleDelete = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedMaintenance) {
      deleteMaintenance(selectedMaintenance.id)
      setShowDeleteModal(false)
      setSelectedMaintenance(null)
    }
  }

  const pendingMaintenances = maintenances.filter(m => m.status !== 'completada')
  const completedMaintenances = maintenances.filter(m => m.status === 'completada')
  const inProgressMaintenances = maintenances.filter(m => m.status === 'en_ejecucion')

  // Agrupar mantenimientos por maquinaria para el historial
  const maintenanceHistoryByMachinery = useMemo(() => {
    const grouped: Record<number, {
      machinery: typeof machinery[0] | undefined
      maintenances: Maintenance[]
      totalCost: number
      count: number
    }> = {}

    maintenances.forEach(maint => {
      if (!grouped[maint.machinery_id]) {
        grouped[maint.machinery_id] = {
          machinery: machinery.find(m => m.id === maint.machinery_id),
          maintenances: [],
          totalCost: 0,
          count: 0
        }
      }
      grouped[maint.machinery_id].maintenances.push(maint)
      grouped[maint.machinery_id].totalCost += maint.cost
      grouped[maint.machinery_id].count++
    })

    // Ordenar mantenimientos por fecha (más reciente primero)
    Object.values(grouped).forEach(group => {
      group.maintenances.sort((a, b) =>
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      )
    })

    return Object.values(grouped).sort((a, b) => b.count - a.count)
  }, [maintenances, machinery])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mantenimientos</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestiona y programa los mantenimientos de maquinaria</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              if (viewMode === 'list') setViewMode('charts')
              else if (viewMode === 'charts') setViewMode('history')
              else setViewMode('list')
            }}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors h-10"
          >
            {viewMode === 'list' ? <BarChart3 className="h-4 w-4" /> : viewMode === 'charts' ? <History className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            <span>
              {viewMode === 'list' ? 'Ver Gráficos' : viewMode === 'charts' ? 'Ver Historial' : 'Ver Lista'}
            </span>
          </Button>
          <button
            type="button"
            className="flex items-center space-x-2 h-10 px-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-colors shadow-sm hover:shadow-md"
            onClick={() => setShowNewMaintenanceModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Mantenimiento</span>
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
                placeholder="Buscar por código, descripción, técnico..."
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
                <option value="preventiva">Preventiva</option>
                <option value="correctiva">Correctiva</option>
              </select>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas - DESPUÉS de filtros - Solo se muestran cuando NO está en vista de historial */}
      {viewMode !== 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div
            className="cursor-pointer transition-all duration-300"
            onClick={() => {
              setStatusFilter('all')
              setSearchTerm('')
            }}
          >
            <Card className={`transition-all duration-300 rounded-xl ${statusFilter === 'all' ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-lg'}`}>
              <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Total Mantenimientos</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-white">{maintenances.length}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <Wrench className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className="cursor-pointer transition-all duration-300"
            onClick={() => {
              setStatusFilter('programada')
              setSearchTerm('')
            }}
          >
            <Card className={`transition-all duration-300 rounded-xl ${statusFilter === 'programada' ? 'ring-2 ring-gray-500 shadow-xl' : 'hover:shadow-lg'}`}>
              <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingMaintenances.length}</p>
                  </div>
                  <div className="p-3 bg-gray-500 rounded-xl shadow-lg">
                    <Wrench className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className="cursor-pointer transition-all duration-300"
            onClick={() => {
              setStatusFilter('completada')
              setSearchTerm('')
            }}
          >
            <Card className={`transition-all duration-300 rounded-xl ${statusFilter === 'completada' ? 'ring-2 ring-green-500 shadow-xl' : 'hover:shadow-lg'}`}>
              <CardContent className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Completados</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-white">{completedMaintenances.length}</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className="cursor-pointer transition-all duration-300"
            onClick={() => {
              setStatusFilter('en_ejecucion')
              setSearchTerm('')
            }}
          >
            <Card className={`transition-all duration-300 rounded-xl ${statusFilter === 'en_ejecucion' ? 'ring-2 ring-yellow-500 shadow-xl' : 'hover:shadow-lg'}`}>
              <CardContent className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">En Ejecución</p>
                    <p className="text-3xl font-bold text-yellow-900 dark:text-white">{inProgressMaintenances.length}</p>
                  </div>
                  <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Gráficos, Lista o Historial */}
      {viewMode === 'history' ? (
        /* Vista de Historial por Maquinaria */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Historial de Mantenimientos</h2>
              <p className="text-gray-600 dark:text-gray-300">Mantenimientos agrupados por maquinaria</p>
            </div>
          </div>

          {maintenanceHistoryByMachinery.length === 0 ? (
            <Card className="dark:bg-gray-800">
              <CardContent className="p-12 text-center">
                <History className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay historial disponible</h3>
                <p className="text-gray-500 dark:text-gray-400">Aún no se han registrado mantenimientos.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {maintenanceHistoryByMachinery.map((group) => {
                const mach = group.machinery
                const machineryName = mach
                  ? `${mach.brand} ${mach.model}`
                  : 'Maquinaria Desconocida'

                const machineryId = group.machinery?.id || 0
                const isExpanded = expandedMachinery.has(machineryId)

                const toggleExpand = (e: React.MouseEvent) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Toggle expand for machinery:', machineryId, 'Current expanded:', expandedMachinery)
                  setExpandedMachinery(prev => {
                    const newSet = new Set(prev)
                    if (newSet.has(machineryId)) {
                      newSet.delete(machineryId)
                    } else {
                      newSet.add(machineryId)
                    }
                    console.log('New expanded set:', newSet)
                    return newSet
                  })
                }

                return (
                  <Card key={machineryId} className="border border-gray-200 dark:border-gray-700 overflow-hidden dark:bg-gray-800">
                    <div
                      onClick={toggleExpand}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-colors"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl">
                              <Truck className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl dark:text-white">{machineryName}</CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {group.count} {group.count === 1 ? 'mantenimiento' : 'mantenimientos'} registrado{group.count === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-300">Costo Total</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCLP(group.totalCost)}</p>
                            </div>
                            <div className="p-2 hover:bg-blue-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </div>
                    {isExpanded && (
                      <CardContent className="p-6 dark:bg-gray-800">
                        <div className="space-y-4">
                          {group.maintenances.map((maint, index) => (
                            <Card
                              key={maint.id}
                              className={`border-l-4 ${maint.status === 'completada' ? 'border-l-green-500 dark:border-l-green-400' :
                                maint.status === 'en_ejecucion' ? 'border-l-blue-500 dark:border-l-blue-400' :
                                  'border-l-gray-400 dark:border-l-gray-500'
                                } bg-gray-50 dark:bg-gray-700`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <Badge
                                        variant={getStatusColor(maint.status) as any}
                                        className="text-xs font-medium"
                                      >
                                        {getStatusLabel(maint.status)}
                                      </Badge>
                                      <Badge variant="default" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                                        {getTypeLabel(maint.type)}
                                      </Badge>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(maint.scheduled_date)}
                                      </span>
                                      {maint.completion_date && (
                                        <>
                                          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Completado: {formatDate(maint.completion_date)}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{maint.description}</p>

                                    {/* Items de mantenimiento */}
                                    {maint.items && maint.items.length > 0 && (
                                      <div className="mt-3 space-y-2">
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Trabajos realizados:</p>
                                        <div className="space-y-1.5">
                                          {maint.items.map((item) => (
                                            <div
                                              key={item.id}
                                              className="flex items-start gap-2 text-xs bg-white dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500"
                                            >
                                              <div className="mt-0.5">
                                                {getItemTypeIcon(item.type)}
                                              </div>
                                              <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                {item.description && (
                                                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">{item.description}</p>
                                                )}
                                                {item.notes && (
                                                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 italic">Nota: {item.notes}</p>
                                                )}
                                              </div>
                                              <div className="text-right">
                                                <p className="font-semibold text-green-600 dark:text-green-400">{formatCLP(item.cost)}</p>
                                                {item.estimated_hours && (
                                                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                    {item.estimated_hours}h
                                                    {item.actual_hours && ` (${item.actual_hours}h reales)`}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Repuestos utilizados */}
                                    {maint.parts_used && maint.parts_used.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Repuestos utilizados:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {maint.parts_used.map((part, idx) => (
                                            <Badge key={idx} variant="default" size="sm" className="bg-white dark:bg-gray-600 dark:text-gray-200 text-xs">
                                              {part.part} {part.quantity > 1 && `(x${part.quantity})`}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center gap-1">
                                        <User className="h-3.5 w-3.5" />
                                        <span>{maint.technician}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{formatHours(maint.odometer_hours)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCLP(maint.cost)}</p>
                                    <button
                                      type="button"
                                      onClick={() => handleView(maint)}
                                      className="mt-2 h-7 text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                      Ver
                                    </button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      ) : viewMode === 'charts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de costos por mes */}
          <Card>
            <CardHeader>
              <CardTitle>Costo de Mantenimientos por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <CustomTooltip
                        active={active}
                        payload={payload}
                        label={label}
                        formatter={(value: number) => formatCLP(value)}
                      />
                    )}
                  />
                  <Legend
                    wrapperStyle={{ color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                  />
                  <Bar dataKey="costo" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de cantidad por máquina */}
          <Card>
            <CardHeader>
              <CardTitle>Cantidad de Mantenimientos por Máquina</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataByMachinery}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="maquina"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <CustomTooltip
                        active={active}
                        payload={payload}
                        label={label}
                      />
                    )}
                  />
                  <Legend
                    wrapperStyle={{ color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                  />
                  <Bar dataKey="cantidad" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de distribución por estado */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => (
                      <CustomTooltip
                        active={active}
                        payload={payload}
                        label=""
                      />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de tendencia de costos */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Costos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartDataByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <CustomTooltip
                        active={active}
                        payload={payload}
                        label={label}
                        formatter={(value: number) => formatCLP(value)}
                      />
                    )}
                  />
                  <Legend
                    wrapperStyle={{ color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                  />
                  <Line type="monotone" dataKey="costo" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Lista de mantenimientos - Formato compacto */
        <div className="space-y-6">
          {/* Grid de mantenimientos - formato compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedMaintenances.map((maint) => {
              const mach = machinery.find(m => m.id === maint.machinery_id)
              const machineryName = mach
                ? `${mach.brand} ${mach.model}${mach.patent ? ` (${mach.patent})` : ''}`
                : maint.machinery_code

              return (
                <Card key={maint.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wrench className="h-5 w-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-base">{machineryName}</CardTitle>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(maint.status) as any} size="sm">
                        {getStatusLabel(maint.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Tipo</p>
                        <p className="font-medium">{getTypeLabel(maint.type)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fecha</p>
                        <p className="font-medium text-xs">{formatDate(maint.scheduled_date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Técnico</p>
                        <p className="font-medium text-xs truncate">{maint.technician}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Horas</p>
                        <p className="font-medium">{formatHours(maint.odometer_hours)}</p>
                      </div>
                      {maint.cost > 0 && (
                        <>
                          <div>
                            <p className="text-gray-500">Costo</p>
                            <p className="font-medium text-xs">{formatCLP(maint.cost)}</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 line-clamp-2">
                      {maint.description}
                    </div>

                    <div className="flex justify-between pt-2 border-t">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(maint)}
                          title="Ver detalles"
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(maint)}
                          title="Editar"
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(maint)}
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
      )}

      {filteredMaintenances.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron mantenimientos</h3>
            <p className="text-gray-500">
              {statusFilter === 'completada'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay mantenimientos pendientes. Activa "Mostrar Completados" para ver todos.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Mantenimiento</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar el mantenimiento de{' '}
                <span className="font-semibold">
                  {(() => {
                    const mach = machinery.find(m => m.id === selectedMaintenance.machinery_id)
                    return mach
                      ? `${mach.brand} ${mach.model}${mach.patent ? ` (${mach.patent})` : ''}`
                      : selectedMaintenance.machinery_code
                  })()}
                </span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Tipo: {getTypeLabel(selectedMaintenance.type)}
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

      {/* Modal de vista de detalles - Diseño ordenado */}
      {selectedMaintenance && !showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del modal - más compacto */}
            <div className={`bg-gradient-to-r ${selectedMaintenance.type === 'preventiva'
              ? 'from-blue-500 to-blue-600'
              : 'from-orange-500 to-orange-600'
              } px-6 py-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {(() => {
                        const mach = machinery.find(m => m.id === selectedMaintenance.machinery_id)
                        return mach
                          ? `${mach.brand} ${mach.model}${mach.patent ? ` (${mach.patent})` : ''} - ${getTypeLabel(selectedMaintenance.type)}`
                          : `${selectedMaintenance.machinery_code} - ${getTypeLabel(selectedMaintenance.type)}`
                      })()}
                    </h3>
                    <p className="text-white/90 text-sm mt-0.5">{selectedMaintenance.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedMaintenance(null)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Contenido del modal - reorganizado */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Columna izquierda - Información General (con fecha y costo) */}
                <div className="lg:col-span-1">
                  <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 dark:text-white">
                        <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>Información General</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Estado:</span>
                        <Badge variant={getStatusColor(selectedMaintenance.status) as any} className="text-xs font-medium px-2 py-0.5">
                          {getStatusLabel(selectedMaintenance.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Tipo:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{getTypeLabel(selectedMaintenance.type)}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Técnico:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedMaintenance.technician}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Horas Odómetro:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatHours(selectedMaintenance.odometer_hours)}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Fecha Programada:</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(selectedMaintenance.scheduled_date)}</span>
                        </div>
                        {selectedMaintenance.completion_date && (
                          <div className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Fecha Completada:</span>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">{formatDate(selectedMaintenance.completion_date)}</span>
                          </div>
                        )}
                      </div>
                      {selectedMaintenance.cost > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Costo Total:</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCLP(selectedMaintenance.cost)}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            Suma de {selectedMaintenance.items?.length || 0} ítems
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Repuestos Utilizados */}
                  {selectedMaintenance.parts_used && selectedMaintenance.parts_used.length > 0 && (
                    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 dark:text-white">
                          <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span>Repuestos Utilizados</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1.5">
                          {selectedMaintenance.parts_used.map((part, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-600 rounded text-sm">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{part.part}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{part.quantity} unidades</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Columna derecha - Ítems de Mantenimiento */}
                <div className="lg:col-span-2 space-y-4">

                  {selectedMaintenance.items && selectedMaintenance.items.length > 0 && (
                    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between dark:text-white">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span>Ítems de Mantenimiento ({selectedMaintenance.items.length})</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedMaintenance.items.map((item) => {
                            const itemStatusColor = getItemStatusColor(item.status)
                            const priorityColor = getPriorityColor(item.priority)

                            return (
                              <div
                                key={item.id}
                                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${item.status === 'completado' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' :
                                  item.status === 'en_progreso' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' :
                                    'bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getItemTypeIcon(item.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                          <h5 className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</h5>
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${itemStatusColor}`}>
                                            {getItemStatusLabel(item.status)}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityColor}`}>
                                            {getPriorityLabel(item.priority)}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2.5">{item.description}</p>
                                      </div>
                                      <div className="flex-shrink-0 text-right">
                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{formatCLP(item.cost)}</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2 flex-wrap">
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>
                                          {item.estimated_hours}h estimadas
                                          {item.actual_hours && <span className="text-gray-500 dark:text-gray-500"> ({item.actual_hours}h reales)</span>}
                                        </span>
                                      </div>
                                      {item.assigned_technician && (
                                        <div className="flex items-center gap-1.5">
                                          <User className="h-3.5 w-3.5" />
                                          <span>{item.assigned_technician}</span>
                                        </div>
                                      )}
                                      {item.scheduled_date && (
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="h-3.5 w-3.5" />
                                          <span>Programado: {formatDate(item.scheduled_date)}</span>
                                        </div>
                                      )}
                                    </div>

                                    {item.notes && (
                                      <div className="mt-2.5 p-2 bg-white/70 dark:bg-gray-700/70 rounded border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-start gap-1.5">
                                          <FileText className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{item.notes}</p>
                                        </div>
                                      </div>
                                    )}

                                    {item.parts_required && item.parts_required.length > 0 && (
                                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                                        {item.parts_required.map((part, idx) => (
                                          <Badge key={idx} variant="default" size="sm" className="text-xs bg-white dark:bg-gray-600 dark:text-gray-200 border-gray-300 dark:border-gray-500">
                                            {part}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Footer del modal - más compacto */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMaintenance(null)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Mantenimiento */}
      {showNewMaintenanceModal && (
        <NewMaintenanceModal
          machinery={machinery}
          onClose={() => setShowNewMaintenanceModal(false)}
          addMaintenance={addMaintenance}
        />
      )}

      {/* Modal de Editar Mantenimiento */}
      {showEditMaintenanceModal && maintenanceToEdit && (
        <EditMaintenanceModal
          maintenance={maintenanceToEdit}
          machinery={machinery}
          onClose={() => {
            setShowEditMaintenanceModal(false)
            setMaintenanceToEdit(null)
          }}
          updateMaintenance={updateMaintenance}
        />
      )}
    </div>
  )
}

// Esquema de validación para el formulario de mantenimiento
const maintenanceSchema = z.object({
  machinery_id: z.number().min(1, 'La maquinaria es requerida'),
  type: z.enum(['preventiva', 'correctiva'], {
    message: 'El tipo de mantenimiento es requerido',
  }),
  status: z.enum(['programada', 'en_ejecucion', 'completada'], {
    message: 'El estado es requerido',
  }),
  scheduled_date: z.string().min(1, 'La fecha programada es requerida'),
  completion_date: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  technician: z.string().min(1, 'El técnico es requerido'),
  odometer_hours: z.number().min(0, 'Las horas del odómetro no pueden ser negativas'),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

interface MaintenanceItemForm {
  id: string
  name: string
  description: string
  type: 'cambio_aceite' | 'cambio_correas' | 'cambio_filtros' | 'ajuste' | 'limpieza' | 'inspeccion' | 'otro'
  cost: number
  estimated_hours: number
  priority: 'baja' | 'media' | 'alta' | 'critica'
  notes?: string
  parts_required?: string[]
  status?: 'pendiente' | 'en_progreso' | 'completado'
}

// Componente Modal de Nuevo Mantenimiento
function NewMaintenanceModal({
  machinery,
  onClose,
  addMaintenance,
}: {
  machinery: any[]
  onClose: () => void
  addMaintenance: (maintenance: any) => void
}) {
  const [items, setItems] = useState<MaintenanceItemForm[]>([])
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceItemForm | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      machinery_id: machinery.length > 0 ? machinery[0].id : 0,
      type: 'preventiva',
      status: 'programada',
      scheduled_date: new Date().toISOString().split('T')[0],
      completion_date: '',
      description: '',
      technician: '',
      odometer_hours: 0,
    },
  })

  useEffect(() => {
    if (machinery.length > 0) {
      reset({
        machinery_id: machinery[0].id,
        type: 'preventiva',
        status: 'programada',
        scheduled_date: new Date().toISOString().split('T')[0],
        completion_date: '',
        description: '',
        technician: '',
        odometer_hours: 0,
      })
    }
  }, [machinery, reset])

  const selectedMachineryId = watch('machinery_id')
  const selectedMachinery = machinery.find(m => m.id === selectedMachineryId)
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0)

  const handleAddItem = (item: MaintenanceItemForm) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? item : i))
      setEditingItem(null)
    } else {
      setItems([...items, item])
    }
    setShowItemModal(false)
  }

  const handleEditItem = (item: MaintenanceItemForm) => {
    setEditingItem(item)
    setShowItemModal(true)
  }

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId))
  }

  const onSubmit = (data: MaintenanceFormData) => {
    if (items.length === 0) {
      toast.error('Debe agregar al menos un ítem de mantenimiento')
      return
    }

    const selectedMachinery = machinery.find(m => m.id === data.machinery_id)
    if (!selectedMachinery) {
      toast.error('Maquinaria no encontrada')
      return
    }

    const maintenanceItems: MaintenanceItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      cost: item.cost,
      estimated_hours: item.estimated_hours,
      status: 'pendiente' as const,
      priority: item.priority,
      notes: item.notes,
      parts_required: item.parts_required,
      scheduled_date: data.scheduled_date,
      assigned_technician: data.technician,
    }))

    const partsUsed = items.flatMap(item =>
      (item.parts_required || []).map(part => ({ part, quantity: 1 }))
    )

    const newMaintenance = {
      machinery_id: data.machinery_id,
      machinery_code: `${selectedMachinery.brand} ${selectedMachinery.model}`,
      type: data.type,
      status: data.status,
      scheduled_date: data.scheduled_date,
      completion_date: data.completion_date || null,
      description: data.description,
      cost: totalCost,
      items: maintenanceItems,
      parts_used: partsUsed,
      technician: data.technician,
      odometer_hours: data.odometer_hours,
    }

    addMaintenance(newMaintenance)
    toast.success('Mantenimiento creado exitosamente!')
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
                <Wrench className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Nuevo Mantenimiento</h1>
                <p className="text-blue-100 text-sm">Registra un nuevo mantenimiento en el sistema</p>
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
                <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Principal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maquinaria */}
                <div className="space-y-2">
                  <Label htmlFor="machinery_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Maquinaria *</span>
                  </Label>
                  <Controller
                    name="machinery_id"
                    control={control}
                    render={({ field }) => {
                      const selectedMachinery = machinery.find(m => m.id === field.value)
                      return (
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value > 0 ? field.value.toString() : ''}>
                          <SelectTrigger className={`h-11 ${errors.machinery_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                            {selectedMachinery ? (
                              <span className="text-gray-900 dark:text-white">{selectedMachinery.brand} {selectedMachinery.model} ({selectedMachinery.patent})</span>
                            ) : (
                              <SelectValue placeholder="Selecciona una maquinaria" className="dark:text-gray-400" />
                            )}
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {machinery.map((mach) => (
                              <SelectItem key={mach.id} value={mach.id.toString()} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                                {mach.brand} {mach.model} ({mach.patent})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                  {errors.machinery_id && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.machinery_id.message}</span></p>}
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Tipo de Mantenimiento *</span>
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
                          <SelectItem value="preventiva" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Preventiva</SelectItem>
                          <SelectItem value="correctiva" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Correctiva</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.type.message}</span></p>}
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                          <SelectItem value="programada" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Programada</SelectItem>
                          <SelectItem value="en_ejecucion" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">En Ejecución</SelectItem>
                          <SelectItem value="completada" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Completada</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.status.message}</span></p>}
                </div>

                {/* Fecha Programada */}
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha Programada *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="scheduled_date"
                      type="date"
                      {...register('scheduled_date')}
                      className={`h-11 pl-10 ${errors.scheduled_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.scheduled_date && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.scheduled_date.message}</span></p>}
                </div>

                {/* Fecha de Completado */}
                <div className="space-y-2">
                  <Label htmlFor="completion_date" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha de Completado (Opcional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="completion_date"
                      type="date"
                      {...register('completion_date')}
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Técnico */}
                <div className="space-y-2">
                  <Label htmlFor="technician" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Técnico *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="technician"
                      {...register('technician')}
                      placeholder="Ej: Juan Pérez"
                      className={`h-11 pl-10 ${errors.technician ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.technician && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.technician.message}</span></p>}
                </div>

                {/* Horas Odómetro */}
                <div className="space-y-2">
                  <Label htmlFor="odometer_hours" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Horas Odómetro</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="odometer_hours"
                      type="number"
                      {...register('odometer_hours', { valueAsNumber: true })}
                      placeholder="Ej: 3500"
                      className={`h-11 pl-10 ${errors.odometer_hours ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.odometer_hours && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.odometer_hours.message}</span></p>}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Descripción *</span>
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe el trabajo de mantenimiento a realizar..."
                  className={`min-h-[120px] ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.description.message}</span></p>}
              </div>
            </div>

            {/* Items de Mantenimiento */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Ítems de Mantenimiento</span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Agrega los elementos a mantener (cambio de aceite, correas, etc.)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null)
                    setShowItemModal(true)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Ítem</span>
                </button>
              </div>
              {/* Resumen de costo total */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 dark:border-gray-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 dark:bg-blue-900/20"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full -ml-12 -mb-12 dark:bg-indigo-900/20"></div>
                <div className="relative p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg dark:bg-blue-800">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Costo Total</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Suma de {items.length} {items.length === 1 ? 'ítem' : 'ítems'}</p>
                    <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">{formatCLP(totalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Lista de items */}
              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow dark:bg-gray-700 dark:border-l-blue-400">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                              <Badge variant="default" size="sm" className="bg-gray-50 dark:bg-gray-600 dark:text-gray-200">
                                {item.type.replace('_', ' ')}
                              </Badge>
                              <Badge
                                variant={
                                  item.priority === 'critica' ? 'danger' :
                                    item.priority === 'alta' ? 'warning' :
                                      item.priority === 'media' ? 'info' : 'default'
                                }
                                size="sm"
                              >
                                {item.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-green-500 dark:text-green-400" />
                                <span className="text-gray-500 dark:text-gray-400">Costo:</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">{formatCLP(item.cost)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500 dark:text-gray-400">Horas:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{item.estimated_hours}h</span>
                              </div>
                            </div>
                            {item.notes && (
                              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
                                  <FileText className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span>{item.notes}</span>
                                </p>
                              </div>
                            )}
                            {item.parts_required && item.parts_required.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  Repuestos requeridos:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {item.parts_required.map((part, idx) => (
                                    <Badge key={idx} variant="default" size="sm" className="bg-white dark:bg-gray-600 dark:text-gray-200 text-xs">
                                      {part}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors flex items-center justify-center"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex items-center justify-center"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                  <CardContent className="p-12 text-center">
                    <div className="p-3 bg-gray-200 dark:bg-gray-600 rounded-full w-fit mx-auto mb-4">
                      <Wrench className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">No hay ítems agregados</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Haz clic en &quot;Agregar Ítem&quot; para comenzar</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Información de la maquinaria seleccionada */}
            {selectedMachinery && (
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 dark:border-gray-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 dark:bg-blue-900/20"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full -ml-12 -mb-12 dark:bg-indigo-900/20"></div>
                <div className="relative p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg dark:bg-blue-800">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Información de la Maquinaria</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-600/80">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Marca</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedMachinery.brand}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-600/80">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Modelo</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedMachinery.model}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 rounded-lg p-4 text-white shadow-lg">
                      <p className="text-sm text-blue-100 dark:text-blue-200 mb-1">Horas Actuales</p>
                      <p className="text-lg font-bold">{selectedMachinery.total_hours.toLocaleString()} hr</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                disabled={items.length === 0}
                className="px-8 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Mantenimiento
              </button>
            </div>
          </form>
        </div>

        {/* Modal para agregar/editar item */}
        {showItemModal && (
          <ItemModal
            item={editingItem}
            onSave={handleAddItem}
            onClose={() => {
              setShowItemModal(false)
              setEditingItem(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Componente modal para agregar/editar items
function ItemModal({
  item,
  onSave,
  onClose
}: {
  item: MaintenanceItemForm | null
  onSave: (item: MaintenanceItemForm) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<MaintenanceItemForm>({
    id: item?.id || `MI-${Date.now()}`,
    name: item?.name || '',
    description: item?.description || '',
    type: item?.type || 'cambio_aceite',
    cost: item?.cost || 0,
    estimated_hours: item?.estimated_hours || 0,
    priority: item?.priority || 'media',
    notes: item?.notes || '',
    parts_required: item?.parts_required || [],
  })
  const [partsInput, setPartsInput] = useState(item?.parts_required?.join(', ') || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.description || formData.cost <= 0) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    const parts = partsInput.split(',').map(p => p.trim()).filter(p => p)
    onSave({
      ...formData,
      parts_required: parts.length > 0 ? parts : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {item ? 'Editar Ítem' : 'Agregar Ítem de Mantenimiento'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item_name" className="text-gray-700 dark:text-gray-300">Nombre del Ítem *</Label>
            <Input
              id="item_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Cambio de aceite motor"
              required
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="item_description" className="text-gray-700 dark:text-gray-300">Descripción *</Label>
            <Textarea
              id="item_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el trabajo a realizar..."
              rows={3}
              required
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item_type" className="text-gray-700 dark:text-gray-300">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as MaintenanceItemForm['type'] })
                }
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue className="dark:text-gray-400" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="cambio_aceite" className="dark:text-gray-200 dark:hover:bg-gray-700">Cambio de Aceite</SelectItem>
                  <SelectItem value="cambio_correas" className="dark:text-gray-200 dark:hover:bg-gray-700">Cambio de Correas</SelectItem>
                  <SelectItem value="cambio_filtros" className="dark:text-gray-200 dark:hover:bg-gray-700">Cambio de Filtros</SelectItem>
                  <SelectItem value="ajuste" className="dark:text-gray-200 dark:hover:bg-gray-700">Ajuste</SelectItem>
                  <SelectItem value="limpieza" className="dark:text-gray-200 dark:hover:bg-gray-700">Limpieza</SelectItem>
                  <SelectItem value="inspeccion" className="dark:text-gray-200 dark:hover:bg-gray-700">Inspección</SelectItem>
                  <SelectItem value="otro" className="dark:text-gray-200 dark:hover:bg-gray-700">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item_priority" className="text-gray-700 dark:text-gray-300">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as MaintenanceItemForm['priority'] })
                }
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue className="dark:text-gray-400" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="baja" className="dark:text-gray-200 dark:hover:bg-gray-700">Baja</SelectItem>
                  <SelectItem value="media" className="dark:text-gray-200 dark:hover:bg-gray-700">Media</SelectItem>
                  <SelectItem value="alta" className="dark:text-gray-200 dark:hover:bg-gray-700">Alta</SelectItem>
                  <SelectItem value="critica" className="dark:text-gray-200 dark:hover:bg-gray-700">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item_cost" className="text-gray-700 dark:text-gray-300">Costo ($) *</Label>
              <Input
                id="item_cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="item_hours" className="text-gray-700 dark:text-gray-300">Horas Estimadas</Label>
              <Input
                id="item_hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.5"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="item_parts" className="text-gray-700 dark:text-gray-300">Repuestos Requeridos</Label>
            <Input
              id="item_parts"
              value={partsInput}
              onChange={(e) => setPartsInput(e.target.value)}
              placeholder="Separados por comas (Ej: Filtro de aceite, Aceite motor)"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separa los repuestos con comas</p>
          </div>

          <div>
            <Label htmlFor="item_notes" className="text-gray-700 dark:text-gray-300">Notas (Opcional)</Label>
            <Textarea
              id="item_notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={2}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              {item ? 'Guardar Cambios' : 'Agregar Ítem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente Modal de Editar Mantenimiento
function EditMaintenanceModal({
  maintenance,
  machinery,
  onClose,
  updateMaintenance,
}: {
  maintenance: Maintenance
  machinery: any[]
  onClose: () => void
  updateMaintenance: (id: number, maintenance: Partial<Maintenance>) => void
}) {
  const [items, setItems] = useState<MaintenanceItemForm[]>([])
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceItemForm | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      machinery_id: maintenance.machinery_id,
      type: maintenance.type,
      status: maintenance.status,
      scheduled_date: maintenance.scheduled_date.split('T')[0],
      completion_date: maintenance.completion_date ? maintenance.completion_date.split('T')[0] : '',
      description: maintenance.description,
      technician: maintenance.technician,
      odometer_hours: maintenance.odometer_hours,
    },
  })

  useEffect(() => {
    reset({
      machinery_id: maintenance.machinery_id,
      type: maintenance.type,
      status: maintenance.status,
      scheduled_date: maintenance.scheduled_date.split('T')[0],
      completion_date: maintenance.completion_date ? maintenance.completion_date.split('T')[0] : '',
      description: maintenance.description,
      technician: maintenance.technician,
      odometer_hours: maintenance.odometer_hours,
    })

    if (maintenance.items && maintenance.items.length > 0) {
      setItems(maintenance.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        cost: item.cost,
        estimated_hours: item.estimated_hours,
        priority: item.priority,
        notes: item.notes,
        parts_required: item.parts_required,
        status: item.status,
      })))
    }
  }, [maintenance, reset])

  const selectedMachineryId = watch('machinery_id')
  const selectedMachinery = machinery.find(m => m.id === selectedMachineryId)
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0)

  const handleAddItem = (item: MaintenanceItemForm) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? item : i))
      setEditingItem(null)
    } else {
      setItems([...items, item])
    }
    setShowItemModal(false)
  }

  const handleEditItem = (item: MaintenanceItemForm) => {
    setEditingItem(item)
    setShowItemModal(true)
  }

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId))
  }

  const onSubmit = (data: MaintenanceFormData) => {
    if (items.length === 0) {
      toast.error('Debe agregar al menos un ítem de mantenimiento')
      return
    }

    const selectedMachinery = machinery.find(m => m.id === data.machinery_id)
    if (!selectedMachinery) {
      toast.error('Maquinaria no encontrada')
      return
    }

    const maintenanceItems: MaintenanceItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      cost: item.cost,
      estimated_hours: item.estimated_hours,
      actual_hours: item.estimated_hours,
      status: 'pendiente' as const,
      priority: item.priority,
      notes: item.notes,
      parts_required: item.parts_required,
      scheduled_date: data.scheduled_date,
      assigned_technician: data.technician,
    }))

    const partsUsed = items.flatMap(item =>
      (item.parts_required || []).map(part => ({ part, quantity: 1 }))
    )

    const updatedMaintenance = {
      machinery_id: data.machinery_id,
      machinery_code: `${selectedMachinery.brand} ${selectedMachinery.model}`,
      type: data.type,
      status: data.status,
      scheduled_date: data.scheduled_date,
      completion_date: data.completion_date || null,
      description: data.description,
      cost: totalCost,
      items: maintenanceItems,
      parts_used: partsUsed,
      technician: data.technician,
      odometer_hours: data.odometer_hours,
    }

    updateMaintenance(maintenance.id, updatedMaintenance)
    toast.success('Mantenimiento actualizado exitosamente')
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
                <Wrench className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Editar Mantenimiento</h1>
                <p className="text-blue-100 text-sm">Modifica la información del mantenimiento {maintenance.machinery_code}</p>
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
                <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Principal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maquinaria */}
                <div className="space-y-2">
                  <Label htmlFor="edit_machinery_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Maquinaria *</span>
                  </Label>
                  <Controller
                    name="machinery_id"
                    control={control}
                    render={({ field }) => {
                      const selectedMachinery = machinery.find(m => m.id === field.value)
                      return (
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value > 0 ? field.value.toString() : ''}>
                          <SelectTrigger className={`h-11 ${errors.machinery_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                            {selectedMachinery ? (
                              <span className="text-gray-900 dark:text-white">{selectedMachinery.brand} {selectedMachinery.model} ({selectedMachinery.patent})</span>
                            ) : (
                              <SelectValue placeholder="Selecciona una maquinaria" className="dark:text-gray-400" />
                            )}
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {machinery.map((mach) => (
                              <SelectItem key={mach.id} value={mach.id.toString()} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                                {mach.brand} {mach.model} ({mach.patent})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                  {errors.machinery_id && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.machinery_id.message}</span></p>}
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="edit_type" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Tipo de Mantenimiento *</span>
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
                          <SelectItem value="preventiva" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Preventiva</SelectItem>
                          <SelectItem value="correctiva" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Correctiva</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.type.message}</span></p>}
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="edit_status" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                          <SelectItem value="programada" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Programada</SelectItem>
                          <SelectItem value="en_ejecucion" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">En Ejecución</SelectItem>
                          <SelectItem value="completada" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Completada</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.status.message}</span></p>}
                </div>

                {/* Fecha Programada */}
                <div className="space-y-2">
                  <Label htmlFor="edit_scheduled_date" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha Programada *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_scheduled_date"
                      type="date"
                      {...register('scheduled_date')}
                      className={`h-11 pl-10 ${errors.scheduled_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.scheduled_date && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.scheduled_date.message}</span></p>}
                </div>

                {/* Fecha de Completado */}
                <div className="space-y-2">
                  <Label htmlFor="edit_completion_date" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha de Completado (Opcional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_completion_date"
                      type="date"
                      {...register('completion_date')}
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Técnico */}
                <div className="space-y-2">
                  <Label htmlFor="edit_technician" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Técnico *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_technician"
                      {...register('technician')}
                      placeholder="Ej: Juan Pérez"
                      className={`h-11 pl-10 ${errors.technician ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.technician && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.technician.message}</span></p>}
                </div>

                {/* Horas Odómetro */}
                <div className="space-y-2">
                  <Label htmlFor="edit_odometer_hours" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Horas Odómetro</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_odometer_hours"
                      type="number"
                      {...register('odometer_hours', { valueAsNumber: true })}
                      placeholder="Ej: 3500"
                      className={`h-11 pl-10 ${errors.odometer_hours ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.odometer_hours && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.odometer_hours.message}</span></p>}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="edit_description" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Descripción *</span>
                </Label>
                <Textarea
                  id="edit_description"
                  {...register('description')}
                  placeholder="Describe el trabajo de mantenimiento a realizar..."
                  className={`min-h-[120px] ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.description.message}</span></p>}
              </div>
            </div>

            {/* Items de Mantenimiento */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Ítems de Mantenimiento</span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Agrega los elementos a mantener (cambio de aceite, correas, etc.)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null)
                    setShowItemModal(true)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Ítem
                </button>
              </div>

              {/* Resumen de costo total */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 rounded-xl border border-blue-200/50 dark:border-gray-600/50 shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full -ml-12 -mb-12"></div>
                <div className="relative p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-600 dark:bg-blue-600 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Costo Total</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Suma de {items.length} {items.length === 1 ? 'ítem' : 'ítems'}</p>
                    <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatCLP(totalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Lista de items */}
              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-blue-500 dark:border-l-blue-600 hover:shadow-md transition-shadow dark:bg-gray-700 dark:border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                              <Badge variant="default" size="sm" className="bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                                {item.type.replace('_', ' ')}
                              </Badge>
                              <Badge
                                variant={item.priority === 'critica' ? 'danger' : item.priority === 'alta' ? 'warning' : 'default'}
                                size="sm"
                              >
                                {item.priority}
                              </Badge>
                              <Badge variant="info" size="sm" className="dark:bg-blue-900/30 dark:text-blue-300">
                                {item.status || 'pendiente'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-700 dark:text-gray-200 font-medium">Costo: {formatCLP(item.cost)}</span>
                              <span className="text-gray-600 dark:text-gray-400">Horas: {item.estimated_hours}h</span>
                            </div>
                            {item.notes && (
                              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-600 rounded">
                                <p className="text-xs text-gray-600 dark:text-gray-300">{item.notes}</p>
                              </div>
                            )}
                            {item.parts_required && item.parts_required.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.parts_required.map((part, idx) => (
                                  <Badge key={idx} variant="default" size="sm" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                    {part}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors flex items-center justify-center"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors flex items-center justify-center"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No hay ítems agregados. Agrega al menos un ítem para continuar.</p>
                </div>
              )}
            </div>

            {/* Información de la Maquinaria */}
            {selectedMachinery && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 pb-4">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información de la Maquinaria</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Marca</Label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedMachinery.brand}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Modelo</Label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedMachinery.model}</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Label className="text-blue-700 dark:text-blue-300">Horas Actuales</Label>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatHours(selectedMachinery.total_hours)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de Acción */}
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

        {/* Modal para agregar/editar item */}
        {showItemModal && (
          <ItemModal
            item={editingItem}
            onSave={handleAddItem}
            onClose={() => {
              setShowItemModal(false)
              setEditingItem(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
