'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Calendar,
  Fuel, Truck, MapPin, DollarSign, Clock, User,
  TrendingUp, TrendingDown, BarChart3, X, Image as ImageIcon, Receipt, FileText, Camera, ChevronLeft, ChevronRight, Package, Save, AlertTriangle
} from 'lucide-react'
import { formatCLP, formatDate } from '@/lib/utils'
import { FuelLoadCard } from '@/components/combustible/FuelLoadCard'
import { FuelImageUpload } from '@/components/combustible/FuelImageUpload'
import { toast } from 'react-hot-toast'
import { useApp } from '@/contexts/AppContext'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { MOCK_FUEL_LOADS } from '@/data/mockData'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'

export default function CombustiblePage() {
  const { deleteFuelLoad, updateFuelLoad, machinery, fuelLoads, workOrders } = useApp()
  // Usar datos del contexto que incluyen las imágenes guardadas en localStorage
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedFuelLoad, setSelectedFuelLoad] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showNewFuelLoadModal, setShowNewFuelLoadModal] = useState(false)
  const [showEditFuelLoadModal, setShowEditFuelLoadModal] = useState(false)
  const [fuelLoadToEdit, setFuelLoadToEdit] = useState<any>(null)
  const [showCharts, setShowCharts] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<'7days' | 'weeks' | 'months'>('7days')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

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
            : entry.name === 'liters' || entry.name === 'Litros'
              ? `${entry.value}L`
              : entry.name === 'totalLiters' || entry.name === 'Litros Consumidos'
                ? `${entry.value.toFixed(1)}L`
                : formatCLP(entry.value)
          return (
            <p key={index} style={{
              margin: '4px 0',
              color: isDarkMode ? '#E7E9EA' : '#0F1419'
            }}>
              <span style={{ color: entry.color }}>●</span> {entry.name === 'liters' ? 'Litros' : entry.name === 'cost' ? 'Costo' : entry.name === 'totalLiters' ? 'Litros Consumidos' : entry.name === 'totalCost' ? 'Costo Total' : entry.name}: {formattedValue}
            </p>
          )
        })}
      </div>
    )
  }

  // CRUD Functions
  const handleEdit = (fuelLoad: any) => {
    setFuelLoadToEdit(fuelLoad)
    setShowEditFuelLoadModal(true)
    setSelectedFuelLoad(null)
  }

  const handleView = (fuelLoad: any) => {
    console.log('Fuel Load seleccionado:', fuelLoad)
    console.log('Tiene fuel_load_image?', !!fuelLoad.fuel_load_image)
    console.log('Tiene receipt_image?', !!fuelLoad.receipt_image)
    setSelectedFuelLoad(fuelLoad)
  }

  const handleDelete = (fuelLoad: any) => {
    setSelectedFuelLoad(fuelLoad)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedFuelLoad) {
      deleteFuelLoad(selectedFuelLoad.id)
      setShowDeleteModal(false)
      setSelectedFuelLoad(null)
    }
  }

  const filteredFuelLoads = fuelLoads.filter(load => {
    const matchesSearch = (load.machinery_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((load as any).operator_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((load as any).location || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSource = sourceFilter === 'all' || load.source === sourceFilter
    const matchesDate = dateFilter === 'all' ||
      (dateFilter === 'today' && load.date === new Date().toISOString().split('T')[0]) ||
      (dateFilter === 'week' && new Date(load.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesSource && matchesDate
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredFuelLoads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFuelLoads = filteredFuelLoads.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sourceFilter, dateFilter])

  const totalLiters = fuelLoads.reduce((sum, load) => sum + load.liters, 0)
  const totalCost = fuelLoads.reduce((sum, load) => sum + load.total_cost, 0)
  const averageCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0
  const todayLiters = fuelLoads.filter(load => load.date === new Date().toISOString().split('T')[0]).reduce((sum, load) => sum + load.liters, 0)

  const getSourceIcon = (source: string) => {
    return source === 'bodega' ? <MapPin className="h-4 w-4 text-blue-500" /> : <Fuel className="h-4 w-4 text-green-500" />
  }

  const getSourceBadgeVariant = (source: string) => {
    return source === 'bodega' ? 'info' as const : 'success' as const
  }

  const getSourceLabel = (source: string) => {
    return source === 'bodega' ? 'Bodega' : 'Estación'
  }

  // Función para calcular datos del gráfico según el período
  const getChartData = () => {
    const now = new Date()
    let startDate: Date
    let groupBy: 'day' | 'week' | 'month'

    switch (chartPeriod) {
      case '7days':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        groupBy = 'day'
        break
      case 'weeks':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 28) // 4 semanas
        groupBy = 'week'
        break
      case 'months':
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 6) // 6 meses
        groupBy = 'month'
        break
    }

    // Filtrar cargas dentro del período
    const periodLoads = fuelLoads.filter(load => {
      const loadDate = new Date(load.date)
      return loadDate >= startDate && loadDate <= now
    })

    // Agrupar por período
    const grouped: { [key: string]: { liters: number; cost: number } } = {}

    periodLoads.forEach(load => {
      const loadDate = new Date(load.date)
      let key: string

      if (groupBy === 'day') {
        key = loadDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
      } else if (groupBy === 'week') {
        const weekStart = new Date(loadDate)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        key = `Sem ${weekStart.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}`
      } else {
        key = loadDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
      }

      if (!grouped[key]) {
        grouped[key] = { liters: 0, cost: 0 }
      }
      grouped[key].liters += load.liters
      grouped[key].cost += load.total_cost
    })

    // Convertir a array y ordenar
    return Object.entries(grouped)
      .map(([period, data]) => ({
        period,
        liters: Math.round(data.liters * 10) / 10,
        cost: data.cost
      }))
      .sort((a, b) => {
        // Ordenar por fecha (aproximado)
        return a.period.localeCompare(b.period)
      })
  }

  const chartData = getChartData()

  // Función para calcular consumo y costo por maquinaria
  const getMachineryConsumption = () => {
    const consumptionByMachinery: {
      [key: number]: {
        machinery_id: number
        machinery_name: string
        machinery_code: string
        totalLiters: number
        totalCost: number
        loadCount: number
        averageCostPerLiter: number
      }
    } = {}

    fuelLoads.forEach(load => {
      if (!consumptionByMachinery[load.machinery_id]) {
        const mach = machinery.find(m => m.id === load.machinery_id)
        consumptionByMachinery[load.machinery_id] = {
          machinery_id: load.machinery_id,
          machinery_name: mach ? `${mach.brand} ${mach.model}` : load.machinery_code,
          machinery_code: load.machinery_code,
          totalLiters: 0,
          totalCost: 0,
          loadCount: 0,
          averageCostPerLiter: 0
        }
      }

      consumptionByMachinery[load.machinery_id].totalLiters += load.liters
      consumptionByMachinery[load.machinery_id].totalCost += load.total_cost
      consumptionByMachinery[load.machinery_id].loadCount += 1
    })

    // Calcular promedio de costo por litro
    Object.values(consumptionByMachinery).forEach(mach => {
      mach.averageCostPerLiter = mach.totalLiters > 0
        ? mach.totalCost / mach.totalLiters
        : 0
    })

    // Ordenar por consumo total (litros) descendente
    return Object.values(consumptionByMachinery)
      .sort((a, b) => b.totalLiters - a.totalLiters)
  }

  const machineryConsumption = getMachineryConsumption()

  // Colores para el gráfico
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

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
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Combustible</h1>
          <p className="text-gray-600 dark:text-gray-400">Control y seguimiento del consumo de combustible</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            className={`flex items-center space-x-2 h-10 px-4 text-sm font-semibold rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/50 focus-visible:ring-offset-2 ${showCharts
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            onClick={() => setShowCharts(!showCharts)}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Gráficos</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-2 h-10 px-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-colors shadow-sm hover:shadow-md"
            onClick={() => setShowNewFuelLoadModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Carga</span>
          </button>
        </div>
      </div>

      {!showCharts && (
        <>
          {/* Filtros y búsqueda - PRIMERO */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por maquinaria, operador, ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="all">Todas las fuentes</option>
                    <option value="bodega">Bodega</option>
                    <option value="estacion">Estación</option>
                  </select>
                </div>

                <div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="all">Todos los períodos</option>
                    <option value="today">Hoy</option>
                    <option value="week">Última semana</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas rápidas - DESPUÉS de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Litros</p>
                    <p className="text-2xl font-bold text-gray-900">{totalLiters.toLocaleString()}</p>
                  </div>
                  <Fuel className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Costo Total</p>
                    <p className="text-2xl font-bold text-green-600">{formatCLP(totalCost)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Costo Promedio/L</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCLP(averageCostPerLiter)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hoy</p>
                    <p className="text-2xl font-bold text-orange-600">{todayLiters}L</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de cargas de combustible - formato compacto */}
          <div className="space-y-6">
            {/* Grid de cargas - formato compacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedFuelLoads.map((load) => (
                <FuelLoadCard
                  key={load.id}
                  load={load}
                  machinery={machinery}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
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

          {filteredFuelLoads.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cargas de combustible</h3>
                <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {showCharts && (
        <>
          {/* Gráfico de consumo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>
                    Consumo de Combustible - {
                      chartPeriod === '7days' ? 'Últimos 7 días' :
                        chartPeriod === 'weeks' ? 'Últimas 4 semanas' :
                          'Últimos 6 meses'
                    }
                  </span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setChartPeriod('7days')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${chartPeriod === '7days'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    7 Días
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartPeriod('weeks')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${chartPeriod === 'weeks'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    Semanas
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartPeriod('months')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${chartPeriod === 'months'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    Meses
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                        <XAxis
                          dataKey="period"
                          stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                          fontSize={12}
                          tickFormatter={(value) => `${value}L`}
                          tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                          fontSize={12}
                          tickFormatter={(value) => formatCLP(value)}
                          tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => (
                            <CustomTooltip
                              active={active}
                              payload={payload}
                              label={label}
                              formatter={(value: any, name: string) => {
                                if (name === 'liters') {
                                  return [`${value}L`, 'Litros']
                                } else {
                                  return [formatCLP(value), 'Costo']
                                }
                              }}
                            />
                          )}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="liters"
                          name="Litros"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="cost"
                          name="Costo"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Consumido</p>
                      <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                        {chartData.reduce((sum, d) => sum + d.liters, 0).toFixed(1)}L
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Costo Total</p>
                      <p className="text-xl font-bold text-green-800 dark:text-green-300">
                        {formatCLP(chartData.reduce((sum, d) => sum + d.cost, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No hay datos disponibles para el período seleccionado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial de Consumo por Maquinaria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Consumo por Maquinaria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {machineryConsumption.length > 0 ? (
                <div className="space-y-6">
                  {/* Gráfico de barras */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={machineryConsumption} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                        <XAxis
                          dataKey="machinery_code"
                          stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                          fontSize={12}
                          tickFormatter={(value) => `${value}L`}
                          tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                          fontSize={12}
                          tickFormatter={(value) => formatCLP(value)}
                          tick={{ fill: isDarkMode ? "#9CA3AF" : "#64748b" }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null
                            const mach = machineryConsumption.find(m => m.machinery_code === label)
                            return (
                              <CustomTooltip
                                active={active}
                                payload={payload}
                                label={mach ? mach.machinery_name : label}
                                formatter={(value: any, name: string) => {
                                  if (name === 'totalLiters' || name === 'Litros Consumidos') {
                                    return [`${value.toFixed(1)}L`, 'Litros Consumidos']
                                  } else {
                                    return [formatCLP(value), 'Costo Total']
                                  }
                                }}
                              />
                            )
                          }}
                        />
                        <Legend
                          wrapperStyle={{ color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="totalLiters"
                          name="Litros Consumidos"
                          fill="#3b82f6"
                          radius={[8, 8, 0, 0]}
                        >
                          {machineryConsumption.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                        <Bar
                          yAxisId="right"
                          dataKey="totalCost"
                          name="Costo Total"
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                        >
                          {machineryConsumption.map((entry, index) => (
                            <Cell key={`cell-cost-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.7} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla de ranking */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Ranking de Consumo</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Maquinaria</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Código</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Litros</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Costo Total</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Costo/L</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Cargas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {machineryConsumption.map((mach, index) => (
                            <tr
                              key={mach.machinery_id}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                  index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                                    index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                                      'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                  }`}>
                                  {index + 1}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900 dark:text-white">{mach.machinery_name}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{mach.machinery_code}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-semibold text-blue-700 dark:text-blue-400">{mach.totalLiters.toFixed(1)}L</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-semibold text-green-700 dark:text-green-400">{formatCLP(mach.totalCost)}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{formatCLP(Math.round(mach.averageCostPerLiter))}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant="info" size="sm">
                                  {mach.loadCount}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No hay datos de consumo disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedFuelLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Carga de Combustible</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar la carga de combustible de{' '}
                <span className="font-semibold">{selectedFuelLoad.machinery_code}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedFuelLoad.liters}L - {formatCLP(selectedFuelLoad.total_cost)}
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
      {selectedFuelLoad && !showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Fuel className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Carga de Combustible
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {formatDate(selectedFuelLoad.date)} - {selectedFuelLoad.liters}L
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFuelLoad(null)}
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
                      <span className="text-gray-500 dark:text-gray-400">Maquinaria:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const mach = machinery.find(m => m.id === selectedFuelLoad.machinery_id)
                          return mach ? `${mach.brand} ${mach.model}` : (selectedFuelLoad.machinery_code || 'N/A')
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Operador:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedFuelLoad.operator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedFuelLoad.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Fuente:</span>
                      <Badge variant={getSourceBadgeVariant(selectedFuelLoad.source)}>
                        {getSourceLabel(selectedFuelLoad.source)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detalles de Combustible</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Litros:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedFuelLoad.liters}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Costo por Litro:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCLP(selectedFuelLoad.cost_per_liter)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total:</span>
                      <span className="font-medium text-lg text-gray-900 dark:text-white">{formatCLP(selectedFuelLoad.total_cost)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ubicación</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>{(selectedFuelLoad as any).location || 'N/A'}</span>
                  </div>
                </div>

                {selectedFuelLoad.work_order_id && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Orden de Trabajo</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedFuelLoad.work_order_id}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Fecha de Registro</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(selectedFuelLoad.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sección de Imágenes y Archivos - SIEMPRE VISIBLE */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Registro Fotográfico y Documentos</span>
                </h4>
                {(selectedFuelLoad.fuel_load_image || selectedFuelLoad.receipt_image) && (
                  <Badge variant="success" className="text-xs">
                    Archivos adjuntos
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Foto de la Carga */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Foto de la Carga</span>
                    </div>
                    {selectedFuelLoad.fuel_load_image ? (
                      <Badge variant="info" className="text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        IMAGEN
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs text-gray-500">
                        Sin archivo
                      </Badge>
                    )}
                  </div>
                  {selectedFuelLoad.fuel_load_image ? (
                    <div className="rounded-lg overflow-hidden border-2 border-blue-300 bg-white relative shadow-md">
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 shadow-lg z-10">
                        <ImageIcon className="h-3 w-3" />
                        <span>IMAGEN CARGADA</span>
                      </div>
                      <img
                        src={selectedFuelLoad.fuel_load_image}
                        alt="Foto de la carga de combustible"
                        className="w-full h-auto max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          const modal = document.createElement('div')
                          modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'
                          modal.onclick = () => document.body.removeChild(modal)
                          const img = document.createElement('img')
                          img.src = selectedFuelLoad.fuel_load_image!
                          img.className = 'max-w-full max-h-[90vh] object-contain'
                          img.onclick = (e) => e.stopPropagation()
                          modal.appendChild(img)
                          document.body.appendChild(modal)
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 shadow-lg">
                        <ImageIcon className="h-3 w-3" />
                        <span>JPG/PNG</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                        ✓ Archivo disponible
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-8 text-center">
                      <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay foto de la carga</p>
                    </div>
                  )}
                </div>

                {/* Foto/PDF de la Boleta */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Receipt className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Boleta/Comprobante</span>
                    </div>
                    {selectedFuelLoad.receipt_image ? (
                      <Badge
                        variant={selectedFuelLoad.receipt_image.startsWith('data:application/pdf') ? 'warning' : 'info'}
                        className="text-xs"
                      >
                        {selectedFuelLoad.receipt_image.startsWith('data:application/pdf') ? (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                            PDF
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-3 w-3 mr-1" />
                            IMAGEN
                          </>
                        )}
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs text-gray-500">
                        Sin archivo
                      </Badge>
                    )}
                  </div>
                  {selectedFuelLoad.receipt_image ? (
                    <div className="rounded-lg overflow-hidden border-2 border-green-300 bg-white relative shadow-md">
                      {selectedFuelLoad.receipt_image.startsWith('data:application/pdf') ? (
                        <div
                          className="w-full min-h-[200px] flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors relative"
                          onClick={() => {
                            const modal = document.createElement('div')
                            modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'
                            modal.onclick = () => document.body.removeChild(modal)
                            const iframe = document.createElement('iframe')
                            iframe.src = selectedFuelLoad.receipt_image!
                            iframe.className = 'w-full max-w-4xl h-[90vh] border-0 rounded-lg bg-white'
                            iframe.onclick = (e) => e.stopPropagation()
                            modal.appendChild(iframe)
                            document.body.appendChild(modal)
                          }}
                        >
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 shadow-lg z-10">
                            <FileText className="h-3 w-3" />
                            <span>PDF CARGADO</span>
                          </div>
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 shadow-lg">
                            <FileText className="h-3 w-3" />
                            <span>PDF</span>
                          </div>
                          <div className="p-4 bg-red-100 rounded-full mb-4">
                            <FileText className="h-12 w-12 text-red-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Archivo PDF disponible</p>
                          <p className="text-xs text-gray-500 mb-2">Haz clic para ver el PDF completo</p>
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                            ✓ Archivo disponible
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 shadow-lg z-10">
                            <ImageIcon className="h-3 w-3" />
                            <span>IMAGEN CARGADA</span>
                          </div>
                          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 shadow-lg">
                            <ImageIcon className="h-3 w-3" />
                            <span>JPG/PNG</span>
                          </div>
                          <img
                            src={selectedFuelLoad.receipt_image}
                            alt="Foto de la boleta"
                            className="w-full h-auto max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              const modal = document.createElement('div')
                              modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'
                              modal.onclick = () => document.body.removeChild(modal)
                              const img = document.createElement('img')
                              img.src = selectedFuelLoad.receipt_image!
                              img.className = 'max-w-full max-h-[90vh] object-contain'
                              img.onclick = (e) => e.stopPropagation()
                              modal.appendChild(img)
                              document.body.appendChild(modal)
                            }}
                          />
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                            ✓ Archivo disponible
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-8 text-center">
                      <Receipt className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay boleta/comprobante</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setSelectedFuelLoad(null)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleEdit(selectedFuelLoad)}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nueva carga de combustible */}
      {showNewFuelLoadModal && (
        <NewFuelLoadModal
          machinery={machinery}
          workOrders={workOrders}
          onClose={() => setShowNewFuelLoadModal(false)}
        />
      )}

      {/* Modal de editar carga de combustible */}
      {showEditFuelLoadModal && fuelLoadToEdit && (
        <EditFuelLoadModal
          fuelLoad={fuelLoadToEdit}
          machinery={machinery}
          workOrders={workOrders}
          onClose={() => {
            setShowEditFuelLoadModal(false)
            setFuelLoadToEdit(null)
          }}
          updateFuelLoad={updateFuelLoad}
        />
      )}
    </div>
  )
}

// Schema de validación para nueva carga de combustible
const fuelLoadSchema = z.object({
  machinery_id: z.number().min(1, 'La maquinaria es requerida'),
  operator_id: z.string().min(1, 'El operador es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  liters: z.number().min(0.1, 'Los litros deben ser mayores a 0'),
  cost_per_liter: z.number().min(0, 'El costo por litro no puede ser negativo'),
  work_order_id: z.string().optional(),
  source: z.enum(['bodega', 'estacion'], {
    message: 'La fuente es requerida',
  }),
  location: z.string().min(1, 'La ubicación es requerida'),
})

type FuelLoadFormData = z.infer<typeof fuelLoadSchema>

// Componente Modal de Nueva Carga de Combustible
function NewFuelLoadModal({
  machinery,
  workOrders,
  onClose
}: {
  machinery: any[]
  workOrders: any[]
  onClose: () => void
}) {
  const { addFuelLoad } = useApp()
  const [fuelLoadImage, setFuelLoadImage] = useState<string | undefined>()
  const [receiptImage, setReceiptImage] = useState<string | undefined>()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FuelLoadFormData>({
    resolver: zodResolver(fuelLoadSchema),
    defaultValues: {
      machinery_id: 0,
      operator_id: '',
      date: new Date().toISOString().split('T')[0],
      liters: 0,
      cost_per_liter: 0,
      work_order_id: '',
      source: 'bodega',
      location: '',
    },
  })

  const liters = watch('liters')
  const costPerLiter = watch('cost_per_liter')
  const totalCost = liters * costPerLiter

  const onSubmit = (data: FuelLoadFormData) => {
    const selectedMachinery = machinery.find(m => m.id === data.machinery_id)
    if (!selectedMachinery) {
      toast.error('Maquinaria seleccionada no encontrada')
      return
    }

    const newFuelLoad = {
      machinery_id: data.machinery_id,
      machinery_code: `${selectedMachinery.brand} ${selectedMachinery.model}`,
      operator_id: data.operator_id,
      operator: data.operator_id,
      date: data.date,
      liters: data.liters,
      total_cost: totalCost,
      cost_per_liter: data.cost_per_liter,
      work_order_id: data.work_order_id || null,
      source: data.source,
      location: data.location,
      fuel_load_image: fuelLoadImage,
      receipt_image: receiptImage,
    }

    addFuelLoad(newFuelLoad)
    toast.success('Carga de combustible registrada exitosamente!')
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
                <Fuel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Nueva Carga de Combustible</h2>
                <p className="text-blue-100 dark:text-blue-200 text-sm">Registra una nueva carga de combustible para tu maquinaria</p>
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
          {/* Información Principal */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Principal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Maquinaria */}
              <div className="space-y-2">
                <Label htmlFor="machinery_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Maquinaria</span>
                </Label>
                <Controller
                  name="machinery_id"
                  control={control}
                  render={({ field }) => {
                    const selectedMachinery = machinery.find(m => m.id === field.value)
                    return (
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value > 0 ? field.value.toString() : undefined}>
                        <SelectTrigger className={`h-11 ${errors.machinery_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}>
                          {selectedMachinery ? (
                            <span className="text-gray-900 dark:text-white">{selectedMachinery.brand} {selectedMachinery.model} ({selectedMachinery.patent})</span>
                          ) : (
                            <SelectValue placeholder="Selecciona una maquinaria" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {machinery.map((mach) => (
                            <SelectItem key={mach.id} value={mach.id.toString()}>
                              {mach.brand} {mach.model} ({mach.patent})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  }}
                />
                {errors.machinery_id && <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center space-x-1">{errors.machinery_id.message}</p>}
              </div>

              {/* Operador */}
              <div className="space-y-2">
                <Label htmlFor="operator_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Operador</span>
                </Label>
                <div className="relative">
                  <Input
                    id="operator_id"
                    {...register('operator_id')}
                    placeholder="Ej: Carlos Muñoz"
                    className={`h-11 pl-10 ${errors.operator_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                {errors.operator_id && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.operator_id.message}</p>}
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Fecha</span>
                </Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
                    className={`h-11 pl-10 ${errors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
                {errors.date && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.date.message}</p>}
              </div>

              {/* Fuente */}
              <div className="space-y-2">
                <Label htmlFor="source" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Fuente</span>
                </Label>
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`h-11 ${errors.source ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}>
                        <SelectValue placeholder="Selecciona una fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bodega">Bodega</SelectItem>
                        <SelectItem value="estacion">Estación de Servicio</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.source && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.source.message}</p>}
              </div>

              {/* Litros */}
              <div className="space-y-2">
                <Label htmlFor="liters" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <Fuel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Litros</span>
                </Label>
                <div className="relative">
                  <Input
                    id="liters"
                    type="number"
                    step="0.1"
                    {...register('liters', { valueAsNumber: true })}
                    placeholder="Ej: 150.5"
                    className={`h-11 pl-10 ${errors.liters ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                {errors.liters && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.liters.message}</p>}
              </div>

              {/* Costo por Litro */}
              <div className="space-y-2">
                <Label htmlFor="cost_per_liter" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Costo por Litro ($)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="cost_per_liter"
                    type="number"
                    {...register('cost_per_liter', { valueAsNumber: true })}
                    placeholder="Ej: 1300"
                    className={`h-11 pl-10 ${errors.cost_per_liter ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                {errors.cost_per_liter && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.cost_per_liter.message}</p>}
              </div>

              {/* Orden de Trabajo (Opcional) */}
              <div className="space-y-2">
                <Label htmlFor="work_order_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Orden de Trabajo (Opcional)</span>
                </Label>
                <Controller
                  name="work_order_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Selecciona una orden de trabajo" />
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
                  )}
                />
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Ubicación</span>
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="Ej: Base FUTAMAQ, Valdivia"
                    className={`h-11 pl-10 ${errors.location ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                {errors.location && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.location.message}</p>}
              </div>
            </div>
          </div>

          {/* Resumen de Costo */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
            <div className="relative p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-blue-600 dark:bg-blue-700 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Costo</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Litros</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{liters || 0} L</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Costo por Litro</p>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">${costPerLiter || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg p-4 text-white shadow-lg">
                  <p className="text-sm text-blue-100 mb-1">Total</p>
                  <p className="text-2xl font-bold">{formatCLP(totalCost)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Imágenes */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 pb-2">
              <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Registro Fotográfico</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Foto de la Carga de Combustible */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <FuelImageUpload
                  label="Foto de la Carga de Combustible"
                  imageUrl={fuelLoadImage}
                  onChange={setFuelLoadImage}
                  type="fuel_load"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 flex items-start space-x-1">
                  <span className="text-blue-600 dark:text-blue-400">💡</span>
                  <span>Toma una foto del medidor o indicador para verificar la cantidad de combustible cargado</span>
                </p>
              </div>

              {/* Foto/Archivo de la Boleta */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/50">
                <FuelImageUpload
                  label="Foto o Archivo PDF de la Boleta (Opcional)"
                  imageUrl={receiptImage}
                  onChange={setReceiptImage}
                  type="receipt"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 flex items-start space-x-1">
                  <span className="text-green-600 dark:text-green-400">💡</span>
                  <span>Sube una foto o archivo PDF de la boleta o comprobante de pago del combustible</span>
                </p>
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
              Registrar Carga
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente Modal de Editar Carga de Combustible
function EditFuelLoadModal({
  fuelLoad,
  machinery,
  workOrders,
  onClose,
  updateFuelLoad,
}: {
  fuelLoad: any
  machinery: any[]
  workOrders: any[]
  onClose: () => void
  updateFuelLoad: (id: number, fuelLoad: Partial<any>) => void
}) {
  const [fuelLoadImage, setFuelLoadImage] = useState<string | undefined>(fuelLoad.fuel_load_image)
  const [receiptImage, setReceiptImage] = useState<string | undefined>(fuelLoad.receipt_image)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(fuelLoadSchema),
    defaultValues: {
      machinery_id: fuelLoad.machinery_id,
      operator_id: fuelLoad.operator_id || fuelLoad.operator,
      date: fuelLoad.date,
      liters: fuelLoad.liters,
      cost_per_liter: fuelLoad.cost_per_liter,
      work_order_id: fuelLoad.work_order_id || '',
      source: fuelLoad.source,
      location: fuelLoad.location || '',
    },
  })

  useEffect(() => {
    reset({
      machinery_id: fuelLoad.machinery_id,
      operator_id: fuelLoad.operator_id || fuelLoad.operator,
      date: fuelLoad.date,
      liters: fuelLoad.liters,
      cost_per_liter: fuelLoad.cost_per_liter,
      work_order_id: fuelLoad.work_order_id || '',
      source: fuelLoad.source,
      location: fuelLoad.location || '',
    })
    setFuelLoadImage(fuelLoad.fuel_load_image)
    setReceiptImage(fuelLoad.receipt_image)
  }, [fuelLoad, reset])

  const liters = watch('liters')
  const costPerLiter = watch('cost_per_liter')
  const totalCost = liters * costPerLiter

  const onSubmit = (data: any) => {
    const selectedMachinery = machinery.find(m => m.id === data.machinery_id)
    if (!selectedMachinery) {
      toast.error('Maquinaria seleccionada no encontrada')
      return
    }

    const updatedFuelLoad = {
      ...fuelLoad,
      machinery_id: data.machinery_id,
      machinery_code: `${selectedMachinery.brand} ${selectedMachinery.model}`,
      operator_id: data.operator_id,
      operator: data.operator_id,
      date: data.date,
      liters: data.liters,
      total_cost: totalCost,
      cost_per_liter: data.cost_per_liter,
      work_order_id: data.work_order_id || null,
      source: data.source,
      location: data.location,
      fuel_load_image: fuelLoadImage,
      receipt_image: receiptImage,
    }

    updateFuelLoad(fuelLoad.id, updatedFuelLoad)
    toast.success('Carga de combustible actualizada exitosamente!')
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
                <Fuel className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Editar Carga de Combustible</h1>
                <p className="text-blue-100 text-sm">Actualiza la información de la carga de combustible</p>
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
                {/* Maquinaria */}
                <div className="space-y-2">
                  <Label htmlFor="edit_machinery_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Maquinaria</span>
                  </Label>
                  <Controller
                    name="machinery_id"
                    control={control}
                    render={({ field }) => {
                      const selectedMachinery = machinery.find(m => m.id === field.value)
                      return (
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value > 0 ? field.value.toString() : undefined}>
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
                  {errors.machinery_id && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>{errors.machinery_id.message as string}</span></p>}
                </div>

                {/* Operador */}
                <div className="space-y-2">
                  <Label htmlFor="edit_operator_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Operador</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_operator_id"
                      {...register('operator_id')}
                      placeholder="Ej: Carlos Muñoz"
                      className={`h-11 pl-10 ${errors.operator_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.operator_id && <p className="text-red-500 text-sm mt-1">{errors.operator_id.message as string}</p>}
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <Label htmlFor="edit_date" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_date"
                      type="date"
                      {...register('date')}
                      className={`h-11 pl-10 ${errors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message as string}</p>}
                </div>

                {/* Fuente */}
                <div className="space-y-2">
                  <Label htmlFor="edit_source" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fuente</span>
                  </Label>
                  <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={`h-11 ${errors.source ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                          <SelectValue placeholder="Selecciona una fuente" className="dark:text-gray-400" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="bodega" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Bodega</SelectItem>
                          <SelectItem value="estacion" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Estación de Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.source && <p className="text-red-500 text-sm mt-1">{errors.source.message as string}</p>}
                </div>

                {/* Litros */}
                <div className="space-y-2">
                  <Label htmlFor="edit_liters" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Fuel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Litros</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_liters"
                      type="number"
                      step="0.1"
                      {...register('liters', { valueAsNumber: true })}
                      placeholder="Ej: 150.5"
                      className={`h-11 pl-10 ${errors.liters ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.liters && <p className="text-red-500 text-sm mt-1">{errors.liters.message as string}</p>}
                </div>

                {/* Costo por Litro */}
                <div className="space-y-2">
                  <Label htmlFor="edit_cost_per_liter" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Costo por Litro ($)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_cost_per_liter"
                      type="number"
                      {...register('cost_per_liter', { valueAsNumber: true })}
                      placeholder="Ej: 1300"
                      className={`h-11 pl-10 ${errors.cost_per_liter ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.cost_per_liter && <p className="text-red-500 text-sm mt-1">{errors.cost_per_liter.message as string}</p>}
                </div>

                {/* Orden de Trabajo (Opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="edit_work_order_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Orden de Trabajo (Opcional)</span>
                  </Label>
                  <Controller
                    name="work_order_id"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                          <SelectValue placeholder="Selecciona una orden de trabajo" className="dark:text-gray-400" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Sin orden de trabajo</SelectItem>
                          {workOrders.map((wo) => (
                            <SelectItem key={wo.id} value={wo.id} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                              {wo.id} - {wo.field_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label htmlFor="edit_location" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Ubicación</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_location"
                      {...register('location')}
                      placeholder="Ej: Base FUTAMAQ, Valdivia"
                      className={`h-11 pl-10 ${errors.location ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message as string}</p>}
                </div>
              </div>
            </div>

            {/* Resumen de Costo Mejorado */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 rounded-xl border border-blue-200/50 dark:border-gray-600/50 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full -ml-12 -mb-12"></div>
              <div className="relative p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-blue-600 dark:bg-blue-600 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Costo</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 dark:bg-gray-600/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-500/80">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Litros</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{liters || 0} L</p>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-600/60 backdrop-blur-sm rounded-lg p-4 border border-white/80 dark:border-gray-500/80">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Costo por Litro</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">${costPerLiter || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg p-4 text-white shadow-lg">
                    <p className="text-sm text-blue-100 mb-1">Total</p>
                    <p className="text-2xl font-bold">{formatCLP(totalCost)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Imágenes Mejorada */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 pb-2">
                <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Registro Fotográfico</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Foto de la Carga de Combustible */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
                  <FuelImageUpload
                    label="Foto de la Carga de Combustible"
                    imageUrl={fuelLoadImage}
                    onChange={setFuelLoadImage}
                    type="fuel_load"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 flex items-start space-x-1">
                    <span className="text-blue-600 dark:text-blue-400">💡</span>
                    <span>Toma una foto del medidor o indicador para verificar la cantidad de combustible cargado</span>
                  </p>
                </div>

                {/* Foto/Archivo de la Boleta */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-6 border border-green-100 dark:border-gray-600">
                  <FuelImageUpload
                    label="Foto o Archivo PDF de la Boleta (Opcional)"
                    imageUrl={receiptImage}
                    onChange={setReceiptImage}
                    type="receipt"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 flex items-start space-x-1">
                    <span className="text-green-600 dark:text-green-400">💡</span>
                    <span>Sube una foto o archivo PDF de la boleta o comprobante de pago del combustible</span>
                  </p>
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
                className="px-8 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-2"
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
