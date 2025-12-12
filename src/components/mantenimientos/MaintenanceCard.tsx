'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCLP, formatDate } from '@/lib/utils'
import { 
  Calendar, CheckCircle, Clock, DollarSign, Edit, Eye, Trash2, User, Wrench, AlertTriangle, XCircle
} from 'lucide-react'
import { Maintenance } from '@/data/maintenanceData'

interface MaintenanceCardProps {
  maintenance: Maintenance
  onView?: (m: Maintenance) => void
  onEdit?: (m: Maintenance) => void
  onDelete?: (m: Maintenance) => void
}

function getStatusIcon(status: Maintenance['status']) {
  switch (status) {
    case 'planificado':
      return <Calendar className="h-5 w-5 text-blue-500" />
    case 'en_progreso':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'completado':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'retrasado':
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <Wrench className="h-5 w-5 text-gray-500" />
  }
}

function getStatusBadgeVariant(status: Maintenance['status']) {
  switch (status) {
    case 'planificado':
      return 'default' as const
    case 'en_progreso':
      return 'info' as const
    case 'completado':
      return 'success' as const
    case 'retrasado':
      return 'danger' as const
    default:
      return 'default' as const
  }
}

function getPriorityBadgeVariant(priority: Maintenance['priority']) {
  switch (priority) {
    case 'critica':
      return 'danger' as const
    case 'alta':
      return 'warning' as const
    case 'media':
      return 'info' as const
    case 'baja':
      return 'default' as const
    default:
      return 'default' as const
  }
}


export function MaintenanceCard({ maintenance, onView, onEdit, onDelete }: MaintenanceCardProps) {
  const progressPct = maintenance.status === 'completado' 
    ? 100 
    : Math.min(
        100,
        Math.round(
          (Number(maintenance.total_actual_hours || 0) /
            (maintenance.total_estimated_hours || 1)) * 100
        )
      )

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group w-full"
    >
      {/* Header compacto con ID, estado y prioridad */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Icono de estado */}
          {getStatusIcon(maintenance.status)}
          
          {/* ID y descripción principal */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">{maintenance.id}</h3>
            <p className="text-sm text-gray-600 font-medium truncate">
              {maintenance.machinery_name} - {maintenance.type}
            </p>
          </div>
        </div>

        {/* Badges de estado y prioridad */}
        <div className="flex items-center space-x-2 ml-3">
          <Badge 
            variant={getStatusBadgeVariant(maintenance.status)} 
            size="sm"
            className="shadow-sm"
          >
            {maintenance.status.replace('_', ' ')}
          </Badge>
          <Badge 
            variant={getPriorityBadgeVariant(maintenance.priority)} 
            size="sm"
            className="shadow-sm"
          >
            {maintenance.priority}
          </Badge>
        </div>
      </div>

      {/* Información compacta en una sola línea */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">Programado:</span>
            <span className="font-semibold text-gray-900">{formatDate(maintenance.scheduled_date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-gray-500">Estimado:</span>
            <span className="font-semibold text-green-700">{formatCLP(maintenance.total_estimated_cost)}</span>
          </div>
          {maintenance.total_actual_cost != null && (
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-gray-500">Real:</span>
              <span className="font-semibold text-emerald-700">{formatCLP(maintenance.total_actual_cost)}</span>
            </div>
          )}
        </div>
        
        {/* Progreso */}
        <div className="flex items-center space-x-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 min-w-[2.5rem]">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Descripción compacta */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-1">
          {maintenance.description}
        </p>
      </div>

      {/* Footer compacto con técnico y acciones */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 text-sm">
        <div className="flex items-center space-x-4">
          {/* Técnico asignado */}
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700 text-xs">
              {maintenance.assigned_technician}
            </span>
          </div>
          
          {/* Items de mantenimiento */}
          <div className="flex items-center space-x-1">
            <Wrench className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700 text-xs">
              {maintenance.items?.length || 0} ítems
            </span>
          </div>
          
          {/* Horas estimadas */}
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700 text-xs">{maintenance.total_estimated_hours}h</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onView?.(maintenance)}
            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
            title="Ver detalles"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit?.(maintenance)}
            className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600"
            title="Editar"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete?.(maintenance)}
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}



