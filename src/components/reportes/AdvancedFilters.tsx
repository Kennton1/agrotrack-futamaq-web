'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import {
  Filter, Calendar, BarChart3,
  Download, RefreshCw, X, ChevronDown, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterOptions) => void
  onClearFilters: () => void
  onExport: (format: 'pdf' | 'excel' | 'csv') => void
  className?: string
  machinery?: Array<{ id: number; code: string; brand: string; model: string }>
  workOrders?: Array<{ client_id: number; assigned_operator?: string; assigned_operators?: string[] }>
  clients?: Array<{ id: number; name: string }>
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
  operators: string[] // Kept for compatibility but UI removed
  status: string[]
  priority: string[]
  reportType: 'summary' | 'detailed' | 'analytics'
  groupBy: 'date' | 'machinery' | 'client' | 'operator' | 'status'
  includeCharts: boolean
}

// Helper component for floating multi-select dropdowns
function FilterDropdown({
  label,
  count,
  isOpen,
  onToggle,
  onClose,
  children
}: {
  label: string,
  count: number,
  isOpen: boolean,
  onToggle: () => void,
  onClose: () => void,
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button" // Prevent form submission
        onClick={onToggle}
        className={cn(
          "flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-colors",
          isOpen
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            : count > 0
              ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10 text-gray-900 dark:text-gray-100"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        )}
      >
        <span className="font-medium">{label}</span>
        {count > 0 && (
          <Badge variant="info" className="ml-1 h-5 px-1.5 text-[10px] min-w-[20px] justify-center">
            {count}
          </Badge>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 ml-1 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left">
          <div className="max-h-60 overflow-y-auto p-2 space-y-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export function AdvancedFilters({
  onApplyFilters,
  onClearFilters,
  onExport,
  className = '',
  machinery = [],
  workOrders = [],
  clients = [],
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

  // Which dropdown is currently open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const [filters, setFilters] = useState<FilterOptions>(
    currentFilters || defaultFilters
  )

  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters)
    }
  }, [currentFilters])

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

  const handleToggleAll = (key: string, options: any[], checked: boolean) => {
    const newFilters = {
      ...filters,
      [key]: checked ? options.map(opt => opt.value) : []
    }
    applyFilters(newFilters)
  }

  const clearFilters = () => {
    applyFilters(defaultFilters)
    onClearFilters()
    setOpenDropdown(null)
  }

  const countActiveFilters = () => {
    let count = 0
    if (filters.dateRange.type !== 'all') count++
    if (filters.machinery.length > 0) count++
    if (filters.clients.length > 0) count++
    // Operators removed from UI count
    if (filters.status.length > 0) count++
    if (filters.priority.length > 0) count++
    return count
  }

  // Options
  const dateRangeOptions = [
    { value: 'all', label: 'Todo el período' },
    { value: 'last_7_days', label: 'Últimos 7 días' },
    { value: 'last_30_days', label: 'Últimos 30 días' },
    { value: 'current_month', label: 'Mes Actual' },
    { value: 'last_month', label: 'Mes Anterior' },
    { value: 'custom', label: 'Rango Personalizado' }
  ]

  const machineryOptions = machinery.length > 0
    ? machinery.map(m => ({
      value: m.id.toString(),
      label: `${m.code} - ${m.brand} ${m.model}`
    }))
    : []

  const clientOptions = clients.length > 0
    ? clients.map(c => ({
      value: c.id.toString(),
      label: c.name
    }))
    : []

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

  const renderDropdownContent = (options: any[], key: string) => {
    const selectedValues = filters[key as keyof FilterOptions] as string[]
    const allSelected = options.length > 0 && selectedValues.length === options.length

    if (options.length === 0) {
      return <p className="text-sm text-gray-500 py-2 text-center">No hay opciones</p>
    }

    return (
      <div className="space-y-1">
        <label className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 mb-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => handleToggleAll(key, options, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Seleccionar todos</span>
        </label>
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(e) => handleMultiSelectChange(key, option.value, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{option.label}</span>
            {selectedValues.includes(option.value) && <Check className="h-3 w-3 text-blue-600" />}
          </label>
        ))}
      </div>
    )
  }

  return (
    <Card className={cn("w-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700", className)}>
      <div className="p-4 space-y-4">
        {/* Top Bar: Title + Key Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center text-gray-900 dark:text-white">
            <Filter className="h-4 w-4 mr-2 text-blue-500" />
            <h3 className="font-semibold text-lg">Filtros Avanzados</h3>
            {countActiveFilters() > 0 && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                ({countActiveFilters()} activo{countActiveFilters() !== 1 ? 's' : ''})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {countActiveFilters() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1 hidden md:block"></div>
            {/* Report Type Selector Compact */}
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="h-9 px-3 text-sm border-0 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="summary">Resumen</option>
              <option value="detailed">Detallado</option>
              <option value="analytics">Análisis</option>
            </select>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range - Always Visible */}
          <div className="flex items-center gap-2">
            <select
              value={filters.dateRange.type}
              onChange={(e) => handleDateRangeChange('type', e.target.value)}
              className="h-9 pl-3 pr-8 py-1 text-sm border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filters.dateRange.type === 'custom' && (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="date"
                value={filters.dateRange.startDate || ''}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="h-7 text-xs border-0 bg-transparent focus:ring-0 text-gray-700 dark:text-gray-300"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={filters.dateRange.endDate || ''}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="h-7 text-xs border-0 bg-transparent focus:ring-0 text-gray-700 dark:text-gray-300"
              />
            </div>
          )}

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 text-gray-400 hidden md:block"></div>

          {/* Entity Filters Dropdowns */}
          <FilterDropdown
            label="Maquinarias"
            count={filters.machinery.length}
            isOpen={openDropdown === 'machinery'}
            onToggle={() => setOpenDropdown(openDropdown === 'machinery' ? null : 'machinery')}
            onClose={() => setOpenDropdown(null)}
          >
            {renderDropdownContent(machineryOptions, 'machinery')}
          </FilterDropdown>

          <FilterDropdown
            label="Clientes"
            count={filters.clients.length}
            isOpen={openDropdown === 'clients'}
            onToggle={() => setOpenDropdown(openDropdown === 'clients' ? null : 'clients')}
            onClose={() => setOpenDropdown(null)}
          >
            {renderDropdownContent(clientOptions, 'clients')}
          </FilterDropdown>

          <FilterDropdown
            label="Estados"
            count={filters.status.length}
            isOpen={openDropdown === 'status'}
            onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            onClose={() => setOpenDropdown(null)}
          >
            {renderDropdownContent(statusOptions, 'status')}
          </FilterDropdown>

          <FilterDropdown
            label="Prioridad"
            count={filters.priority.length}
            isOpen={openDropdown === 'priority'}
            onToggle={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
            onClose={() => setOpenDropdown(null)}
          >
            {renderDropdownContent(priorityOptions, 'priority')}
          </FilterDropdown>

          <div className="flex-1"></div>

          {/* Export Actions (Mini) */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={() => onExport('pdf')} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 transition-colors" title="Exportar PDF"><Download className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>
    </Card>
  )
}
