'use client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Clock, Calendar, User, Truck, MapPin, Eye, Edit, Trash2,
  AlertTriangle, CheckCircle, XCircle, ClipboardList
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface WorkOrderCardProps {
  order: {
    id: string
    client_id: number
    field_name: string
    task_type: string
    description: string
    priority: 'critica' | 'alta' | 'media' | 'baja'
    planned_start_date: string
    planned_end_date: string
    actual_start_date?: string | null
    actual_end_date?: string | null
    status: 'planificada' | 'en_ejecucion' | 'completada' | 'retrasada'
    assigned_operators: string[]
    assigned_machinery: number[]
    tasks?: Array<{
      id: string
      name: string
      description: string
      status: string
      progress: number
      target_hours: number
      actual_hours: number
      assigned_operator: string
      assigned_machinery: number[]
    }>
    target_hectares: number
    target_hours: number
    actual_hectares: number
    actual_hours: number
    progress_percentage: number
  }
  onView?: (order: any) => void
  onEdit?: (order: any) => void
  onDelete?: (order: any) => void
}

export function WorkOrderCard({ order, onView, onEdit, onDelete }: WorkOrderCardProps) {

  // Función para obtener el icono según el estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planificada':
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'en_ejecucion':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'completada':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'retrasada':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  // Función para obtener el color del badge de estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planificada':
        return 'default' as const
      case 'en_ejecucion':
        return 'info' as const
      case 'completada':
        return 'success' as const
      case 'retrasada':
        return 'danger' as const
      default:
        return 'default' as const
    }
  }

  // Función para obtener el label del estado
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planificada':
        return 'Planificada'
      case 'en_ejecucion':
        return 'En Ejecución'
      case 'completada':
        return 'Completada'
      case 'retrasada':
        return 'Retrasada'
      default:
        return status
    }
  }

  // Función para obtener el color del badge de prioridad
  const getPriorityBadgeVariant = (priority: string) => {
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

  // Función para obtener el label de prioridad
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critica':
        return 'Crítica'
      case 'alta':
        return 'Alta'
      case 'media':
        return 'Media'
      case 'baja':
        return 'Baja'
      default:
        return priority
    }
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group w-full h-full flex flex-col"
    >
      {/* Header compacto con ID, estado y prioridad */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Icono de estado */}
          {getStatusIcon(order.status)}
          
          {/* ID y descripción principal */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">{order.id}</h3>
            <p className="text-sm text-gray-600 font-medium truncate">
              {order.field_name} - {order.task_type}
            </p>
          </div>
        </div>

        {/* Badges de estado y prioridad - en una línea separada */}
        <div className="flex flex-col items-end space-y-1 ml-3">
          <Badge 
            variant={getStatusBadgeVariant(order.status)} 
            size="sm"
            className="shadow-sm"
          >
            {getStatusLabel(order.status)}
          </Badge>
          <Badge 
            variant={getPriorityBadgeVariant(order.priority)} 
            size="sm"
            className="shadow-sm"
          >
            {getPriorityLabel(order.priority)}
          </Badge>
        </div>
      </div>

      {/* Información de cliente y fechas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          {/* Cliente */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Cliente:</span>
            <span className="text-sm font-semibold text-gray-900">Cliente {order.client_id}</span>
          </div>
        </div>
        
        {/* Fechas en una línea */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-500">Inicio:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatDate(order.planned_start_date)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-500">Fin:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatDate(order.planned_end_date)}
              </span>
            </div>
          </div>
          
          {/* Progreso */}
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary transition-all duration-500 ease-out"
                style={{ width: `${order.progress_percentage}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700 min-w-[2.5rem]">
              {order.progress_percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Contenido principal que se expande */}
      <div className="flex-1 flex flex-col">
        {/* Descripción compacta */}
        <div className="mb-3">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
            {order.description}
          </p>
        </div>

        {/* Lista de tareas compacta si existen */}
        {order.tasks && order.tasks.length > 0 && (
          <div className="mb-3 pt-3 border-t border-gray-200/50">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Tareas ({order.tasks.length})
            </h4>
            <div className="space-y-1">
              {order.tasks.slice(0, 2).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.name}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <Badge 
                      variant={task.status === 'completada' ? 'success' : task.status === 'en_ejecucion' ? 'info' : 'default'}
                      size="sm"
                    >
                      {task.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{task.progress}%</span>
                  </div>
                </div>
              ))}
              {order.tasks.length > 2 && (
                <p className="text-xs text-gray-500 text-center">
                  +{order.tasks.length - 2} tareas más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Spacer para empujar el footer hacia abajo */}
        <div className="flex-1"></div>

        {/* Footer compacto con recursos asignados y acciones */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 text-sm mt-auto">
          <div className="flex items-center space-x-3">
            {/* Operadores asignados */}
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700 text-xs">
                {order.assigned_operators && order.assigned_operators.length > 1 
                  ? `${order.assigned_operators.length} operadores`
                  : order.assigned_operators && order.assigned_operators.length > 0
                  ? order.assigned_operators[0]
                  : 'Sin asignar'
                }
              </span>
            </div>
            
            {/* Maquinarias asignadas */}
            <div className="flex items-center space-x-1">
              <Truck className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700 text-xs">
                {order.assigned_machinery.length} máquinas
              </span>
            </div>
            
            {/* Área en hectáreas */}
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700 text-xs">{order.target_hectares} ha</span>
            </div>
          </div>

          {/* Acciones en el footer */}
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onView?.(order)}
              className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
              title="Ver detalles"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(order)}
              className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600"
              title="Editar"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete?.(order)}
              className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
