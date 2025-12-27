'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Plus, Wrench, Calendar, User, DollarSign, X, Trash2, Edit, Truck, Settings, Clock, FileText, Package, AlertCircle, Activity } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { useApp, MaintenanceItem } from '@/contexts/AppContext'
import { formatCLP } from '@/lib/utils'

const maintenanceSchema = z.object({
  machinery_id: z.number().min(1, 'La maquinaria es requerida'),
  type: z.enum(['preventiva', 'correctiva'], {
    message: 'El tipo de mantenimiento es requerido',
  }),
  status: z.enum(['programada', 'en_ejecucion', 'completada'], {
    message: 'El estado es requerido',
  }),
  scheduled_date: z.string().min(1, 'La fecha programada es requerida'),
  completion_date: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  technician: z.string().min(1, 'El técnico es requerido'),
  odometer_hours: z.number().min(0, 'Las horas del odómetro no pueden ser negativas'),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

interface MaintenanceItemForm {
  id: string
  name: string
  description: string
  type: 'cambio_aceite' | 'cambio_correas' | 'cambio_filtros' | 'ajuste' | 'limpieza' | 'inspeccion' | 'otro'
  cost: number
  estimated_hours: number
  priority: 'baja' | 'media' | 'alta' | 'critica'
  notes?: string
  parts_required?: string[]
}

export default function NuevoMantenimientoPage() {
  const router = useRouter()
  const { addMaintenance, machinery, workOrders } = useApp()
  const [items, setItems] = useState<MaintenanceItemForm[]>([])
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceItemForm | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      machinery_id: machinery.length > 0 ? machinery[0].id : 0,
      type: 'preventiva',
      status: 'programada',
      scheduled_date: new Date().toISOString().split('T')[0],
      completion_date: '',
      description: '',
      technician: '',
      odometer_hours: 0,
    },
  })

  useEffect(() => {
    if (machinery.length > 0) {
      reset({
        machinery_id: machinery[0].id,
        type: 'preventiva',
        status: 'programada',
        scheduled_date: new Date().toISOString().split('T')[0],
        completion_date: '',
        description: '',
        technician: '',
        odometer_hours: 0,
      })
    }
  }, [machinery, reset])

  const selectedMachineryId = watch('machinery_id')
  const selectedMachinery = machinery.find(m => m.id === selectedMachineryId)
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0)
  const scheduledDate = watch('scheduled_date')

  // Validate Machinery Availability
  const getMachineryConflict = (machId: number, date: string) => {
    if (!machId || !date) return null

    // Find active WO that includes this machine and covers the date
    const conflict = workOrders.find(wo => {
      if (wo.status === 'completada' || wo.status === 'cancelada') return false

      const start = new Date(wo.planned_start_date)
      const end = new Date(wo.planned_end_date)
      const checkDate = new Date(date)

      // Reset hours for date comparison
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      checkDate.setHours(0, 0, 0, 0)

      const isDateInUse = checkDate >= start && checkDate <= end
      const hasMachine = wo.assigned_machinery.includes(machId)

      return isDateInUse && hasMachine
    })

    return conflict
  }

  const machineryConflict = getMachineryConflict(selectedMachineryId, scheduledDate)

  const handleAddItem = (item: MaintenanceItemForm) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? item : i))
      setEditingItem(null)
    } else {
      setItems([...items, item])
    }
    setShowItemModal(false)
  }

  const handleEditItem = (item: MaintenanceItemForm) => {
    setEditingItem(item)
    setShowItemModal(true)
  }

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId))
  }

  const onSubmit = async (data: MaintenanceFormData) => {
    if (items.length === 0) {
      toast.error('Debe agregar al menos un ítem de mantenimiento')
      return
    }

    const selectedMachinery = machinery.find(m => m.id === data.machinery_id)
    if (!selectedMachinery) {
      toast.error('Maquinaria no encontrada')
      return
    }

    // Check conflict again on submit
    const conflict = getMachineryConflict(data.machinery_id, data.scheduled_date)
    if (conflict && data.type === 'preventiva') {
      toast.error(`No se puede programar mantenimiento preventivo: Maquinaria ocupada en OT #${conflict.id}`)
      return
    }

    const maintenanceItems: MaintenanceItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      cost: item.cost,
      estimated_hours: item.estimated_hours,
      status: 'pendiente' as const,
      priority: item.priority,
      notes: item.notes,
      parts_required: item.parts_required,
      scheduled_date: data.scheduled_date,
      assigned_technician: data.technician,
    }))

    const partsUsed = items.flatMap(item =>
      (item.parts_required || []).map(part => ({ part, quantity: 1 }))
    )

    const newMaintenance = {
      machinery_id: data.machinery_id,
      machinery_code: `${selectedMachinery.brand} ${selectedMachinery.model}`,
      type: data.type,
      status: data.status,
      scheduled_date: data.scheduled_date,
      completion_date: data.completion_date || null,
      description: data.description,
      cost: totalCost, // Suma de los costos de los items
      items: maintenanceItems,
      parts_used: partsUsed,
      technician: data.technician,
      odometer_hours: data.odometer_hours,
    }

    await addMaintenance(newMaintenance)
    router.push('/mantenimientos')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header mejorado */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <Wrench className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Nuevo Mantenimiento</h1>
                <p className="text-blue-100">Registra un nuevo mantenimiento en el sistema</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/mantenimientos')}
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Información Principal */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Información Principal</h2>
                </div>

                {/* Global Alert for Conflict */}
                {machineryConflict && (
                  <div className={`p-4 rounded-lg flex items-start space-x-3 ${watch('type') === 'preventiva' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <AlertCircle className={`h-5 w-5 mt-0.5 ${watch('type') === 'preventiva' ? 'text-red-600' : 'text-yellow-600'}`} />
                    <div>
                      <h4 className={`text-sm font-semibold ${watch('type') === 'preventiva' ? 'text-red-900' : 'text-yellow-900'}`}>
                        {watch('type') === 'preventiva' ? 'Conflicto de Programación' : 'Advertencia de Uso'}
                      </h4>
                      <p className={`text-sm mt-1 ${watch('type') === 'preventiva' ? 'text-red-700' : 'text-yellow-700'}`}>
                        La maquinaria seleccionada está asignada a la <strong>OT #{machineryConflict.id}</strong> (Cliente {machineryConflict.client_id}) en la fecha seleccionada.
                        {watch('type') === 'preventiva'
                          ? ' No se puede programar mantenimiento preventivo durante una OT activa.'
                          : ' Se permite mantenimiento correctivo, pero considere el impacto en la operación.'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Maquinaria */}
                  <div className="space-y-2">
                    <Label htmlFor="machinery_id" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Maquinaria *</span>
                    </Label>
                    <Controller
                      name="machinery_id"
                      control={control}
                      render={({ field }) => {
                        const selectedMachinery = machinery.find(m => m.id === field.value)
                        return (
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value > 0 ? field.value.toString() : undefined}>
                            <SelectTrigger className={`h-11 ${errors.machinery_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                              {selectedMachinery ? (
                                <span className="text-gray-900">{selectedMachinery.brand} {selectedMachinery.model} ({selectedMachinery.patent})</span>
                              ) : (
                                <SelectValue placeholder="Selecciona una maquinaria" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {machinery.map((mach) => (
                                <SelectItem key={mach.id} value={mach.id.toString()}>
                                  {mach.brand} {mach.model} ({mach.patent})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      }}
                    />
                    {errors.machinery_id && <p className="text-red-500 text-sm mt-1">{errors.machinery_id.message}</p>}
                  </div>

                  {/* Tipo */}
                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Settings className="h-4 w-4 text-blue-600" />
                      <span>Tipo de Mantenimiento *</span>
                    </Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-11 ${errors.type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="preventiva">Preventiva</SelectItem>
                            <SelectItem value="correctiva">Correctiva</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span>Estado *</span>
                    </Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-11 ${errors.status ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="programada">Programada</SelectItem>
                            <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                  </div>

                  {/* Fecha Programada */}
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Fecha Programada *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="scheduled_date"
                        type="date"
                        {...register('scheduled_date')}
                        className={`h-11 pl-10 ${errors.scheduled_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.scheduled_date && <p className="text-red-500 text-sm mt-1">{errors.scheduled_date.message}</p>}
                  </div>

                  {/* Fecha de Completado */}
                  <div className="space-y-2">
                    <Label htmlFor="completion_date" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Fecha de Completado (Opcional)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="completion_date"
                        type="date"
                        {...register('completion_date')}
                        className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Técnico */}
                  <div className="space-y-2">
                    <Label htmlFor="technician" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Técnico *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="technician"
                        {...register('technician')}
                        placeholder="Ej: Juan Pérez"
                        className={`h-11 pl-10 ${errors.technician ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.technician && <p className="text-red-500 text-sm mt-1">{errors.technician.message}</p>}
                  </div>

                  {/* Horas Odómetro */}
                  <div className="space-y-2">
                    <Label htmlFor="odometer_hours" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Horas Odómetro</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="odometer_hours"
                        type="number"
                        {...register('odometer_hours', { valueAsNumber: true })}
                        placeholder="Ej: 3500"
                        className={`h-11 pl-10 ${errors.odometer_hours ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.odometer_hours && <p className="text-red-500 text-sm mt-1">{errors.odometer_hours.message}</p>}
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Descripción *</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe el trabajo de mantenimiento a realizar..."
                    className={`min-h-[120px] ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    rows={4}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
              </div>

              {/* Items de Mantenimiento */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span>Ítems de Mantenimiento</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Agrega los elementos a mantener (cambio de aceite, correas, etc.)</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setEditingItem(null)
                      setShowItemModal(true)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Ítem
                  </Button>
                </div>
                {/* Resumen de costo total */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Costo Total</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Suma de {items.length} {items.length === 1 ? 'ítem' : 'ítems'}</p>
                      <span className="text-3xl font-bold text-blue-700">{formatCLP(totalCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Lista de items */}
                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <Card key={item.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                <Badge variant="default" size="sm" className="bg-gray-50">
                                  {item.type.replace('_', ' ')}
                                </Badge>
                                <Badge
                                  variant={
                                    item.priority === 'critica' ? 'danger' :
                                      item.priority === 'alta' ? 'warning' :
                                        item.priority === 'media' ? 'info' : 'default'
                                  }
                                  size="sm"
                                >
                                  {item.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <DollarSign className="h-4 w-4 text-green-500" />
                                  <span className="text-gray-500">Costo:</span>
                                  <span className="font-semibold text-green-600">{formatCLP(item.cost)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-500">Horas:</span>
                                  <span className="font-medium text-gray-900">{item.estimated_hours}h</span>
                                </div>
                              </div>
                              {item.notes && (
                                <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-600 flex items-start gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>{item.notes}</span>
                                  </p>
                                </div>
                              )}
                              {item.parts_required && item.parts_required.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    Repuestos requeridos:
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.parts_required.map((part, idx) => (
                                      <Badge key={idx} variant="default" size="sm" className="bg-white text-xs">
                                        {part}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                    <CardContent className="p-12 text-center">
                      <div className="p-3 bg-gray-200 rounded-full w-fit mx-auto mb-4">
                        <Wrench className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">No hay ítems agregados</p>
                      <p className="text-sm text-gray-500">Haz clic en &quot;Agregar Ítem&quot; para comenzar</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Información de la maquinaria seleccionada */}
              {selectedMachinery && (
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Información de la Maquinaria</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
                        <p className="text-sm text-gray-600 mb-1">Marca</p>
                        <p className="text-lg font-bold text-gray-900">{selectedMachinery.brand}</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
                        <p className="text-sm text-gray-600 mb-1">Modelo</p>
                        <p className="text-lg font-bold text-gray-900">{selectedMachinery.model}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
                        <p className="text-sm text-blue-100 mb-1">Horas Actuales</p>
                        <p className="text-lg font-bold">{selectedMachinery.total_hours.toLocaleString()} hr</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Acción Mejorados */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/mantenimientos')}
                  className="px-6 h-11 border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={items.length === 0}
                  className="px-8 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Mantenimiento
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Modal para agregar/editar item */}
        {showItemModal && (
          <ItemModal
            item={editingItem}
            onSave={handleAddItem}
            onClose={() => {
              setShowItemModal(false)
              setEditingItem(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Componente modal para agregar/editar items
function ItemModal({
  item,
  onSave,
  onClose
}: {
  item: MaintenanceItemForm | null
  onSave: (item: MaintenanceItemForm) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<MaintenanceItemForm>({
    id: item?.id || `MI-${Date.now()}`,
    name: item?.name || '',
    description: item?.description || '',
    type: item?.type || 'cambio_aceite',
    cost: item?.cost || 0,
    estimated_hours: item?.estimated_hours || 0,
    priority: item?.priority || 'media',
    notes: item?.notes || '',
    parts_required: item?.parts_required || [],
  })
  const [partsInput, setPartsInput] = useState(item?.parts_required?.join(', ') || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.description || formData.cost <= 0) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    const parts = partsInput.split(',').map(p => p.trim()).filter(p => p)
    onSave({
      ...formData,
      parts_required: parts.length > 0 ? parts : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {item ? 'Editar Ítem' : 'Agregar Ítem de Mantenimiento'}
          </h3>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item_name">Nombre del Ítem *</Label>
            <Input
              id="item_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Cambio de aceite motor"
              required
            />
          </div>

          <div>
            <Label htmlFor="item_description">Descripción *</Label>
            <Textarea
              id="item_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el trabajo a realizar..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item_type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as MaintenanceItemForm['type'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cambio_aceite">Cambio de Aceite</SelectItem>
                  <SelectItem value="cambio_correas">Cambio de Correas</SelectItem>
                  <SelectItem value="cambio_filtros">Cambio de Filtros</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="inspeccion">Inspección</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item_priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as MaintenanceItemForm['priority'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item_cost">Costo ($) *</Label>
              <Input
                id="item_cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="item_hours">Horas Estimadas</Label>
              <Input
                id="item_hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="item_parts">Repuestos Requeridos</Label>
            <Input
              id="item_parts"
              value={partsInput}
              onChange={(e) => setPartsInput(e.target.value)}
              placeholder="Separados por comas (Ej: Filtro de aceite, Aceite motor)"
            />
            <p className="text-xs text-gray-500 mt-1">Separa los repuestos con comas</p>
          </div>

          <div>
            <Label htmlFor="item_notes">Notas (Opcional)</Label>
            <Textarea
              id="item_notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? 'Guardar Cambios' : 'Agregar Ítem'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
