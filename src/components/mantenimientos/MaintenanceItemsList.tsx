'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Wrench, Clock, DollarSign, User, CheckCircle, 
  AlertTriangle, XCircle, Plus, Eye, Edit, Trash2,
  Package, Calendar
} from 'lucide-react'
import { MaintenanceItem } from '@/data/maintenanceData'

interface MaintenanceItemsListProps {
  items: MaintenanceItem[]
  onEditItem?: (item: MaintenanceItem) => void
  onDeleteItem?: (item: MaintenanceItem) => void
  onAddItem?: () => void
  readOnly?: boolean
  showCosts?: boolean
}

export function MaintenanceItemsList({ 
  items, 
  onEditItem, 
  onDeleteItem, 
  onAddItem, 
  readOnly = false,
  showCosts = true 
}: MaintenanceItemsListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'en_progreso': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'pendiente': return <AlertTriangle className="h-4 w-4 text-gray-500" />
      default: return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completado': return 'success' as const
      case 'en_progreso': return 'warning' as const
      case 'pendiente': return 'default' as const
      default: return 'danger' as const
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'baja': return 'default' as const
      case 'media': return 'info' as const
      case 'alta': return 'warning' as const
      case 'critica': return 'danger' as const
      default: return 'default' as const
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cambio_aceite': return '🛢️'
      case 'cambio_correas': return '⚙️'
      case 'cambio_filtros': return '🔧'
      case 'ajuste': return '🔩'
      case 'limpieza': return '🧽'
      case 'inspeccion': return '🔍'
      default: return '🔧'
    }
  }

  const totalEstimatedCost = items.reduce((sum, item) => sum + item.cost, 0)
  const totalEstimatedHours = items.reduce((sum, item) => sum + item.estimated_hours, 0)
  const totalActualHours = items
    .filter(item => item.actual_hours)
    .reduce((sum, item) => sum + (item.actual_hours || 0), 0)

  return (
    <div className="space-y-4">
      {/* Resumen de ítems */}
      <Card variant="modern" className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Resumen de Ítems de Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500">Total Ítems</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
            {showCosts && (
              <div className="text-center">
                <p className="text-gray-500">Costo Estimado</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalEstimatedCost.toLocaleString()}
                </p>
              </div>
            )}
            <div className="text-center">
              <p className="text-gray-500">Horas Estimadas</p>
              <p className="text-2xl font-bold text-blue-600">{totalEstimatedHours}h</p>
            </div>
            {totalActualHours > 0 && (
              <div className="text-center">
                <p className="text-gray-500">Horas Reales</p>
                <p className="text-2xl font-bold text-orange-600">{totalActualHours}h</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de ítems */}
      <div className="space-y-3">
        {items.map((item) => {
          const isExpanded = expandedItems.has(item.id)
          
          return (
            <Card 
              key={item.id} 
              variant="modern" 
              className={`transition-all duration-300 hover:shadow-lg ${
                item.status === 'completado' ? 'border-l-4 border-green-500' :
                item.status === 'en_progreso' ? 'border-l-4 border-yellow-500' :
                item.status === 'pendiente' ? 'border-l-4 border-gray-300' :
                'border-l-4 border-red-500'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(item.status)}
                        <Badge variant={getStatusBadgeVariant(item.status)} size="sm">
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Badge variant={getPriorityBadgeVariant(item.priority)} size="sm">
                        {item.priority}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{item.estimated_hours}h estimadas</span>
                        {item.actual_hours && (
                          <span className="text-orange-600">({item.actual_hours}h reales)</span>
                        )}
                      </div>
                      {showCosts && (
                        <div className="flex items-center space-x-1 text-sm text-green-600 font-medium">
                          <DollarSign className="h-4 w-4" />
                          <span>${item.cost.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Información expandida */}
                    {isExpanded && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                        {item.assigned_technician && (
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Técnico: {item.assigned_technician}</span>
                          </div>
                        )}
                        
                        {item.scheduled_date && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              Programado: {new Date(item.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {item.completed_date && (
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700">
                              Completado: {new Date(item.completed_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {item.notes && (
                          <div className="text-sm">
                            <p className="text-gray-500 mb-1">Notas:</p>
                            <p className="text-gray-700 bg-white p-2 rounded border">
                              {item.notes}
                            </p>
                          </div>
                        )}
                        
                        {item.parts_required && item.parts_required.length > 0 && (
                          <div className="text-sm">
                            <p className="text-gray-500 mb-1">Repuestos requeridos:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.parts_required.map((part, index) => (
                                <Badge key={index} variant="default" size="sm">
                                  {part}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                      title={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {!readOnly && (
                      <>
                        {onEditItem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditItem(item)}
                            title="Editar ítem"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {onDeleteItem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteItem(item)}
                            title="Eliminar ítem"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botón agregar ítem */}
      {!readOnly && onAddItem && (
        <Card variant="modern" className="border-dashed border-2 border-gray-300 hover:border-primary-400 transition-colors">
          <CardContent className="p-6 text-center">
            <Button
              variant="ghost"
              onClick={onAddItem}
              className="w-full h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Plus className="h-8 w-8 text-gray-400" />
              <span className="text-gray-500">Agregar ítem de mantenimiento</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}








































