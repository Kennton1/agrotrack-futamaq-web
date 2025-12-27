'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ReportCard } from '@/components/reportes/ReportCard'
import { VisualAnalysis } from '@/components/reportes/VisualAnalysis'
import { SummaryCard } from '@/components/reportes/SummaryCard'
import { AdvancedFilters } from '@/components/reportes/AdvancedFilters'
import {
  Fuel, Wrench, Truck, DollarSign, Package, BarChart3,
  TrendingUp, Calendar, Filter, ClipboardList, LandPlot, TrendingDown
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { formatCLP } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FilterOptions {
  dateRange: {
    type: 'custom' | 'month' | 'quarter' | 'year' | 'current_month' | 'current_year' | 'all' | 'last_month' | 'last_quarter' | 'last_year' | 'last_7_days' | 'last_30_days'
    startDate?: string
    endDate?: string
    month?: string
    year?: string
  }
  machinery: string[]
  clients: string[]
  operators: string[]
  status: string[]
  priority: string[]
  reportType: 'summary' | 'detailed' | 'analytics'
  groupBy: 'date' | 'machinery' | 'client' | 'operator' | 'status'
  includeCharts: boolean
}

export default function ReportesPage() {
  const { machinery, workOrders, maintenances, fuelLoads, spareParts, partMovements, clients, currentUser } = useApp()
  const router = useRouter()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    dateRange: {
      type: 'all' // Cambiar a 'all' para mostrar todos los datos por defecto
    },
    machinery: [],
    clients: [],
    operators: [],
    status: [],
    priority: [],
    reportType: 'summary',
    groupBy: 'date',
    includeCharts: true
  })

  useEffect(() => {
    if (currentUser && currentUser.role !== 'administrador') {
      router.push('/dashboard')
      toast.error('No tienes permisos para acceder a esta sección')
    }
  }, [currentUser, router])

  // Debug: Ver qué datos tenemos
  useEffect(() => {
    console.log('📊 Datos en Reportes:', {
      machinery: machinery.length,
      workOrders: workOrders.length,
      maintenances: maintenances.length,
      fuelLoads: fuelLoads.length,
      spareParts: spareParts.length,
      partMovements: partMovements.length
    })
    if (fuelLoads.length > 0) {
      console.log('🔍 Ejemplo de fuelLoad:', fuelLoads[0])
    }
    if (workOrders.length > 0) {
      console.log('🔍 Ejemplo de workOrder:', workOrders[0])
    }
  }, [machinery, workOrders, maintenances, fuelLoads, spareParts, partMovements])

  const handleGenerateReport = (reportId: string) => {
    setIsGenerating(reportId)
    // Simular generación de reporte
    setTimeout(() => {
      setIsGenerating(null)
      setSelectedReport(reportId)
    }, 1500)
  }

  // Función para obtener el rango de fechas basado en el filtro
  const getDateRange = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    let startDate: Date
    let endDate: Date = today

    switch (activeFilters.dateRange.type) {
      case 'last_7_days':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'last_30_days':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'current_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999)
        break
      case 'custom':
        startDate = activeFilters.dateRange.startDate
          ? new Date(activeFilters.dateRange.startDate)
          : new Date(today.getFullYear(), today.getMonth() - 1, 1)
        endDate = activeFilters.dateRange.endDate
          ? new Date(activeFilters.dateRange.endDate)
          : today
        break
      default:
        // 'all' o cualquier otro
        startDate = new Date(0) // Fecha muy antigua
        endDate = today
    }

    return { startDate, endDate }
  }, [activeFilters.dateRange])

  // Función para filtrar datos
  const filterData = <T extends any>(
    data: T[],
    dateField: (item: T) => Date,
    additionalFilters?: (item: T) => boolean
  ): T[] => {
    return data.filter(item => {
      // Filtro por fecha
      const itemDate = dateField(item)
      if (itemDate < getDateRange.startDate || itemDate > getDateRange.endDate) {
        return false
      }

      // Filtros adicionales
      if (additionalFilters && !additionalFilters(item)) {
        return false
      }

      return true
    })
  }

  // Datos filtrados
  const filteredWorkOrders = useMemo(() => {
    let filtered = workOrders.filter(order => {
      // Si el filtro es 'all', no filtrar por fecha
      if (activeFilters.dateRange.type !== 'all') {
        const orderDate = order.actual_start_date
          ? new Date(order.actual_start_date)
          : new Date(order.planned_start_date)

        if (orderDate < getDateRange.startDate || orderDate > getDateRange.endDate) {
          return false
        }
      }

      // Filtro por estado
      if (activeFilters.status.length > 0) {
        const statusMap: Record<string, string> = {
          'planificada': 'planificada',
          'en_ejecucion': 'en_ejecucion',
          'completada': 'completada',
          'retrasada': 'retrasada',
          'detenida': 'detenida',
          'cancelada': 'cancelada'
        }
        if (!activeFilters.status.some(s => statusMap[s] === order.status)) {
          return false
        }
      }

      // Filtro por prioridad
      if (activeFilters.priority.length > 0) {
        if (!activeFilters.priority.includes(order.priority)) {
          return false
        }
      }

      // Filtro por cliente
      if (activeFilters.clients.length > 0) {
        if (!activeFilters.clients.includes(order.client_id.toString())) {
          return false
        }
      }

      // Filtro por operador
      if (activeFilters.operators.length > 0) {
        if (!activeFilters.operators.includes(order.assigned_operator)) {
          return false
        }
      }

      // Filtro por maquinaria
      if (activeFilters.machinery.length > 0) {
        const hasMachinery = order.assigned_machinery.some(machId =>
          activeFilters.machinery.includes(machId.toString())
        )
        if (!hasMachinery) {
          return false
        }
      }

      return true
    })

    console.log(`📋 WorkOrders: Total=${workOrders.length}, Filtrados=${filtered.length}`)
    return filtered
  }, [workOrders, activeFilters, getDateRange])

  const filteredFuelLoads = useMemo(() => {
    const filtered = fuelLoads.filter(load => {
      const loadDate = new Date(load.date)
      // Si el filtro es 'all', no filtrar por fecha
      if (activeFilters.dateRange.type !== 'all') {
        if (loadDate < getDateRange.startDate || loadDate > getDateRange.endDate) {
          return false
        }
      }

      // Filtro por maquinaria
      if (activeFilters.machinery.length > 0) {
        if (!activeFilters.machinery.includes(load.machinery_id.toString())) {
          return false
        }
      }

      return true
    })

    console.log(`⛽ FuelLoads: Total=${fuelLoads.length}, Filtrados=${filtered.length}`)
    return filtered
  }, [fuelLoads, activeFilters, getDateRange])

  const filteredMaintenances = useMemo(() => {
    const filtered = maintenances.filter(maint => {
      // Si el filtro es 'all', no filtrar por fecha
      if (activeFilters.dateRange.type !== 'all') {
        const maintDate = new Date(maint.scheduled_date)
        if (maintDate < getDateRange.startDate || maintDate > getDateRange.endDate) {
          return false
        }
      }

      // Filtro por maquinaria
      if (activeFilters.machinery.length > 0) {
        if (!activeFilters.machinery.includes(maint.machinery_id.toString())) {
          return false
        }
      }

      return true
    })

    console.log(`🔧 Maintenances: Total=${maintenances.length}, Filtrados=${filtered.length}`)
    return filtered
  }, [maintenances, activeFilters, getDateRange])

  // Calcular datos de los últimos 7 días (o según filtro)
  const summaryData = useMemo(() => {
    // Hectáreas trabajadas
    const hectaresWorked = filteredWorkOrders
      .filter(order => order.status !== 'cancelada')
      .reduce((sum, order) => sum + (order.actual_hectares || order.target_hectares * (order.progress_percentage / 100) || 0), 0)

    // Combustible consumido (litros)
    const fuelConsumed = filteredFuelLoads.reduce((sum, load) => sum + load.liters, 0)

    // Costo de combustible
    const fuelCost = filteredFuelLoads.reduce((sum, load) => sum + load.total_cost, 0)

    // Órdenes activas (en ejecución)
    const activeOrders = filteredWorkOrders.filter(order => order.status === 'en_ejecucion').length

    // Si no hay datos en el período filtrado, mostrar datos totales
    const allHectares = workOrders
      .filter(order => order.status !== 'cancelada')
      .reduce((sum, order) => sum + (order.actual_hectares || order.target_hectares * (order.progress_percentage / 100) || 0), 0)

    const allFuelConsumed = fuelLoads.reduce((sum, load) => sum + load.liters, 0)
    const allFuelCost = fuelLoads.reduce((sum, load) => sum + load.total_cost, 0)
    const allActiveOrders = workOrders.filter(order => order.status === 'en_ejecucion').length

    // Usar datos filtrados, si están vacíos usar totales, y si aún así están vacíos usar valores por defecto
    return {
      hectaresWorked: hectaresWorked > 0 ? hectaresWorked : (allHectares > 0 ? allHectares : 0),
      fuelConsumed: fuelConsumed > 0 ? fuelConsumed : (allFuelConsumed > 0 ? allFuelConsumed : 0),
      fuelCost: fuelCost > 0 ? fuelCost : (allFuelCost > 0 ? allFuelCost : 0),
      activeOrders: activeOrders > 0 ? activeOrders : (allActiveOrders > 0 ? allActiveOrders : 0)
    }
  }, [filteredWorkOrders, filteredFuelLoads, workOrders, fuelLoads])

  // Datos para reporte de combustible (usar datos filtrados)
  const fuelReportData = filteredFuelLoads.map(load => ({
    fecha: new Date(load.date).toLocaleDateString('es-CL'),
    maquinaria: load.machinery_code,
    operador: load.operator,
    litros: load.liters,
    costo_unitario: load.cost_per_liter,
    costo_total: load.total_cost,
    fuente: load.source === 'bodega' ? 'Bodega' : 'Estación',
    orden_trabajo: load.work_order_id || 'N/A'
  }))

  // Datos para reporte de mantenimiento (usar datos filtrados)
  const maintenanceReportData = filteredMaintenances.map(maint => ({
    id: maint.id,
    maquinaria: maint.machinery_code,
    tipo: maint.type === 'preventiva' ? 'Preventiva' : 'Correctiva',
    estado: maint.status === 'programada' ? 'Programada' :
      maint.status === 'en_ejecucion' ? 'En Ejecución' :
        maint.status === 'completada' ? 'Completada' : 'Vencida',
    fecha_programada: new Date(maint.scheduled_date).toLocaleDateString('es-CL'),
    fecha_completada: maint.completion_date ? new Date(maint.completion_date).toLocaleDateString('es-CL') : 'N/A',
    costo: maint.cost,
    tecnico: maint.technician,
    horas_odometro: maint.odometer_hours
  }))

  // Datos para reporte de maquinaria
  const machineryReportData = machinery.map(mach => ({
    codigo: mach.code,
    patente: mach.patent,
    tipo: mach.type === 'tractor' ? 'Tractor' :
      mach.type === 'cosechadora' ? 'Cosechadora' :
        mach.type === 'camion' ? 'Camión' : 'Implemento',
    marca: mach.brand,
    modelo: mach.model,
    año: mach.year,
    horas_totales: mach.total_hours,
    estado: mach.status === 'disponible' ? 'Disponible' :
      mach.status === 'en_faena' ? 'En Faena' :
        mach.status === 'en_mantencion' ? 'En Mantención' : 'Fuera de Servicio',
    capacidad_combustible: mach.fuel_capacity,
    costo_hora: mach.hourly_cost,
    ubicacion: mach.last_location.address
  }))

  // Datos para reporte financiero (usar datos filtrados)
  const totalFuelCost = filteredFuelLoads.reduce((sum, load) => sum + load.total_cost, 0)
  const totalMaintenanceCost = filteredMaintenances.reduce((sum, maint) => sum + maint.cost, 0)

  // Calcular costos de maquinaria basados en horas trabajadas en órdenes filtradas
  const totalMachineryCost = useMemo(() => {
    const machineryHours: Record<number, number> = {}

    filteredWorkOrders.forEach(order => {
      (order.assigned_machinery || []).forEach(machId => {
        if (!machineryHours[machId]) {
          machineryHours[machId] = 0
        }
        // Usar horas actuales si están disponibles, sino estimar basado en horas objetivo
        const hours = order.actual_hours || (order.target_hours * (order.progress_percentage / 100)) || 0
        machineryHours[machId] += hours
      })
    })

    return Object.entries(machineryHours).reduce((sum, [machId, hours]) => {
      const mach = machinery.find(m => m.id === parseInt(machId))
      return sum + (mach ? mach.hourly_cost * hours : 0)
    }, 0)
  }, [filteredWorkOrders, machinery])

  // Calcular costos de repuestos usados en mantenimientos
  const totalSparePartsCost = useMemo(() => {
    return filteredMaintenances.reduce((sum, maint) => {
      // Sumar costos de repuestos usados en el mantenimiento
      if (maint.parts_used && Array.isArray(maint.parts_used)) {
        const partsCost = maint.parts_used.reduce((partsSum: number, part: any) => {
          const sparePart = spareParts.find(sp =>
            sp.description === part.part || sp.id === part.part_id
          )
          if (sparePart) {
            return partsSum + (sparePart.unit_cost * (part.quantity || 1))
          }
          return partsSum
        }, 0)
        return sum + partsCost
      }
      return sum
    }, 0)
  }, [filteredMaintenances, spareParts])

  const totalCosts = totalFuelCost + totalMaintenanceCost + totalMachineryCost + totalSparePartsCost

  const financialReportData = [
    {
      concepto: 'Combustible',
      monto: totalFuelCost,
      porcentaje: totalCosts > 0 ? ((totalFuelCost / totalCosts) * 100).toFixed(1) : '0.0'
    },
    {
      concepto: 'Mantenimiento',
      monto: totalMaintenanceCost,
      porcentaje: totalCosts > 0 ? ((totalMaintenanceCost / totalCosts) * 100).toFixed(1) : '0.0'
    },
    {
      concepto: 'Operación Maquinaria',
      monto: totalMachineryCost,
      porcentaje: totalCosts > 0 ? ((totalMachineryCost / totalCosts) * 100).toFixed(1) : '0.0'
    },
    {
      concepto: 'Repuestos',
      monto: totalSparePartsCost,
      porcentaje: totalCosts > 0 ? ((totalSparePartsCost / totalCosts) * 100).toFixed(1) : '0.0'
    }
  ]

  // Datos para reporte de inventario (incluyendo movimientos)
  const inventoryReportData = useMemo(() => {
    return spareParts.map(part => {
      // Calcular movimientos de entrada y salida para este repuesto en el período filtrado
      const filteredMovements = partMovements.filter(m => {
        if (m.part_id !== part.id) return false
        const movementDate = new Date(m.date)
        if (movementDate < getDateRange.startDate || movementDate > getDateRange.endDate) {
          return false
        }
        return true
      })

      const entradas = filteredMovements
        .filter(m => m.movement_type === 'entrada')
        .reduce((sum, m) => sum + m.quantity, 0)
      const salidas = filteredMovements
        .filter(m => m.movement_type === 'salida')
        .reduce((sum, m) => sum + m.quantity, 0)

      return {
        codigo: `RP-${part.id}`,
        descripcion: part.description,
        categoria: part.category,
        stock_actual: part.current_stock,
        stock_minimo: part.minimum_stock,
        estado: part.current_stock <= part.minimum_stock ? 'Stock Bajo' : 'Stock Normal',
        costo_unitario: part.unit_cost,
        valor_total: part.current_stock * part.unit_cost,
        proveedor: part.supplier,
        entradas: entradas,
        salidas: salidas,
        movimientos_netos: entradas - salidas
      }
    })
  }, [spareParts, partMovements, getDateRange])

  // Datos para reporte operacional (usar datos filtrados)
  const operationalReportData = filteredWorkOrders.map(order => ({
    id: order.id,
    campo: order.field_name,
    tipo_tarea: order.task_type,
    prioridad: order.priority === 'baja' ? 'Baja' :
      order.priority === 'media' ? 'Media' :
        order.priority === 'alta' ? 'Alta' : 'Crítica',
    estado: order.status === 'planificada' ? 'Planificada' :
      order.status === 'en_ejecucion' ? 'En Ejecución' :
        order.status === 'completada' ? 'Completada' :
          order.status === 'retrasada' ? 'Retrasada' :
            order.status === 'detenida' ? 'Detenida' : 'Cancelada',
    fecha_inicio_plan: new Date(order.planned_start_date).toLocaleDateString('es-CL'),
    fecha_fin_plan: new Date(order.planned_end_date).toLocaleDateString('es-CL'),
    hectareas_objetivo: order.target_hectares,
    hectareas_actual: order.actual_hectares,
    horas_objetivo: order.target_hours,
    horas_actual: order.actual_hours,
    progreso: order.progress_percentage,
    operador: order.assigned_operator
  }))

  const reports = [
    {
      id: 'fuel',
      name: 'Reporte de Combustible',
      description: 'Consumo y costos de combustible',
      icon: <Fuel className="h-5 w-5" />,
      color: 'orange',
      stats: {
        Total: filteredFuelLoads.reduce((sum, load) => sum + load.liters, 0),
        Costo: filteredFuelLoads.reduce((sum, load) => sum + load.total_cost, 0),
        'Costo Promedio': filteredFuelLoads.length > 0
          ? Math.round(filteredFuelLoads.reduce((sum, load) => sum + load.total_cost, 0) / filteredFuelLoads.reduce((sum, load) => sum + load.liters, 0))
          : 0
      },
      exportData: {
        data: fuelReportData,
        columns: [
          { key: 'fecha', label: 'Fecha', type: 'date' },
          { key: 'maquinaria', label: 'Maquinaria', type: 'string' },
          { key: 'operador', label: 'Operador', type: 'string' },
          { key: 'litros', label: 'Litros', type: 'number' },
          { key: 'costo_unitario', label: 'Costo Unitario', type: 'currency' },
          { key: 'costo_total', label: 'Costo Total', type: 'currency' },
          { key: 'fuente', label: 'Fuente', type: 'string' },
          { key: 'orden_trabajo', label: 'Orden Trabajo', type: 'string' }
        ],
        title: 'Reporte de Combustible',
        filename: 'reporte-combustible'
      }
    },
    {
      id: 'maintenance',
      name: 'Reporte de Mantenimientos',
      description: 'Programación y costos de mantenimiento',
      icon: <Wrench className="h-5 w-5" />,
      color: 'yellow',
      stats: {
        Planificadas: filteredMaintenances.filter(m => m.status === 'programada').length,
        Completadas: filteredMaintenances.filter(m => m.status === 'completada').length,
        Pendientes: filteredMaintenances.filter(m => m.status === 'en_ejecucion').length
      },
      exportData: {
        data: maintenanceReportData,
        columns: [
          { key: 'id', label: 'ID', type: 'number' },
          { key: 'maquinaria', label: 'Maquinaria', type: 'string' },
          { key: 'tipo', label: 'Tipo', type: 'string' },
          { key: 'estado', label: 'Estado', type: 'string' },
          { key: 'fecha_programada', label: 'Fecha Programada', type: 'date' },
          { key: 'fecha_completada', label: 'Fecha Completada', type: 'date' },
          { key: 'costo', label: 'Costo', type: 'currency' },
          { key: 'tecnico', label: 'Técnico', type: 'string' },
          { key: 'horas_odometro', label: 'Horas Odómetro', type: 'number' }
        ],
        title: 'Reporte de Mantenimiento',
        filename: 'reporte-mantenimiento'
      }
    },
    {
      id: 'machinery',
      name: 'Reporte de Maquinarias',
      description: 'Estado y utilización de equipos',
      icon: <Truck className="h-5 w-5" />,
      color: 'green',
      stats: {
        Total: machinery.length,
        Disponibles: machinery.filter(m => m.status === 'disponible').length,
        Mantenimiento: machinery.filter(m => m.status === 'en_mantencion').length
      },
      exportData: {
        data: machineryReportData,
        columns: [
          { key: 'codigo', label: 'Código', type: 'string' },
          { key: 'patente', label: 'Patente', type: 'string' },
          { key: 'tipo', label: 'Tipo', type: 'string' },
          { key: 'marca', label: 'Marca', type: 'string' },
          { key: 'modelo', label: 'Modelo', type: 'string' },
          { key: 'año', label: 'Año', type: 'number' },
          { key: 'horas_totales', label: 'Horas Totales', type: 'number' },
          { key: 'estado', label: 'Estado', type: 'string' },
          { key: 'capacidad_combustible', label: 'Cap. Combustible', type: 'number' },
          { key: 'costo_hora', label: 'Costo/Hora', type: 'currency' },
          { key: 'ubicacion', label: 'Ubicación', type: 'string' }
        ],
        title: 'Reporte de Maquinaria',
        filename: 'reporte-maquinaria'
      }
    },
    {
      id: 'financial',
      name: 'Reporte Financiero',
      description: 'Costos, ingresos y rentabilidad',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'red',
      stats: {
        Ingresos: totalCosts * 1.4, // Estimado: 40% margen sobre costos
        Costos: totalCosts,
        Ganancia: (totalCosts * 1.4) - totalCosts
      },
      exportData: {
        data: financialReportData,
        columns: [
          { key: 'concepto', label: 'Concepto', type: 'string' },
          { key: 'monto', label: 'Monto', type: 'currency' },
          { key: 'porcentaje', label: 'Porcentaje (%)', type: 'number' }
        ],
        title: 'Reporte Financiero',
        filename: 'reporte-financiero'
      }
    },
    {
      id: 'inventory',
      name: 'Reporte de Inventario',
      description: 'Stock y movimientos de repuestos',
      icon: <Package className="h-5 w-5" />,
      color: 'purple',
      stats: {
        Artículos: spareParts.length,
        'Stock Bajo': spareParts.filter(p => p.current_stock <= p.minimum_stock).length,
        Valor: spareParts.reduce((sum, p) => sum + (p.current_stock * p.unit_cost), 0)
      },
      exportData: {
        data: inventoryReportData,
        columns: [
          { key: 'codigo', label: 'Código', type: 'string' },
          { key: 'descripcion', label: 'Descripción', type: 'string' },
          { key: 'categoria', label: 'Categoría', type: 'string' },
          { key: 'stock_actual', label: 'Stock Actual', type: 'number' },
          { key: 'stock_minimo', label: 'Stock Mínimo', type: 'number' },
          { key: 'estado', label: 'Estado', type: 'string' },
          { key: 'costo_unitario', label: 'Costo Unitario', type: 'currency' },
          { key: 'valor_total', label: 'Valor Total', type: 'currency' },
          { key: 'proveedor', label: 'Proveedor', type: 'string' },
          { key: 'entradas', label: 'Entradas', type: 'number' },
          { key: 'salidas', label: 'Salidas', type: 'number' },
          { key: 'movimientos_netos', label: 'Movimientos Netos', type: 'number' }
        ],
        title: 'Reporte de Inventario',
        filename: 'reporte-inventario'
      }
    },
    {
      id: 'operational',
      name: 'Reporte Operacional',
      description: 'Resumen de actividades y productividad',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'blue',
      stats: {
        Órdenes: filteredWorkOrders.length,
        Hectáreas: summaryData.hectaresWorked,
        Eficiencia: filteredWorkOrders.length > 0
          ? Math.round((filteredWorkOrders.filter(o => o.status === 'completada').length / filteredWorkOrders.length) * 100)
          : 0
      },
      exportData: {
        data: operationalReportData,
        columns: [
          { key: 'id', label: 'ID', type: 'string' },
          { key: 'campo', label: 'Campo', type: 'string' },
          { key: 'tipo_tarea', label: 'Tipo Tarea', type: 'string' },
          { key: 'prioridad', label: 'Prioridad', type: 'string' },
          { key: 'estado', label: 'Estado', type: 'string' },
          { key: 'fecha_inicio_plan', label: 'Fecha Inicio Plan', type: 'date' },
          { key: 'fecha_fin_plan', label: 'Fecha Fin Plan', type: 'date' },
          { key: 'hectareas_objetivo', label: 'Hectáreas Objetivo', type: 'number' },
          { key: 'hectareas_actual', label: 'Hectáreas Actual', type: 'number' },
          { key: 'horas_objetivo', label: 'Horas Objetivo', type: 'number' },
          { key: 'horas_actual', label: 'Horas Actual', type: 'number' },
          { key: 'progreso', label: 'Progreso (%)', type: 'number' },
          { key: 'operador', label: 'Operador', type: 'string' }
        ],
        title: 'Reporte Operacional',
        filename: 'reporte-operacional'
      }
    }
  ]

  const handleApplyFilters = (filters: FilterOptions) => {
    console.log('📊 Aplicando filtros en ReportesPage:', filters)

    // Validar y normalizar filtros
    const normalizedFilters: FilterOptions = {
      dateRange: {
        type: filters.dateRange.type || 'all',
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
        month: filters.dateRange.month,
        year: filters.dateRange.year
      },
      machinery: Array.isArray(filters.machinery) ? filters.machinery : [],
      clients: Array.isArray(filters.clients) ? filters.clients : [],
      operators: Array.isArray(filters.operators) ? filters.operators : [],
      status: Array.isArray(filters.status) ? filters.status : [],
      priority: Array.isArray(filters.priority) ? filters.priority : [],
      reportType: filters.reportType || 'summary',
      groupBy: filters.groupBy || 'date',
      includeCharts: filters.includeCharts !== undefined ? filters.includeCharts : true
    }

    // Actualizar estado
    setActiveFilters(normalizedFilters)

    console.log('✅ Filtros actualizados:', normalizedFilters)

    // Mostrar notificación de que los filtros se aplicaron
    const filterCount =
      (normalizedFilters.dateRange.type !== 'all' ? 1 : 0) +
      normalizedFilters.machinery.length +
      normalizedFilters.clients.length +
      normalizedFilters.operators.length +
      normalizedFilters.status.length +
      normalizedFilters.priority.length

    if (filterCount > 0) {
      toast.success(`${filterCount} filtro${filterCount > 1 ? 's' : ''} aplicado${filterCount > 1 ? 's' : ''}`)
    } else {
      toast.success('Mostrando todos los datos')
    }
  }

  const handleClearFilters = () => {
    setActiveFilters({
      dateRange: {
        type: 'all' // Mostrar todos los datos por defecto
      },
      machinery: [],
      clients: [],
      operators: [],
      status: [],
      priority: [],
      reportType: 'summary',
      groupBy: 'date',
      includeCharts: true
    })
    toast.success('Filtros limpiados')
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Obtener el reporte seleccionado o el primero disponible
      const selectedReportData = reports.find(r => r.id === selectedReport) || reports[0]

      if (!selectedReportData || !selectedReportData.exportData) {
        toast.error('No hay datos para exportar. Por favor, selecciona un reporte primero.')
        return
      }

      const loadingToast = toast.loading(`Generando reporte en formato ${format.toUpperCase()}...`)

      // Importar funciones de exportación dinámicamente
      const { exportDataToPDF, exportDataToExcel, exportDataToCSV } = await import('@/lib/exportUtils')

      const exportData = {
        ...selectedReportData.exportData,
        filters: activeFilters,
        dateRange: activeFilters.dateRange.type === 'custom'
          ? { start: activeFilters.dateRange.startDate || '', end: activeFilters.dateRange.endDate || '' }
          : undefined
      }

      switch (format) {
        case 'pdf':
          await exportDataToPDF(exportData)
          break
        case 'excel':
          exportDataToExcel(exportData)
          break
        case 'csv':
          exportDataToCSV(exportData)
          break
      }

      toast.dismiss(loadingToast)
      toast.success(`Reporte exportado exitosamente en formato ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error(`Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Reportes y Análisis</h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          Genera reportes detallados con filtros avanzados y análisis en tiempo real
        </p>
      </div>

      {/* Filtros Avanzados */}
      <AdvancedFilters
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        onExport={handleExport}
        machinery={machinery}
        workOrders={workOrders}
        clients={clients}
        currentFilters={activeFilters}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Hectáreas Trabajadas"
          value={summaryData.hectaresWorked.toFixed(1)}
          timeframe={
            activeFilters.dateRange.type === 'last_7_days' ? 'Últimos 7 días' :
              activeFilters.dateRange.type === 'last_30_days' ? 'Últimos 30 días' :
                activeFilters.dateRange.type === 'current_month' ? 'Mes actual' :
                  activeFilters.dateRange.type === 'last_month' ? 'Mes anterior' :
                    activeFilters.dateRange.type === 'all' ? 'Todo el período' :
                      'Período seleccionado'
          }
          icon={LandPlot}
          iconColor="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <SummaryCard
          title="Combustible Consumido"
          value={`${summaryData.fuelConsumed}L`}
          timeframe={
            activeFilters.dateRange.type === 'last_7_days' ? 'Últimos 7 días' :
              activeFilters.dateRange.type === 'last_30_days' ? 'Últimos 30 días' :
                activeFilters.dateRange.type === 'current_month' ? 'Mes actual' :
                  activeFilters.dateRange.type === 'last_month' ? 'Mes anterior' :
                    activeFilters.dateRange.type === 'all' ? 'Todo el período' :
                      'Período seleccionado'
          }
          icon={Fuel}
          iconColor="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
        <SummaryCard
          title="Costo Combustible"
          value={formatCLP(summaryData.fuelCost)}
          timeframe={
            activeFilters.dateRange.type === 'last_7_days' ? 'Últimos 7 días' :
              activeFilters.dateRange.type === 'last_30_days' ? 'Últimos 30 días' :
                activeFilters.dateRange.type === 'current_month' ? 'Mes actual' :
                  activeFilters.dateRange.type === 'last_month' ? 'Mes anterior' :
                    activeFilters.dateRange.type === 'all' ? 'Todo el período' :
                      'Período seleccionado'
          }
          icon={TrendingDown}
          iconColor="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
        <SummaryCard
          title="Órdenes Activas"
          value={summaryData.activeOrders}
          status="En ejecución"
          icon={ClipboardList}
          iconColor="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            id={report.id}
            name={report.name}
            description={report.description}
            icon={report.icon}
            color={report.color}
            stats={report.stats}
            onGenerate={handleGenerateReport}
            exportData={report.exportData}
            isGenerating={isGenerating === report.id}
          />
        ))}
      </div>

      {/* Análisis Visual del Reporte Seleccionado */}
      {selectedReport && (
        <div className="mt-8 space-y-6">
          {/* Gráficos y Análisis Visual */}
          <Card variant="modern" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-white">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Análisis Visual - {reports.find(r => r.id === selectedReport)?.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <VisualAnalysis reportType={selectedReport} dateRange={getDateRange} />
            </CardContent>
          </Card>

          {/* Tabla de Datos del Reporte */}
          <Card variant="modern" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-white">
                <BarChart3 className="h-5 w-5" />
                <span>Datos Detallados - {reports.find(r => r.id === selectedReport)?.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {(() => {
                const report = reports.find(r => r.id === selectedReport)
                if (!report || !report.exportData) return null

                const formatValue = (value: any, type: string): string => {
                  if (value === null || value === undefined) return 'N/A'

                  switch (type) {
                    case 'currency':
                      return formatCLP(value)
                    case 'date':
                      return new Date(value).toLocaleDateString('es-CL')
                    case 'number':
                      return new Intl.NumberFormat('es-CL').format(value)
                    default:
                      return String(value)
                  }
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                          {report.exportData.columns.map((col) => (
                            <th
                              key={col.key}
                              className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.exportData.data.length === 0 ? (
                          <tr>
                            <td
                              colSpan={report.exportData.columns.length}
                              className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                            >
                              No hay datos disponibles para este período
                            </td>
                          </tr>
                        ) : (
                          report.exportData.data.map((row, index) => (
                            <tr
                              key={index}
                              className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                                }`}
                            >
                              {report.exportData!.columns.map((col) => (
                                <td
                                  key={col.key}
                                  className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {formatValue((row as any)[col.key], col.type)}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {report.exportData.data.length > 0 && (
                      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        Mostrando {report.exportData.data.length} registro{report.exportData.data.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
