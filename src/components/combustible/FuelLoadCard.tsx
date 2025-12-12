'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCLP, formatDate } from '@/lib/utils'
import { FuelLoad, Machinery } from '@/contexts/AppContext'
import {
  Fuel, User, MapPin, DollarSign, Edit, Eye, Trash2, CheckCircle, AlertTriangle, Image as ImageIcon, Receipt, FileText
} from 'lucide-react'

interface FuelLoadCardProps {
  load: FuelLoad
  machinery?: Machinery[]
  onView?: (l: FuelLoad) => void
  onEdit?: (l: FuelLoad) => void
  onDelete?: (l: FuelLoad) => void
}

function getSourceBadgeVariant(source: string) {
  return source === 'bodega' ? 'info' as const : 'success' as const
}

function getSourceLabel(source: string) {
  return source === 'bodega' ? 'Bodega' : 'Estación'
}

export function FuelLoadCard({ load, machinery = [], onView, onEdit, onDelete }: FuelLoadCardProps) {
  // Buscar la maquinaria completa para obtener marca y modelo
  const machineryInfo = machinery.find(m => m.id === load.machinery_id)
  const machineryName = machineryInfo
    ? `${machineryInfo.brand} ${machineryInfo.model}`
    : load.machinery_code

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-bold text-gray-900 truncate">{machineryName}</h3>
            </div>
          </div>
          <Badge
            variant={getSourceBadgeVariant(load.source || 'estacion')}
            size="sm"
          >
            {getSourceLabel(load.source || 'estacion')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Fecha</p>
            <p className="font-medium text-xs">{formatDate(load.date)}</p>
          </div>
          <div>
            <p className="text-gray-500">Litros</p>
            <p className="font-medium">{load.liters}L</p>
          </div>
          <div>
            <p className="text-gray-500">Costo Total</p>
            <p className="font-medium text-xs">{formatCLP(load.total_cost)}</p>
          </div>
          <div>
            <p className="text-gray-500">Costo/L</p>
            <p className="font-medium text-xs">{formatCLP(load.cost_per_liter)}</p>
          </div>
        </div>

        {(load as any).operator_name && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span className="truncate">{(load as any).operator_name || load.operator}</span>
          </div>
        )}

        {(load as any).location && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{(load as any).location}</span>
          </div>
        )}

        {load.work_order_id && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <FileText className="h-3 w-3" />
            <span>OT: {load.work_order_id}</span>
          </div>
        )}

        {(load.fuel_load_image || load.receipt_image) && (
          <div className="flex items-center space-x-2">
            {load.fuel_load_image && (
              <div className="p-1 rounded-full bg-blue-100 text-blue-600" title="Foto de carga disponible">
                <ImageIcon className="h-3 w-3" />
              </div>
            )}
            {load.receipt_image && (
              <div className="p-1 rounded-full bg-green-100 text-green-600" title="Boleta disponible">
                <Receipt className="h-3 w-3" />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-2 border-t">
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(load)}
              title="Ver detalles"
              className="h-7 w-7 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(load)}
              title="Editar"
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(load)}
              title="Eliminar"
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



