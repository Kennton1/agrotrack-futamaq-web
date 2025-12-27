'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  BarChart3, TrendingUp, TrendingDown,
  Activity, Target, Zap, Clock,
  DollarSign, Truck, Wrench, Fuel, Package,
  Calendar, Filter, Download, RefreshCw, Eye,
  AlertTriangle, CheckCircle, XCircle, Info
} from 'lucide-react'
import { formatCLP, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

interface AnalyticsData {
  performance: {
    efficiency: number
    utilization: number
    productivity: number
    costEffectiveness: number
  }
  trends: {
    fuelConsumption: { date: string; value: number }[]
    maintenanceCosts: { date: string; value: number }[]
    productivity: { date: string; value: number }[]
    revenue: { date: string; value: number }[]
  }
  insights: {
    id: number
    type: 'warning' | 'success' | 'info' | 'error'
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    recommendation: string
  }[]
  predictions: {
    fuelCost: { nextMonth: number; trend: 'up' | 'down' | 'stable' }
    maintenance: { nextMonth: number; trend: 'up' | 'down' | 'stable' }
    productivity: { nextMonth: number; trend: 'up' | 'down' | 'stable' }
  }
}

export default function AnalisisPage() {
  const { currentUser } = useApp()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30d')
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (currentUser && currentUser.role !== 'administrador') {
      router.push('/dashboard')
      toast.error('No tienes permisos para acceder a esta sección')
    }
  }, [currentUser, router])

  // Detectar modo oscuro
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const html = document.documentElement
        const theme = html.getAttribute('data-theme')
        setIsDarkMode(theme === 'dark')
      }
    }

    checkDarkMode()

    // Observar cambios en el atributo data-theme
    const observer = new MutationObserver(checkDarkMode)
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      })
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Mock data para análisis
    const mockData: AnalyticsData = {
      performance: {
        efficiency: 87.5,
        utilization: 92.3,
        productivity: 78.9,
        costEffectiveness: 85.2
      },
      trends: {
        fuelConsumption: [
          { date: '2024-03-01', value: 1200 },
          { date: '2024-03-08', value: 1350 },
          { date: '2024-03-15', value: 1100 },
          { date: '2024-03-22', value: 1400 },
          { date: '2024-03-29', value: 1250 }
        ],
        maintenanceCosts: [
          { date: '2024-03-01', value: 450000 },
          { date: '2024-03-08', value: 520000 },
          { date: '2024-03-15', value: 380000 },
          { date: '2024-03-22', value: 610000 },
          { date: '2024-03-29', value: 490000 }
        ],
        productivity: [
          { date: '2024-03-01', value: 75 },
          { date: '2024-03-08', value: 82 },
          { date: '2024-03-15', value: 78 },
          { date: '2024-03-22', value: 85 },
          { date: '2024-03-29', value: 88 }
        ],
        revenue: [
          { date: '2024-03-01', value: 2500000 },
          { date: '2024-03-08', value: 2800000 },
          { date: '2024-03-15', value: 2600000 },
          { date: '2024-03-22', value: 3000000 },
          { date: '2024-03-29', value: 2900000 }
        ]
      },
      insights: [
        {
          id: 1,
          type: 'warning',
          title: 'Alto Consumo de Combustible',
          description: 'El tractor T002 ha mostrado un consumo 25% superior al promedio',
          impact: 'high',
          recommendation: 'Revisar el sistema de inyección y realizar mantenimiento preventivo'
        },
        {
          id: 2,
          type: 'success',
          title: 'Excelente Eficiencia Operacional',
          description: 'La productividad ha aumentado 15% en el último mes',
          impact: 'high',
          recommendation: 'Mantener las prácticas actuales y considerar replicar en otras áreas'
        },
        {
          id: 3,
          type: 'info',
          title: 'Optimización de Rutas',
          description: 'Se identificaron oportunidades de optimización en las rutas de trabajo',
          impact: 'medium',
          recommendation: 'Implementar sistema de optimización de rutas para reducir tiempos de desplazamiento'
        },
        {
          id: 4,
          type: 'error',
          title: 'Mantenimiento Atrasado',
          description: '3 maquinarias tienen mantenimientos vencidos',
          impact: 'high',
          recommendation: 'Programar mantenimientos urgentes para evitar fallas mayores'
        }
      ],
      predictions: {
        fuelCost: { nextMonth: 1800000, trend: 'up' },
        maintenance: { nextMonth: 650000, trend: 'up' },
        productivity: { nextMonth: 90, trend: 'up' }
      }
    }

    setData(mockData)
    setLoading(false)
  }, [])

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'performance', name: 'Rendimiento', icon: <Activity className="h-4 w-4" /> },
    { id: 'trends', name: 'Tendencias', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'insights', name: 'Insights', icon: <Target className="h-4 w-4" /> },
    { id: 'predictions', name: 'Predicciones', icon: <Zap className="h-4 w-4" /> }
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getInsightBadgeVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'danger' as const
      case 'medium': return 'warning' as const
      default: return 'success' as const
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Eficiencia</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data?.performance.efficiency}%</p>
                <p className="text-xs text-green-600 dark:text-green-400">+5.2% vs mes anterior</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Utilización</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data?.performance.utilization}%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">+2.1% vs mes anterior</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Productividad</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data?.performance.productivity}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">+8.3% vs mes anterior</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Costo-Efectividad</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data?.performance.costEffectiveness}%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">+3.7% vs mes anterior</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Fuel className="h-5 w-5 text-orange-500" />
              <span>Consumo de Combustible</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trends.fuelConsumption}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                    tickFormatter={(value) => `${value}L`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null
                      const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
                      return (
                        <div style={{
                          backgroundColor: isDark ? '#1F2937' : 'white',
                          border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '12px',
                          color: isDark ? '#E7E9EA' : '#0F1419'
                        }}>
                          <p style={{
                            margin: '0 0 8px 0',
                            fontWeight: 'bold',
                            color: isDark ? '#E7E9EA' : '#0F1419'
                          }}>
                            {new Date(label).toLocaleDateString('es-ES')}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{
                              margin: '4px 0',
                              color: isDark ? '#E7E9EA' : '#0F1419'
                            }}>
                              <span style={{ color: entry.color }}>●</span> Consumo: {entry.value}L
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
                    fill="#fef3c7"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Promedio Semanal</p>
                <p className="text-xl font-bold text-orange-800 dark:text-orange-300">
                  {data?.trends?.fuelConsumption?.length ? Math.round(data.trends.fuelConsumption.reduce((acc, curr) => acc + curr.value, 0) / data.trends.fuelConsumption.length) : 0}L
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Total Período</p>
                <p className="text-xl font-bold text-orange-800 dark:text-orange-300">
                  {data?.trends?.fuelConsumption?.reduce((acc, curr) => acc + curr.value, 0) || 0}L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              <span>Costos de Mantenimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.trends.maintenanceCosts}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                    tickFormatter={(value) => formatCLP(value)}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null
                      const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
                      return (
                        <div style={{
                          backgroundColor: isDark ? '#1F2937' : 'white',
                          border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '12px',
                          color: isDark ? '#E7E9EA' : '#0F1419'
                        }}>
                          <p style={{
                            margin: '0 0 8px 0',
                            fontWeight: 'bold',
                            color: isDark ? '#E7E9EA' : '#0F1419'
                          }}>
                            {new Date(label).toLocaleDateString('es-ES')}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{
                              margin: '4px 0',
                              color: isDark ? '#E7E9EA' : '#0F1419'
                            }}>
                              <span style={{ color: entry.color }}>●</span> Costo: {formatCLP(typeof entry.value === 'number' ? entry.value : 0)}
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Promedio Semanal</p>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                  {formatCLP(data?.trends?.maintenanceCosts?.length ? Math.round(data.trends.maintenanceCosts.reduce((acc, curr) => acc + curr.value, 0) / data.trends.maintenanceCosts.length) : 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Período</p>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                  {formatCLP(data?.trends?.maintenanceCosts?.reduce((acc, curr) => acc + curr.value, 0) || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Eficiencia por Maquinaria</h3>
              <div className="space-y-3">
                {[
                  { name: 'Tractor T001', efficiency: 92, status: 'excellent' },
                  { name: 'Tractor T002', efficiency: 78, status: 'good' },
                  { name: 'Implemento I001', efficiency: 85, status: 'good' },
                  { name: 'Camión C001', efficiency: 88, status: 'good' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.status === 'excellent' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                          style={{ width: `${item.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.efficiency}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Utilización de Recursos</h3>
              <div className="space-y-3">
                {[
                  { name: 'Horas de Trabajo', value: 85, total: 100 },
                  { name: 'Combustible', value: 78, total: 100 },
                  { name: 'Mantenimiento', value: 92, total: 100 },
                  { name: 'Personal', value: 88, total: 100 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Tendencia de Productividad</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.trends.productivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null
                      const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
                      return (
                        <div style={{
                          backgroundColor: isDark ? '#1F2937' : 'white',
                          border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '12px',
                          color: isDark ? '#E7E9EA' : '#0F1419'
                        }}>
                          <p style={{
                            margin: '0 0 8px 0',
                            fontWeight: 'bold',
                            color: isDark ? '#E7E9EA' : '#0F1419'
                          }}>
                            {new Date(label).toLocaleDateString('es-ES')}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{
                              margin: '4px 0',
                              color: isDark ? '#E7E9EA' : '#0F1419'
                            }}>
                              <span style={{ color: entry.color }}>●</span> Productividad: {entry.value}%
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Promedio</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-300">
                  {data?.trends?.productivity?.length ? Math.round(data.trends.productivity.reduce((acc, curr) => acc + curr.value, 0) / data.trends.productivity.length) : 0}%
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Tendencia</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-300 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 mr-1" />
                  +8.3%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <span>Análisis de Costos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Combustible', value: 45, color: '#f59e0b' },
                      { name: 'Mantenimiento', value: 25, color: '#3b82f6' },
                      { name: 'Personal', value: 20, color: '#10b981' },
                      { name: 'Otros', value: 10, color: '#8b5cf6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Combustible', value: 45, color: '#f59e0b' },
                      { name: 'Mantenimiento', value: 25, color: '#3b82f6' },
                      { name: 'Personal', value: 20, color: '#10b981' },
                      { name: 'Otros', value: 10, color: '#8b5cf6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
                      return (
                        <div style={{
                          backgroundColor: isDark ? '#1F2937' : 'white',
                          border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '12px',
                          color: isDark ? '#E7E9EA' : '#0F1419'
                        }}>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{
                              margin: '4px 0',
                              color: isDark ? '#E7E9EA' : '#0F1419'
                            }}>
                              <span style={{ color: entry.color }}>●</span> {entry.name}: {entry.value}%
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-orange-700 dark:text-orange-300">Combustible 45%</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300">Mantenimiento 25%</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 dark:text-green-300">Personal 20%</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-purple-700 dark:text-purple-300">Otros 10%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderInsights = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.insights.map((insight) => (
        <Card key={insight.id} className="hover:shadow-md transition-shadow flex flex-col">
          <CardContent className="p-4 flex flex-col flex-1">
            {/* Header con icono, título y badge */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {insight.title}
                  </h3>
                </div>
              </div>
              <div className="ml-2 flex-shrink-0">
                <Badge variant={getInsightBadgeVariant(insight.impact)} size="sm">
                  {insight.impact === 'high' ? 'Alto' :
                    insight.impact === 'medium' ? 'Medio' : 'Bajo'}
                </Badge>
              </div>
            </div>

            {/* Descripción */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 flex-1">
              {insight.description}
            </p>

            {/* Recomendación */}
            <div className={`p-3 rounded-lg border ${insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200/50 dark:border-yellow-800/50' :
                insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/50' :
                  insight.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/50' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/50'
              }`}>
              <p className={`text-xs font-semibold mb-1 ${insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-300' :
                  insight.type === 'success' ? 'text-green-800 dark:text-green-300' :
                    insight.type === 'error' ? 'text-red-800 dark:text-red-300' :
                      'text-blue-800 dark:text-blue-300'
                }`}>
                Recomendación:
              </p>
              <p className={`text-xs leading-relaxed ${insight.type === 'warning' ? 'text-yellow-700 dark:text-yellow-200' :
                  insight.type === 'success' ? 'text-green-700 dark:text-green-200' :
                    insight.type === 'error' ? 'text-red-700 dark:text-red-200' :
                      'text-blue-700 dark:text-blue-200'
                }`}>
                {insight.recommendation}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Costo de Combustible</h3>
              {getTrendIcon(data?.predictions.fuelCost.trend || 'stable')}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {formatCLP(data?.predictions.fuelCost.nextMonth || 0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximo mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mantenimiento</h3>
              {getTrendIcon(data?.predictions.maintenance.trend || 'stable')}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {formatCLP(data?.predictions.maintenance.nextMonth || 0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximo mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Productividad</h3>
              {getTrendIcon(data?.predictions.productivity.trend || 'stable')}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {data?.predictions.productivity.nextMonth}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximo mes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Predicciones a Largo Plazo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                <XAxis
                  dataKey="date"
                  stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                  fontSize={12}
                  tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                  fontSize={12}
                  tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  tickFormatter={(value) => formatCLP(value)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null
                    const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
                    return (
                      <div style={{
                        backgroundColor: isDark ? '#1F2937' : 'white',
                        border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '12px',
                        color: isDark ? '#E7E9EA' : '#0F1419'
                      }}>
                        <p style={{
                          margin: '0 0 8px 0',
                          fontWeight: 'bold',
                          color: isDark ? '#E7E9EA' : '#0F1419'
                        }}>
                          {new Date(label).toLocaleDateString('es-ES')}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} style={{
                            margin: '4px 0',
                            color: isDark ? '#E7E9EA' : '#0F1419'
                          }}>
                            <span style={{ color: entry.color }}>●</span> Ingresos: {formatCLP(typeof entry.value === 'number' ? entry.value : 0)}
                          </p>
                        ))}
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#d1fae5"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Ingresos Promedio</p>
              <p className="text-lg font-bold text-green-800 dark:text-green-300">
                {formatCLP(data?.trends?.revenue?.length ? Math.round(data.trends.revenue.reduce((acc, curr) => acc + curr.value, 0) / data.trends.revenue.length) : 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Crecimiento</p>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5%
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Proyección 6M</p>
              <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
                {formatCLP(3500000)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'performance':
        return renderPerformance()
      case 'trends':
        return renderTrends()
      case 'insights':
        return renderInsights()
      case 'predictions':
        return renderPredictions()
      default:
        return renderOverview()
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Análisis Avanzado</h1>
          <p className="text-gray-700 dark:text-gray-300">Insights y análisis predictivo del sistema</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}







