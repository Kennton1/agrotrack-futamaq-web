'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Truck, Wrench, ClipboardList, Users, BarChart3,
  Plus, Eye, Edit, Trash2, MapPin, Clock, Fuel, Settings, Package,
  Activity, Bell, TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { formatCLP, formatHours, formatDate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const { machinery, workOrders, maintenances, spareParts, fuelLoads, fetchData } = useApp()
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setLastUpdated(new Date())
    setTimeout(() => setIsRefreshing(false), 800)
  }

  // Valor por defecto para users ya que no está en AppContext
  // Usando un valor mock basado en los usuarios predefinidos del sistema
  const users = [
    { id: 1, full_name: 'Admin', email: 'admin@futamaq.cl', role: 'administrador' },
    { id: 2, full_name: 'Operador 1', email: 'operador1@futamaq.cl', role: 'operador' },
    { id: 3, full_name: 'Cliente 1', email: 'cliente1@futamaq.cl', role: 'cliente' },
  ]

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

  // Datos falsos para gráficos
  const fuelConsumptionData = [
    { mes: 'Ene', consumo: 1200, costo: 1500000 },
    { mes: 'Feb', consumo: 1350, costo: 1687500 },
    { mes: 'Mar', consumo: 1100, costo: 1375000 },
    { mes: 'Abr', consumo: 1450, costo: 1812500 },
    { mes: 'May', consumo: 1300, costo: 1625000 },
    { mes: 'Jun', consumo: 1250, costo: 1562500 },
  ]

  const maintenanceCostsData = [
    { mes: 'Ene', preventivo: 450000, correctivo: 320000, emergencia: 180000 },
    { mes: 'Feb', preventivo: 520000, correctivo: 280000, emergencia: 150000 },
    { mes: 'Mar', preventivo: 480000, correctivo: 410000, emergencia: 220000 },
    { mes: 'Abr', preventivo: 550000, correctivo: 350000, emergencia: 190000 },
    { mes: 'May', preventivo: 500000, correctivo: 380000, emergencia: 160000 },
    { mes: 'Jun', preventivo: 580000, correctivo: 420000, emergencia: 210000 },
  ]

  const machineryUtilizationData = [
    { name: 'Tractores', value: 85, color: '#8ba394' },
    { name: 'Cosechadoras', value: 72, color: '#64748b' },
    { name: 'Sembradoras', value: 68, color: '#78716c' },
    { name: 'Pulverizadores', value: 91, color: '#0ea5e9' },
  ]

  useEffect(() => {
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'success'
      case 'en_faena':
        return 'info'
      case 'en_mantencion':
        return 'warning'
      case 'fuera_servicio':
        return 'danger'
      case 'planificada':
        return 'default'
      case 'en_ejecucion':
        return 'info'
      case 'completada':
        return 'success'
      case 'retrasada':
      case 'atrasada':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'disponible': 'Disponible',
      'en_faena': 'En Faena',
      'en_mantencion': 'En Mantención',
      'fuera_servicio': 'Fuera de Servicio',
      'planificada': 'Planificada',
      'en_ejecucion': 'En Ejecución',
      'completada': 'Completada',
      'retrasada': 'Atrasada',
      'atrasada': 'Atrasada'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header del Dashboard */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient dark:text-white mb-2">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Resumen general del sistema FUTAMAQ</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Última actualización</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className={`rounded-full shadow-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 !p-0 !w-8 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
              title="Actualizar datos"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          onClick={() => router.push('/maquinarias')}
          variant="modern"
          className="group bg-gradient-to-br from-primary-50 via-primary-100/50 to-secondary-50/30 border-primary-200/50 dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-primary-700 dark:text-white mb-1">Total Maquinarias</p>
                <p className="text-4xl font-bold text-primary-900 dark:text-white mb-2">{machinery.length}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-300 dark:border-green-700">+2 este mes</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-primary rounded-2xl shadow-lg dark:bg-primary-600">
                <Truck className="h-10 w-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push('/ordenes-trabajo')}
          variant="modern"
          className="group bg-gradient-to-br from-success-50 via-success-100/50 to-primary-50/30 border-success-200/50 dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-success-700 dark:text-white mb-1">Órdenes Activas</p>
                <p className="text-4xl font-bold text-success-900 dark:text-white mb-2">
                  {workOrders.filter(wo => wo.status === 'en_ejecucion').length}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-300 dark:border-blue-700">En progreso</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl  shadow-lg dark:bg-success-600">
                <ClipboardList className="h-10 w-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push('/mantenimientos')}
          variant="modern"
          className="group bg-gradient-to-br from-warning-50 via-warning-100/50 to-orange-50/30 border-warning-200/50 dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-warning-700 dark:text-white mb-1">Mantenimientos</p>
                <p className="text-4xl font-bold text-warning-900 dark:text-white mb-2">{maintenances.filter(m => m.status !== 'completada').length}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-300 dark:border-orange-700">Pendientes</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-warning rounded-2xl  shadow-lg dark:bg-warning-600">
                <Wrench className="h-10 w-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push('/usuarios')}
          variant="modern"
          className="group bg-gradient-to-br from-secondary-50 via-secondary-100/50 to-info-50/30 border-secondary-200/50 dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-secondary-700 dark:text-white mb-1">Usuarios</p>
                <p className="text-4xl font-bold text-secondary-900 dark:text-white mb-2">{users.length}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-full border border-indigo-300 dark:border-indigo-700">Activos</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-secondary rounded-2xl  shadow-lg dark:bg-secondary-600">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fila superior: Centro de Gestión y Alertas y Tareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Centro de Gestión */}
        <Card variant="modern" className="bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-primary-200/50 dark:border-gray-700/50">
          <CardHeader variant="gradient" className="bg-gradient-to-r from-blue-500 to-blue-600 dark:bg-blue-600">
            <CardTitle variant="gradient" className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Activity className="h-6 w-6" />
              </div>
              <span>Centro de Gestión</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Maquinarias</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{machinery.length} equipos</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push('/maquinarias')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Ver todas
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-success-500 to-success-600 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Órdenes de Trabajo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{workOrders.length} órdenes</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push('/ordenes-trabajo')}
                  className="text-success-600 dark:text-success-400 hover:text-success-700 dark:hover:text-success-300"
                >
                  Ver todas
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-warning rounded-lg">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Mantenimientos</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">3 pendientes</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push('/mantenimientos')}
                  className="text-warning-600 dark:text-warning-400 hover:text-warning-700 dark:hover:text-warning-300"
                >
                  Ver todas
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-info rounded-lg">
                    <Fuel className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Combustible</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Control de cargas</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push('/combustible')}
                  className="text-info-600 dark:text-info-400 hover:text-info-700 dark:hover:text-info-300"
                >
                  Ver todas
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-secondary rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Repuestos</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Inventario</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push('/repuestos')}
                  className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300"
                >
                  Ver todas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Columna derecha: Alertas y Tareas */}
        <Card variant="modern" className="bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-primary-200/50 dark:border-gray-700/50">
          <CardHeader variant="gradient" className="bg-gradient-to-r from-blue-500 to-blue-600 dark:bg-blue-600">
            <CardTitle variant="gradient" className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bell className="h-6 w-6" />
              </div>
              <span>Alertas y Tareas Pendientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              {/* Mantenimientos (Vehículos) */}
              <div className="bg-red-100/80 dark:bg-gray-700/90 border border-red-200/50 dark:border-gray-600/50 rounded-2xl p-5 h-full flex flex-col justify-between items-center text-center">
                <div className="w-full flex flex-col items-center">
                  <div className="p-3 bg-red-500 dark:bg-red-600 rounded-xl shadow-lg mb-3">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <div className="mb-2">
                    <h3 className="font-bold text-red-700 dark:text-red-300">Mantenimientos</h3>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">(Vehículos)</p>
                  </div>
                  <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-1">
                    {maintenances.filter(m => m.status !== 'completada').length}
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-6">Requieren atención</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center !transform-none !scale-100"
                  onClick={() => router.push('/mantenimientos')}
                >
                  Ver Detalles
                </Button>
              </div>

              {/* Órdenes Retrasadas */}
              <div className="bg-yellow-100/80 dark:bg-gray-700/90 border border-yellow-200/50 dark:border-gray-600/50 rounded-2xl p-5 h-full flex flex-col justify-between items-center text-center">
                <div className="w-full flex flex-col items-center">
                  <div className="p-3 bg-yellow-500 dark:bg-yellow-600 rounded-xl shadow-lg mb-3">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div className="mb-2">
                    <h3 className="font-bold text-yellow-700 dark:text-yellow-300">Órdenes</h3>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Atrasadas</p>
                  </div>
                  <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">
                    {workOrders.filter(wo => wo.status === 'retrasada').length}
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-6">Fuera de cronograma</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center !transform-none !scale-100"
                  onClick={() => router.push('/ordenes-trabajo?status=retrasada')}
                >
                  Revisar
                </Button>
              </div>

              {/* Repuestos (Stock Bajo) */}
              <div className="bg-purple-100/80 dark:bg-gray-700/90 border border-purple-200/50 dark:border-gray-600/50 rounded-2xl p-5 h-full flex flex-col justify-between items-center text-center">
                <div className="w-full flex flex-col items-center">
                  <div className="p-3 bg-purple-500 dark:bg-purple-600 rounded-xl shadow-lg mb-3">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="mb-2">
                    <h3 className="font-bold text-purple-700 dark:text-purple-300">Repuestos</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">(Stock Bajo)</p>
                  </div>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                    {spareParts.filter(sp => sp.current_stock <= sp.minimum_stock).length}
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-6">Necesitan reposición</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center !transform-none !scale-100"
                  onClick={() => router.push('/repuestos?filter=low')}
                >
                  Gestionar
                </Button>
              </div>

              {/* Próximos (Esta Semana) */}
              <div className="bg-blue-100/80 dark:bg-gray-700/90 border border-blue-200/50 dark:border-gray-600/50 rounded-2xl p-5 h-full flex flex-col justify-between items-center text-center">
                <div className="w-full flex flex-col items-center">
                  <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg mb-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="mb-2">
                    <h3 className="font-bold text-blue-700 dark:text-blue-300">Próximos</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">(Esta Semana)</p>
                  </div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                    {/* Suma de mantenimientos y órdenes para los próximos 7 días */}
                    {
                      (() => {
                        const now = new Date()
                        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

                        const upcomingMaint = maintenances.filter(m => {
                          const d = new Date(m.scheduled_date)
                          return d >= now && d <= nextWeek && m.status !== 'completada'
                        }).length

                        const upcomingOrders = workOrders.filter(wo => {
                          const d = new Date(wo.planned_start_date)
                          return d >= now && d <= nextWeek && wo.status === 'planificada'
                        }).length

                        return upcomingMaint + upcomingOrders
                      })()
                    }
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-6">Programados</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center !transform-none !scale-100"
                  onClick={() => router.push('/ordenes-trabajo?status=planificada')}
                >
                  Planificar
                </Button>
              </div>

            </div>

            {/* Lista de tareas urgentes mejoradas */}
            <div className="pt-6 border-t border-primary-200/50 dark:border-gray-700/50">
              <h4 className="font-bold text-primary-800 dark:text-white mb-4 flex items-center text-lg">
                <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-xl mr-3">
                  <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                Tareas Urgentes de Hoy
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-100/80 dark:bg-gray-700/90 rounded-2xl border border-red-200/50 dark:border-gray-600/50">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-500 dark:bg-red-600 rounded-xl shadow-lg">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-red-700 dark:text-red-300 text-lg">Mantenimiento T001 - Vencido</p>
                      <p className="text-sm text-red-600 dark:text-red-400">Tractor John Deere 6120M</p>
                    </div>
                  </div>
                  <Badge variant="danger" size="md" animated className="shadow-md">Urgente</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-100/80 dark:bg-gray-700/90 rounded-2xl border border-yellow-200/50 dark:border-gray-600/50">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-500 dark:bg-yellow-600 rounded-xl shadow-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-700 dark:text-yellow-300 text-lg">Reponer Filtros de Aceite</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Stock: 2 unidades (Mín: 5)</p>
                    </div>
                  </div>
                  <Badge variant="warning" size="md" animated className="shadow-md">Medio</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-100/80 dark:bg-gray-700/90 rounded-2xl border border-blue-200/50 dark:border-gray-600/50">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-700 dark:text-blue-300 text-lg">Revisar OT-2024-002</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Siembra en Parcela 12 - Mañana</p>
                    </div>
                  </div>
                  <Badge variant="info" size="md" animated className="shadow-md">Programado</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fila inferior: Costos de Mantenimiento y Consumo de Combustible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Costos de Mantenimiento */}
        <Card variant="modern" className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-blue-200/50 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader variant="gradient" className="bg-gradient-to-r from-blue-500 to-blue-600 dark:bg-blue-600">
            <div className="flex items-center justify-between">
              <CardTitle variant="gradient" className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Wrench className="h-6 w-6" />
                </div>
                <span>Costos de Mantenimiento</span>
              </CardTitle>
              <div className="flex items-center space-x-2 bg-white/20 rounded-xl px-3 py-1">
                <TrendingDown className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">-5.2%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 chart-container">
            <div className="h-80 chart-area">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={maintenanceCostsData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                    tickFormatter={(value) => formatCLP(typeof value === 'number' ? value : Number(value))}
                  />
                  <Tooltip
                    cursor={false}
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
                            {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{
                              margin: '4px 0',
                              color: isDark ? '#E7E9EA' : '#0F1419'
                            }}>
                              <span style={{ color: entry.color }}>●</span> {entry.name}: {formatCLP(typeof entry.value === 'number' ? entry.value : Number(entry.value))}
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="preventivo" stackId="a" fill="#8ba394" name="Preventivo" />
                  <Bar dataKey="correctivo" stackId="a" fill="#64748b" name="Correctivo" />
                  <Bar dataKey="emergencia" stackId="a" fill="#dc2626" name="Emergencia" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Preventivo</p>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">{formatCLP(5130000)}</p>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Correctivo</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCLP(2160000)}</p>
              </div>
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Emergencia</p>
                <p className="text-sm font-bold text-red-800 dark:text-red-300">{formatCLP(1110000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consumo de Combustible */}
        <Card variant="modern" className="bg-gradient-to-br from-white via-orange-50/30 to-yellow-50/20 border-orange-200/50 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader variant="gradient" className="bg-gradient-to-r from-orange-500 to-orange-600 dark:bg-orange-600">
            <div className="flex items-center justify-between">
              <CardTitle variant="gradient" className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Fuel className="h-6 w-6" />
                </div>
                <span>Consumo de Combustible</span>
              </CardTitle>
              <div className="flex items-center space-x-2 bg-white/20 rounded-xl px-3 py-1">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">+12.5%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 chart-container">
            <div className="h-80 chart-area">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={fuelConsumptionData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                    tickFormatter={(value) => `${value}L`}
                  />
                  <Tooltip
                    cursor={false}
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
                            {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{
                              margin: '4px 0',
                              color: isDark ? '#E7E9EA' : '#0F1419'
                            }}>
                              <span style={{ color: entry.color }}>●</span> {entry.name === 'consumo' ? 'Consumo' : 'Costo'}: {entry.name === 'consumo' ? `${entry.value}L` : formatCLP(typeof entry.value === 'number' ? entry.value : Number(entry.value))}
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumo"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Promedio Mensual</p>
                <p className="text-xl font-bold text-orange-800 dark:text-orange-300">1,275L</p>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Costo Total</p>
                <p className="text-xl font-bold text-orange-800 dark:text-orange-300">{formatCLP(9562500)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
