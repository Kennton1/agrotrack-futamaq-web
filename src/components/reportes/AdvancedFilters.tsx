'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  Filter, Calendar, CalendarDays, TrendingUp, BarChart3, 
  PieChart, Download, RefreshCw, X, ChevronDown, ChevronUp
} from 'lucide-react'

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterOptions) => void
  onClearFilters: () => void
  onExport: (format: 'pdf' | 'excel' | 'csv') => void
  className?: string
  machinery?: Array<{ id: number; code: string; brand: string; model: string }>
  workOrders?: Array<{ client_id: number; assigned_operator?: string; assigned_operators?: string[] }>
  currentFilters?: FilterOptions
}

export interface FilterOptions {
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

export function AdvancedFilters({ 
  onApplyFilters, 
  onClearFilters, 
  onExport, 
  className = '',
  machinery = [],
  workOrders = [],
  currentFilters
}: AdvancedFiltersProps) {
  const defaultFilters: FilterOptions = {
    dateRange: {
      type: 'all'
    },
    machinery: [],
    clients: [],
    operators: [],
    status: [],
    priority: [],
    reportType: 'summary',
    groupBy: 'date',
    includeCharts: true
  }

  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>(
    currentFilters || defaultFilters
  )

  // Sincronizar con currentFilters cuando cambien desde fuera
  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters)
    }
  }, [currentFilters])

  // Aplicar filtros automáticamente cuando cambien
  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    onApplyFilters(newFilters)
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    applyFilters(newFilters)
  }

  const handleDateRangeChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      dateRange: { ...filters.dateRange, [key]: value }
    }
    applyFilters(newFilters)
  }

  const handleMultiSelectChange = (key: string, value: string, checked: boolean) => {
    const currentArray = filters[key as keyof FilterOptions] as string[]
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    const newFilters = {
      ...filters,
      [key]: newArray
    }
    applyFilters(newFilters)
  }

  const clearFilters = () => {
    applyFilters(defaultFilters)
    onClearFilters()
  }

  const countActiveFilters = () => {
    let count = 0
    if (filters.dateRange.type !== 'all') count++
    if (filters.machinery.length > 0) count++
    if (filters.clients.length > 0) count++
    if (filters.operators.length > 0) count++
    if (filters.status.length > 0) count++
    if (filters.priority.length > 0) count++
    return count
  }

  // Opciones predefinidas
  const dateRangeOptions = [
    { value: 'last_7_days', label: 'Últimos 7 días' },
    { value: 'last_30_days', label: 'Últimos 30 días' },
    { value: 'current_month', label: 'Mes Actual' },
    { value: 'current_year', label: 'Año Actual' },
    { value: 'last_month', label: 'Mes Anterior' },
    { value: 'last_quarter', label: 'Trimestre Anterior' },
    { value: 'last_year', label: 'Año Anterior' },
    { value: 'custom', label: 'Rango Personalizado' },
    { value: 'all', label: 'Todo el período' }
  ]

  const reportTypeOptions = [
    { value: 'summary', label: 'Resumen Ejecutivo' },
    { value: 'detailed', label: 'Reporte Detallado' },
    { value: 'analytics', label: 'Análisis Avanzado' }
  ]

  const groupByOptions = [
    { value: 'date', label: 'Por Fecha' },
    { value: 'machinery', label: 'Por Maquinaria' },
    { value: 'client', label: 'Por Cliente' },
    { value: 'operator', label: 'Por Operador' },
    { value: 'status', label: 'Por Estado' }
  ]

  // Obtener opciones dinámicas desde los datos
  const machineryOptions = machinery.length > 0 
    ? machinery.map(m => ({
        value: m.id.toString(),
        label: `${m.code} - ${m.brand} ${m.model}`
      }))
    : [
        { value: '1', label: 'T001 - John Deere 6120M' },
        { value: '2', label: 'T002 - Case IH Puma 165' },
        { value: '3', label: 'C001 - New Holland CR6.80' }
      ]

  const uniqueClientIds = Array.from(new Set(workOrders.map(wo => wo.client_id)))
  const clientLabels: { [key: number]: string } = {
    1: 'Agrícola Los Robles S.A.',
    2: 'Cooperativa Campesina Valdivia',
    3: 'Fundo El Carmen',
    4: 'Agroindustria del Sur',
    5: 'Hacienda Santa Rosa'
  }
  const clientOptions = uniqueClientIds.length > 0
    ? uniqueClientIds.map(clientId => ({
        value: clientId.toString(),
        label: clientLabels[clientId] || `Cliente ${clientId}`
      }))
    : [
        { value: '1', label: 'Agrícola Los Robles S.A.' },
        { value: '2', label: 'Cooperativa Campesina Valdivia' },
        { value: '3', label: 'Fundo El Carmen' }
      ]

  const uniqueOperators = Array.from(new Set(
    workOrders
      .map(wo => wo.assigned_operator)
      .filter((op): op is string => op !== undefined && op !== null && op.trim() !== '')
  ))
  const operatorOptions = uniqueOperators.length > 0
    ? uniqueOperators.map(operator => ({
        value: operator!,
        label: operator!
      }))
    : [
        { value: 'Juan Pérez', label: 'Juan Pérez' },
        { value: 'Carlos Rodríguez', label: 'Carlos Rodríguez' },
        { value: 'María González', label: 'María González' }
      ]

  const statusOptions = [
    { value: 'planificada', label: 'Planificada' },
    { value: 'en_ejecucion', label: 'En Ejecución' },
    { value: 'completada', label: 'Completada' },
    { value: 'retrasada', label: 'Retrasada' }
  ]

  const priorityOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ]

  const renderMultiSelect = (options: any[], key: string, label: string) => {
    const selectedCount = (filters[key as keyof FilterOptions] as string[]).length
    const selectedValues = filters[key as keyof FilterOptions] as string[]
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {selectedCount > 0 && (
            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">({selectedCount} seleccionado{selectedCount > 1 ? 's' : ''})</span>
          )}
        </label>
        <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
          {options.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No hay opciones disponibles</p>
          ) : (
            <>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCount === options.length && options.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allValues = options.map(opt => opt.value)
                      const newFilters = { ...filters, [key]: allValues }
                      applyFilters(newFilters)
                    } else {
                      const newFilters = { ...filters, [key]: [] }
                      applyFilters(newFilters)
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600"
                />
                <span>{selectedCount === options.length ? 'Deseleccionar todos' : 'Seleccionar todos'}</span>
              </label>
              {options.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 text-sm hover:bg-white dark:hover:bg-gray-700/50 px-2 py-1 rounded cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => handleMultiSelectChange(key, option.value, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex-1">{option.label}</span>
                </label>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card variant="modern" className={className}>
      {/* Header clickeable */}
      <div 
        className="px-6 py-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200/50 dark:border-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-900 dark:text-white">
            <Filter className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            <span className="font-bold text-lg">Filtros Avanzados</span>
            {countActiveFilters() > 0 && (
              <Badge variant="warning" className="ml-2">
                {countActiveFilters()} filtros activos
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Contenido desplegable */}
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Resumen de filtros activos */}
          {countActiveFilters() > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>{countActiveFilters()}</strong> filtro{countActiveFilters() > 1 ? 's' : ''} activo{countActiveFilters() > 1 ? 's' : ''}. 
                Los datos mostrados están siendo filtrados.
              </p>
            </div>
          )}

          {/* Rango de fechas */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Período de Reporte
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Período</label>
                <select
                  value={filters.dateRange.type}
                  onChange={(e) => handleDateRangeChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {dateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {filters.dateRange.type === 'all' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">✓ Mostrando todas las órdenes sin filtrar por fecha</p>
                )}
                {filters.dateRange.type === 'last_7_days' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">✓ Mostrando datos de los últimos 7 días</p>
                )}
                {filters.dateRange.type === 'last_30_days' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">✓ Mostrando datos de los últimos 30 días</p>
                )}
              </div>

              {filters.dateRange.type === 'custom' && (
                <>
                  <div>
                    <Input
                      label="Fecha Inicio"
                      type="date"
                      value={filters.dateRange.startDate || ''}
                      onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="Fecha Fin"
                      type="date"
                      value={filters.dateRange.endDate || ''}
                      onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    />
                  </div>
                </>
              )}

              {filters.dateRange.type === 'month' && (
                <div>
                  <Input
                    label="Mes y Año"
                    type="month"
                    value={filters.dateRange.month || ''}
                    onChange={(e) => handleDateRangeChange('month', e.target.value)}
                  />
                </div>
              )}

              {filters.dateRange.type === 'year' && (
                <div>
                  <Input
                    label="Año"
                    type="number"
                    value={filters.dateRange.year || ''}
                    onChange={(e) => handleDateRangeChange('year', e.target.value)}
                    placeholder="2024"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Filtros por entidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderMultiSelect(machineryOptions, 'machinery', 'Maquinarias')}
            {renderMultiSelect(clientOptions, 'clients', 'Clientes')}
            {renderMultiSelect(operatorOptions, 'operators', 'Operadores')}
            {renderMultiSelect(statusOptions, 'status', 'Estados')}
            {renderMultiSelect(priorityOptions, 'priority', 'Prioridades')}
          </div>

          {/* Configuración del reporte */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Seleccionar Tipo y Formato del Reporte
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccionar Tipo de Reporte</label>
                <select
                  value={filters.reportType}
                  onChange={(e) => handleFilterChange('reportType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {reportTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccionar Agrupación</label>
                <select
                  value={filters.groupBy}
                  onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {groupByOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={filters.includeCharts}
                  onChange={(e) => handleFilterChange('includeCharts', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600"
                />
                <label htmlFor="includeCharts" className="text-sm text-gray-700 dark:text-gray-300">
                  Incluir gráficos
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Limpiar Filtros</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  applyFilters(defaultFilters)
                  onClearFilters()
                }}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Resetear</span>
              </Button>
            </div>
          </div>

          {/* Exportación */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </h4>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('excel')}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('csv')}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
