'use client'

import React, { useState } from 'react'
import { useMobile } from '@/hooks/useMobile'
import { Button } from '@/components/ui/Button'
import { ChevronDown, ChevronUp, Eye, Edit, Trash2 } from 'lucide-react'

interface Column {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'currency' | 'status'
  format?: (value: any) => string
  mobilePriority?: number // 1 = más importante, 3 = menos importante
}

interface MobileTableProps {
  data: any[]
  columns: Column[]
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  className?: string
  showActions?: boolean
}

export default function MobileTable({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  className = '',
  showActions = true
}: MobileTableProps) {
  const { isMobile, isTablet } = useMobile()
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const formatValue = (value: any, type: string = 'text') => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
        }).format(value)
      case 'date':
        return new Date(value).toLocaleDateString('es-CL')
      case 'number':
        return new Intl.NumberFormat('es-CL').format(value)
      default:
        return String(value || '')
    }
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'disponible': 'bg-success-100 text-success-800',
      'en_faena': 'bg-primary-100 text-primary-800',
      'en_mantencion': 'bg-warning-100 text-warning-800',
      'fuera_servicio': 'bg-danger-100 text-danger-800',
      'planificada': 'bg-gray-100 text-gray-800',
      'en_ejecucion': 'bg-primary-100 text-primary-800',
      'completada': 'bg-success-100 text-success-800',
      'retrasada': 'bg-danger-100 text-danger-800',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  // En móvil, mostrar como tarjetas
  if (isMobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((row, index) => {
          const isExpanded = expandedRows.has(index)
          const primaryColumns = columns.filter(col => col.mobilePriority === 1)
          const secondaryColumns = columns.filter(col => col.mobilePriority === 2)
          const tertiaryColumns = columns.filter(col => col.mobilePriority === 3)

          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Contenido principal */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => onRowClick ? onRowClick(row) : toggleRow(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {primaryColumns.map((col) => (
                      <div key={col.key} className="mb-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {col.label}
                        </span>
                        <div className="text-sm font-medium text-gray-900">
                          {col.type === 'status' ? (
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[col.key])}`}>
                              {formatValue(row[col.key], col.type)}
                            </span>
                          ) : (
                            formatValue(row[col.key], col.type)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {showActions && (
                      <div className="flex space-x-1">
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(row)
                            }}
                            className="p-1 h-8 w-8"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(row)
                            }}
                            className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRow(index)
                      }}
                      className="p-1 h-8 w-8"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-3">
                    {secondaryColumns.map((col) => (
                      <div key={col.key} className="flex justify-between">
                        <span className="text-sm text-gray-500">{col.label}:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {col.type === 'status' ? (
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[col.key])}`}>
                              {formatValue(row[col.key], col.type)}
                            </span>
                          ) : (
                            formatValue(row[col.key], col.type)
                          )}
                        </span>
                      </div>
                    ))}
                    
                    {tertiaryColumns.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="space-y-2">
                          {tertiaryColumns.map((col) => (
                            <div key={col.key} className="flex justify-between">
                              <span className="text-xs text-gray-500">{col.label}:</span>
                              <span className="text-xs font-medium text-gray-700">
                                {formatValue(row[col.key], col.type)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // En tablet, mostrar tabla compacta
  if (isTablet) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {showActions && (
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {col.type === 'status' ? (
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[col.key])}`}>
                        {formatValue(row[col.key], col.type)}
                      </span>
                    ) : (
                      formatValue(row[col.key], col.type)
                    )}
                  </td>
                ))}
                {showActions && (
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-1">
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(row)
                          }}
                          className="p-1 h-7 w-7"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(row)
                          }}
                          className="p-1 h-7 w-7 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // En desktop, mostrar tabla normal
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr
              key={index}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {col.type === 'status' ? (
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[col.key])}`}>
                      {formatValue(row[col.key], col.type)}
                    </span>
                  ) : (
                    formatValue(row[col.key], col.type)
                  )}
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(row)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(row)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


