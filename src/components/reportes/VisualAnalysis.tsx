'use client'

import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { formatCLP } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

interface VisualAnalysisProps {
  reportType: string
  dateRange?: { startDate: Date; endDate: Date }
}

export function VisualAnalysis({ reportType, dateRange }: VisualAnalysisProps) {
  const { fuelLoads, maintenances, machinery, workOrders, spareParts, partMovements } = useApp()
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  // Tooltip personalizado para modo oscuro
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
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
        {label && (
          <p style={{
            margin: '0 0 8px 0',
            fontWeight: 'bold',
            color: isDark ? '#E7E9EA' : '#0F1419'
          }}>
            {label}
          </p>
        )}
        {payload.map((entry: any, index: number) => {
          const formattedValue = formatter
            ? formatter(entry.value, entry.name, entry, index, entry.payload)
            : entry.value
          return (
            <p key={index} style={{
              margin: '4px 0',
              color: isDark ? '#E7E9EA' : '#0F1419'
            }}>
              <span style={{ color: entry.color }}>●</span> {entry.name}: {formattedValue}
            </p>
          )
        })}
      </div>
    )
  }

  // Debug: Ver qué datos tenemos
  useEffect(() => {
    console.log(`📈 VisualAnalysis - ${reportType}:`, {
      fuelLoads: fuelLoads.length,
      maintenances: maintenances.length,
      workOrders: workOrders.length,
      dateRange: dateRange ? `${dateRange.startDate.toISOString()} - ${dateRange.endDate.toISOString()}` : 'Sin filtro'
    })
  }, [reportType, fuelLoads.length, maintenances.length, workOrders.length, dateRange])

  // Calcular datos de combustible por mes
  const fuelConsumptionData = useMemo(() => {
    const fuelByMonth: Record<string, { consumo: number; costo: number }> = {}

    fuelLoads.forEach(load => {
      const loadDate = new Date(load.date)
      // Si hay filtro de fecha, verificar; si no, incluir todos los datos
      if (dateRange && (loadDate < dateRange.startDate || loadDate > dateRange.endDate)) {
        return
      }

      const monthKey = loadDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
      if (!fuelByMonth[monthKey]) {
        fuelByMonth[monthKey] = { consumo: 0, costo: 0 }
      }
      fuelByMonth[monthKey].consumo += load.liters
      fuelByMonth[monthKey].costo += load.total_cost
    })

    let result = Object.entries(fuelByMonth)
      .map(([mes, data]) => ({ mes, consumo: Math.round(data.consumo), costo: data.costo }))
      .sort((a, b) => {
        const dateA = new Date(`1 ${a.mes}`)
        const dateB = new Date(`1 ${b.mes}`)
        return dateA.getTime() - dateB.getTime()
      })

    // Si no hay datos en el rango filtrado, mostrar todos los datos disponibles
    if (result.length === 0 && fuelLoads.length > 0) {
      const allFuelByMonth: Record<string, { consumo: number; costo: number }> = {}
      fuelLoads.forEach(load => {
        const loadDate = new Date(load.date)
        const monthKey = loadDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
        if (!allFuelByMonth[monthKey]) {
          allFuelByMonth[monthKey] = { consumo: 0, costo: 0 }
        }
        allFuelByMonth[monthKey].consumo += load.liters
        allFuelByMonth[monthKey].costo += load.total_cost
      })
      result = Object.entries(allFuelByMonth)
        .map(([mes, data]) => ({ mes, consumo: Math.round(data.consumo), costo: data.costo }))
        .sort((a, b) => {
          const dateA = new Date(`1 ${a.mes}`)
          const dateB = new Date(`1 ${b.mes}`)
          return dateA.getTime() - dateB.getTime()
        })
    }

    return result.slice(-6) // Últimos 6 meses
  }, [fuelLoads, dateRange])

  // Calcular datos de mantenimiento por mes
  const maintenanceData = useMemo(() => {
    const maintByMonth: Record<string, { preventivo: number; correctivo: number }> = {}

    maintenances.forEach(maint => {
      const maintDate = new Date(maint.scheduled_date)
      // Si hay filtro de fecha, verificar; si no, incluir todos los datos
      if (dateRange && (maintDate < dateRange.startDate || maintDate > dateRange.endDate)) {
        return
      }

      const monthKey = maintDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
      if (!maintByMonth[monthKey]) {
        maintByMonth[monthKey] = { preventivo: 0, correctivo: 0 }
      }

      if (maint.type === 'preventiva') {
        maintByMonth[monthKey].preventivo += maint.cost
      } else {
        maintByMonth[monthKey].correctivo += maint.cost
      }
    })

    let result = Object.entries(maintByMonth)
      .map(([mes, data]) => ({
        mes,
        preventivo: data.preventivo,
        correctivo: data.correctivo
      }))
      .sort((a, b) => {
        const dateA = new Date(`1 ${a.mes}`)
        const dateB = new Date(`1 ${b.mes}`)
        return dateA.getTime() - dateB.getTime()
      })

    // Si no hay datos en el rango filtrado, mostrar todos los datos disponibles
    if (result.length === 0 && maintenances.length > 0) {
      const allMaintByMonth: Record<string, { preventivo: number; correctivo: number }> = {}
      maintenances.forEach(maint => {
        const maintDate = new Date(maint.scheduled_date)
        const monthKey = maintDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
        if (!allMaintByMonth[monthKey]) {
          allMaintByMonth[monthKey] = { preventivo: 0, correctivo: 0 }
        }

        if (maint.type === 'preventiva') {
          allMaintByMonth[monthKey].preventivo += maint.cost
        } else {
          allMaintByMonth[monthKey].correctivo += maint.cost
        }
      })
      result = Object.entries(allMaintByMonth)
        .map(([mes, data]) => ({
          mes,
          preventivo: data.preventivo,
          correctivo: data.correctivo
        }))
        .sort((a, b) => {
          const dateA = new Date(`1 ${a.mes}`)
          const dateB = new Date(`1 ${b.mes}`)
          return dateA.getTime() - dateB.getTime()
        })
    }

    return result.slice(-6) // Últimos 6 meses
  }, [maintenances, dateRange])

  // Calcular distribución de tipos de mantenimiento
  const maintenanceTypesData = useMemo(() => {
    const preventivo = maintenances.filter(m => m.type === 'preventiva').length
    const correctivo = maintenances.filter(m => m.type === 'correctiva').length
    const total = preventivo + correctivo

    if (total === 0) {
      return [
        { name: 'Preventivo', value: 0, color: '#10b981' },
        { name: 'Correctivo', value: 0, color: '#f59e0b' },
      ]
    }

    return [
      { name: 'Preventivo', value: Math.round((preventivo / total) * 100), color: '#10b981' },
      { name: 'Correctivo', value: Math.round((correctivo / total) * 100), color: '#f59e0b' },
    ]
  }, [maintenances])

  // Calcular datos de utilización de maquinaria por tipo
  const machineryUtilizationData = useMemo(() => {
    const machineryByType: Record<string, { total: number; horas: number }> = {}

    machinery.forEach(mach => {
      const typeLabel =
        mach.type === 'tractor' ? 'Tractores' :
          mach.type === 'cosechadora' ? 'Cosechadoras' :
            mach.type === 'sembradora' ? 'Sembradoras' :
              mach.type === 'pulverizador' ? 'Pulverizadores' :
                mach.type === 'camion' ? 'Camiones' :
                  'Implementos'

      if (!machineryByType[typeLabel]) {
        machineryByType[typeLabel] = { total: 0, horas: 0 }
      }
      machineryByType[typeLabel].total += 1
      machineryByType[typeLabel].horas += mach.total_hours
    })

    // Calcular utilización basada en horas trabajadas vs horas disponibles
    return Object.entries(machineryByType).map(([name, data]) => {
      // Estimación de utilización: asumimos 8 horas/día * 20 días/mes = 160 horas/mes por máquina
      const horasDisponibles = data.total * 160
      const utilizacion = horasDisponibles > 0 ? Math.round((data.horas / horasDisponibles) * 100) : 0

      return {
        name,
        utilizacion: Math.min(utilizacion, 100),
        horas: Math.round(data.horas),
        color: name === 'Tractores' ? '#8ba394' :
          name === 'Cosechadoras' ? '#64748b' :
            name === 'Sembradoras' ? '#78716c' :
              name === 'Pulverizadores' ? '#0ea5e9' :
                '#94a3b8'
      }
    })
  }, [machinery])

  // Calcular datos financieros por mes
  const financialData = useMemo(() => {
    const financialByMonth: Record<string, { costos: number }> = {}

    // Agrupar costos por mes
    fuelLoads.forEach(load => {
      const loadDate = new Date(load.date)
      // Si hay filtro de fecha, verificar; si no, incluir todos los datos
      if (dateRange && (loadDate < dateRange.startDate || loadDate > dateRange.endDate)) {
        return
      }
      const monthKey = loadDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
      if (!financialByMonth[monthKey]) {
        financialByMonth[monthKey] = { costos: 0 }
      }
      financialByMonth[monthKey].costos += load.total_cost
    })

    maintenances.forEach(maint => {
      const maintDate = new Date(maint.scheduled_date)
      if (dateRange && (maintDate < dateRange.startDate || maintDate > dateRange.endDate)) {
        return
      }
      const monthKey = maintDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
      if (!financialByMonth[monthKey]) {
        financialByMonth[monthKey] = { costos: 0 }
      }
      financialByMonth[monthKey].costos += maint.cost
    })

    let result = Object.entries(financialByMonth)
      .map(([mes, data]) => {
        const ingresos = data.costos * 1.4 // 40% de margen
        const utilidad = ingresos - data.costos
        return { mes, ingresos, costos: data.costos, utilidad }
      })
      .sort((a, b) => {
        const dateA = new Date(`1 ${a.mes}`)
        const dateB = new Date(`1 ${b.mes}`)
        return dateA.getTime() - dateB.getTime()
      })

    // Si no hay datos en el rango filtrado, mostrar todos los datos disponibles
    if (result.length === 0 && (fuelLoads.length > 0 || maintenances.length > 0)) {
      const allFinancialByMonth: Record<string, { costos: number }> = {}
      fuelLoads.forEach(load => {
        const loadDate = new Date(load.date)
        const monthKey = loadDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
        if (!allFinancialByMonth[monthKey]) {
          allFinancialByMonth[monthKey] = { costos: 0 }
        }
        allFinancialByMonth[monthKey].costos += load.total_cost
      })
      maintenances.forEach(maint => {
        const maintDate = new Date(maint.scheduled_date)
        const monthKey = maintDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
        if (!allFinancialByMonth[monthKey]) {
          allFinancialByMonth[monthKey] = { costos: 0 }
        }
        allFinancialByMonth[monthKey].costos += maint.cost
      })
      result = Object.entries(allFinancialByMonth)
        .map(([mes, data]) => {
          const ingresos = data.costos * 1.4
          const utilidad = ingresos - data.costos
          return { mes, ingresos, costos: data.costos, utilidad }
        })
        .sort((a, b) => {
          const dateA = new Date(`1 ${a.mes}`)
          const dateB = new Date(`1 ${b.mes}`)
          return dateA.getTime() - dateB.getTime()
        })
    }

    // Calcular costos de maquinaria (horas * costo/hora) y distribuir proporcionalmente
    if (result.length > 0) {
      const totalMachineryCost = machinery.reduce((sum, mach) => sum + (mach.total_hours * mach.hourly_cost), 0)
      const costPerMonth = totalMachineryCost / result.length
      result = result.map(item => ({
        ...item,
        costos: item.costos + costPerMonth,
        ingresos: (item.costos + costPerMonth) * 1.4,
        utilidad: ((item.costos + costPerMonth) * 1.4) - (item.costos + costPerMonth)
      }))
    }

    return result.slice(-6) // Últimos 6 meses
  }, [fuelLoads, maintenances, machinery, dateRange])

  // Calcular datos de inventario por categoría
  const inventoryData = useMemo(() => {
    const inventoryByCategory: Record<string, { stock: number; valor: number }> = {}

    spareParts.forEach(part => {
      if (!inventoryByCategory[part.category]) {
        inventoryByCategory[part.category] = { stock: 0, valor: 0 }
      }
      inventoryByCategory[part.category].stock += part.current_stock
      inventoryByCategory[part.category].valor += part.current_stock * part.unit_cost
    })

    return Object.entries(inventoryByCategory)
      .map(([categoria, data]) => ({
        categoria,
        stock: data.stock,
        valor: data.valor
      }))
      .sort((a, b) => b.valor - a.valor)
  }, [spareParts])

  // Calcular estado del stock
  const stockStatusData = useMemo(() => {
    const normal = spareParts.filter(p => p.current_stock > p.minimum_stock).length
    const bajo = spareParts.filter(p => p.current_stock <= p.minimum_stock).length

    return [
      { name: 'Stock Normal', value: normal, color: '#10b981' },
      { name: 'Stock Bajo', value: bajo, color: '#ef4444' },
    ]
  }, [spareParts])

  const renderFuelAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Consumo Mensual de Combustible</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fuelConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                <XAxis
                  dataKey="mes"
                  stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                  tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                />
                <YAxis
                  stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                  tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                />
                <Tooltip
                  cursor={false}
                  content={(props) => <CustomTooltip {...props} formatter={(value: any, name: string) =>
                    name === 'consumo' ? `${value}L` : formatCLP(Number(value))
                  } />}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                  iconType="square"
                  formatter={() => 'Consumo (L)'}
                />
                <Area
                  type="monotone"
                  dataKey="consumo"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Consumo (L)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Eficiencia de Combustible</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {fuelConsumptionData.length > 0 ? (
                <LineChart data={fuelConsumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any) => `${value}L`} />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                    iconType="line"
                    formatter={() => 'Consumo (L)'}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumo"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Consumo (L)"
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderMaintenanceAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Costos de Mantenimiento por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {maintenanceData.length > 0 ? (
                <BarChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any) => formatCLP(Number(value))} />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                    iconType="square"
                  />
                  <Bar dataKey="preventivo" stackId="a" fill="#10b981" name="Preventivo" />
                  <Bar dataKey="correctivo" stackId="a" fill="#f59e0b" name="Correctivo" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Distribución de Mantenimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={maintenanceTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {maintenanceTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => <CustomTooltip {...props} />}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderMachineryAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Utilización de Maquinarias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {machineryUtilizationData.length > 0 ? (
                <BarChart data={machineryUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="name"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any) => `${value}%`} />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                    formatter={() => 'Utilización (%)'}
                  />
                  <Bar dataKey="utilizacion" fill="#3b82f6" name="Utilización (%)" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Horas de Operación</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {machineryUtilizationData.length > 0 ? (
                <BarChart data={machineryUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any) => `${value} hrs`} />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                    formatter={() => 'Horas de Operación'}
                  />
                  <Bar dataKey="horas" fill="#10b981" name="Horas de Operación" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderFinancialAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Tendencia Financiera</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {financialData.length > 0 ? (
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any, name: string) =>
                      formatCLP(Number(value))
                    } />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                    iconType="line"
                  />
                  <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} name="Ingresos" />
                  <Line type="monotone" dataKey="costos" stroke="#ef4444" strokeWidth={3} name="Costos" />
                  <Line type="monotone" dataKey="utilidad" stroke="#3b82f6" strokeWidth={3} name="Utilidad" />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Crecimiento de Utilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {financialData.length > 0 ? (
                <AreaChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any) => formatCLP(Number(value))} />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                    formatter={() => 'Utilidad'}
                  />
                  <Area
                    type="monotone"
                    dataKey="utilidad"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Utilidad"
                  />
                </AreaChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderInventoryAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Stock por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {inventoryData.length > 0 ? (
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="categoria"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any, name: string) =>
                      name === 'stock' ? value : formatCLP(Number(value))
                    } />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                    formatter={() => 'Stock'}
                  />
                  <Bar dataKey="stock" fill="#3b82f6" name="Stock" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Estado del Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => <CustomTooltip {...props} />}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Calcular datos operacionales por mes
  const operationalData = useMemo(() => {
    const operationalByMonth: Record<string, { hectareas: number; productividad: number; total: number; completadas: number }> = {}

    workOrders.forEach(order => {
      const orderDate = order.actual_start_date
        ? new Date(order.actual_start_date)
        : new Date(order.planned_start_date)

      // Si hay filtro de fecha, verificar; si no, incluir todos los datos
      if (dateRange && (orderDate < dateRange.startDate || orderDate > dateRange.endDate)) {
        return
      }

      const monthKey = orderDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
      if (!operationalByMonth[monthKey]) {
        operationalByMonth[monthKey] = { hectareas: 0, productividad: 0, total: 0, completadas: 0 }
      }

      const hectares = order.actual_hectares || (order.target_hectares * (order.progress_percentage / 100)) || 0
      operationalByMonth[monthKey].hectareas += hectares
      operationalByMonth[monthKey].total += 1

      // Calcular productividad: porcentaje de órdenes completadas
      if (order.status === 'completada') {
        operationalByMonth[monthKey].completadas += 1
      }
    })

    let result = Object.entries(operationalByMonth)
      .map(([mes, data]) => {
        const productividad = data.total > 0 ? Math.round((data.completadas / data.total) * 100) : 0
        return { mes, hectareas: Math.round(data.hectareas), productividad }
      })
      .sort((a, b) => {
        const dateA = new Date(`1 ${a.mes}`)
        const dateB = new Date(`1 ${b.mes}`)
        return dateA.getTime() - dateB.getTime()
      })

    // Si no hay datos en el rango filtrado, mostrar todos los datos disponibles
    if (result.length === 0 && workOrders.length > 0) {
      const allOperationalByMonth: Record<string, { hectareas: number; productividad: number; total: number; completadas: number }> = {}
      workOrders.forEach(order => {
        const orderDate = order.actual_start_date
          ? new Date(order.actual_start_date)
          : new Date(order.planned_start_date)

        const monthKey = orderDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
        if (!allOperationalByMonth[monthKey]) {
          allOperationalByMonth[monthKey] = { hectareas: 0, productividad: 0, total: 0, completadas: 0 }
        }

        const hectares = order.actual_hectares || (order.target_hectares * (order.progress_percentage / 100)) || 0
        allOperationalByMonth[monthKey].hectareas += hectares
        allOperationalByMonth[monthKey].total += 1

        if (order.status === 'completada') {
          allOperationalByMonth[monthKey].completadas += 1
        }
      })
      result = Object.entries(allOperationalByMonth)
        .map(([mes, data]) => {
          const productividad = data.total > 0 ? Math.round((data.completadas / data.total) * 100) : 0
          return { mes, hectareas: Math.round(data.hectareas), productividad }
        })
        .sort((a, b) => {
          const dateA = new Date(`1 ${a.mes}`)
          const dateB = new Date(`1 ${b.mes}`)
          return dateA.getTime() - dateB.getTime()
        })
    }

    return result.slice(-6) // Últimos 6 meses
  }, [workOrders, dateRange])

  // Calcular datos de órdenes de trabajo por estado y mes
  const workOrdersByStatusData = useMemo(() => {
    const ordersByMonthStatus: Record<string, Record<string, number>> = {}

    // Estados posibles de órdenes de trabajo (sin canceladas y detenidas)
    const statuses = ['completada', 'en_ejecucion', 'planificada', 'retrasada']

    workOrders.forEach(order => {
      const orderDate = order.actual_start_date
        ? new Date(order.actual_start_date)
        : new Date(order.planned_start_date)

      // Si hay filtro de fecha, verificar; si no, incluir todos los datos
      if (dateRange && (orderDate < dateRange.startDate || orderDate > dateRange.endDate)) {
        return
      }

      const monthKey = orderDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
      if (!ordersByMonthStatus[monthKey]) {
        ordersByMonthStatus[monthKey] = {}
        statuses.forEach(status => {
          ordersByMonthStatus[monthKey][status] = 0
        })
      }

      const status = order.status || 'planificada'
      if (ordersByMonthStatus[monthKey][status] !== undefined) {
        ordersByMonthStatus[monthKey][status] += 1
      }
    })

    let result = Object.entries(ordersByMonthStatus)
      .map(([mes, statusCounts]) => ({
        mes,
        Completadas: statusCounts['completada'] || 0,
        'En Ejecución': statusCounts['en_ejecucion'] || 0,
        Planificadas: statusCounts['planificada'] || 0,
        Retrasadas: statusCounts['retrasada'] || 0,
        Total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
      }))
      .sort((a, b) => {
        const dateA = new Date(`1 ${a.mes}`)
        const dateB = new Date(`1 ${b.mes}`)
        return dateA.getTime() - dateB.getTime()
      })

    // Si no hay datos en el rango filtrado, mostrar todos los datos disponibles
    if (result.length === 0 && workOrders.length > 0) {
      const allOrdersByMonthStatus: Record<string, Record<string, number>> = {}
      workOrders.forEach(order => {
        const orderDate = order.actual_start_date
          ? new Date(order.actual_start_date)
          : new Date(order.planned_start_date)

        const monthKey = orderDate.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })
        if (!allOrdersByMonthStatus[monthKey]) {
          allOrdersByMonthStatus[monthKey] = {}
          statuses.forEach(status => {
            allOrdersByMonthStatus[monthKey][status] = 0
          })
        }

        const status = order.status || 'planificada'
        if (allOrdersByMonthStatus[monthKey][status] !== undefined) {
          allOrdersByMonthStatus[monthKey][status] += 1
        }
      })

      result = Object.entries(allOrdersByMonthStatus)
        .map(([mes, statusCounts]) => ({
          mes,
          Completadas: statusCounts['completada'] || 0,
          'En Ejecución': statusCounts['en_ejecucion'] || 0,
          Planificadas: statusCounts['planificada'] || 0,
          Retrasadas: statusCounts['retrasada'] || 0,
          Total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
        }))
        .sort((a, b) => {
          const dateA = new Date(`1 ${a.mes}`)
          const dateB = new Date(`1 ${b.mes}`)
          return dateA.getTime() - dateB.getTime()
        })
    }

    return result.slice(-6) // Últimos 6 meses
  }, [workOrders, dateRange])

  const renderOperationalAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Productividad por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {operationalData.length > 0 ? (
                <LineChart data={operationalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any) => `${value}%`} />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                    formatter={() => 'Productividad (%)'}
                  />
                  <Line
                    type="monotone"
                    dataKey="productividad"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Productividad (%)"
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="modern">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Hectáreas Procesadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {operationalData.length > 0 ? (
                <BarChart data={operationalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                    tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  />
                  <Tooltip
                    cursor={false}
                    content={(props) => <CustomTooltip {...props} formatter={(value: any) => `${value} ha`} />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                    formatter={() => 'Hectáreas Procesadas'}
                  />
                  <Bar dataKey="hectareas" fill="#3b82f6" name="Hectáreas Procesadas" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Sin datos disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Nuevo gráfico: Órdenes de Trabajo por Estado */}
      <Card variant="modern">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Órdenes de Trabajo por Estado</CardTitle>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Distribución de órdenes de trabajo según su estado por mes. Puedes ver cuántas órdenes están completadas, en ejecución, planificadas, etc.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {workOrdersByStatusData.length > 0 ? (
              <BarChart data={workOrdersByStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                />
                <YAxis
                  label={{ value: 'Cantidad de Órdenes', angle: -90, position: 'insideLeft', fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                  stroke={isDarkMode ? "#9CA3AF" : "#64748b"}
                  tick={{ fill: isDarkMode ? "#E7E9EA" : "#64748b" }}
                />
                <Tooltip
                  cursor={false}
                  content={(props) => <CustomTooltip {...props} />}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', color: isDarkMode ? '#E7E9EA' : '#0F1419' }}
                  iconType="square"
                  formatter={(value) => value}
                />
                {/* Barras agrupadas (sin stackId) para comparación más clara */}
                <Bar dataKey="Completadas" fill="#10b981" name="Completadas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="En Ejecución" fill="#3b82f6" name="En Ejecución" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Planificadas" fill="#f59e0b" name="Planificadas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Retrasadas" fill="#dc2626" name="Retrasadas" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Sin datos disponibles</p>
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalysis = () => {
    switch (reportType) {
      case 'fuel':
        return renderFuelAnalysis()
      case 'maintenance':
        return renderMaintenanceAnalysis()
      case 'machinery':
        return renderMachineryAnalysis()
      case 'financial':
        return renderFinancialAnalysis()
      case 'inventory':
        return renderInventoryAnalysis()
      case 'operational':
        return renderOperationalAnalysis()
      default:
        return (
          <Card variant="modern">
            <CardContent className="p-12 text-center">
              <div className="text-gray-600 space-y-4">
                <div className="text-6xl">📊</div>
                <p className="text-lg font-semibold">Análisis Visual</p>
                <p>Selecciona un tipo de reporte para ver los gráficos correspondientes.</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="mt-6">
      {renderAnalysis()}
    </div>
  )
}







































