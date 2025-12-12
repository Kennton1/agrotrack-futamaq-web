'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, ClipboardList, Calendar, User, MapPin, X, Building2, Wrench, AlertCircle, Truck, FileText, Target } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { useApp } from '@/contexts/AppContext'

const workOrderSchema = z.object({
  client_id: z.number().min(1, 'El cliente es requerido'),
  field_name: z.string().min(1, 'El nombre del campo es requerido'),
  task_type: z.string().min(1, 'El tipo de tarea es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  priority: z.enum(['baja', 'media', 'alta', 'critica'], {
    message: 'La prioridad es requerida',
  }),
  planned_start_date: z.string().min(1, 'La fecha de inicio planificada es requerida'),
  planned_end_date: z.string().min(1, 'La fecha de fin planificada es requerida'),
  assigned_machinery: z.array(z.number()).min(1, 'Debe asignar al menos una maquinaria'),
  target_hectares: z.number().min(0, 'El total de hectáreas no puede ser negativo'),
})

type WorkOrderFormData = z.infer<typeof workOrderSchema>

export default function NuevaOrdenTrabajoPage() {
  const router = useRouter()
  const { addWorkOrder, machinery } = useApp()
  const [selectedMachinery, setSelectedMachinery] = useState<number[]>([])

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      client_id: 0,
      field_name: '',
      task_type: '',
      description: '',
      priority: 'media',
      planned_start_date: new Date().toISOString().split('T')[0],
      planned_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_machinery: [],
      target_hectares: 0,
    },
  })

  const onSubmit = async (data: WorkOrderFormData) => {
    const newWorkOrder = {
      client_id: data.client_id,
      field_name: data.field_name,
      task_type: data.task_type,
      description: data.description,
      priority: data.priority,
      planned_start_date: data.planned_start_date,
      planned_end_date: data.planned_end_date,
      actual_start_date: null,
      actual_end_date: null,
      status: 'planificada' as const,
      assigned_operator: '',
      assigned_machinery: data.assigned_machinery,
      target_hectares: data.target_hectares,
      target_hours: 0,
      actual_hectares: 0,
      actual_hours: 0,
      progress_percentage: 0,
    }

    await addWorkOrder(newWorkOrder)
    router.push('/ordenes-trabajo')
  }

  const handleMachineryChange = (machineryId: number, checked: boolean) => {
    let newSelection: number[]
    if (checked) {
      newSelection = [...selectedMachinery, machineryId]
    } else {
      newSelection = selectedMachinery.filter(id => id !== machineryId)
    }
    setSelectedMachinery(newSelection)
    setValue('assigned_machinery', newSelection)
  }

  const priority = watch('priority')

  const priorityLabels: { [key: string]: string } = {
    'baja': 'BAJA',
    'media': 'MEDIA',
    'alta': 'ALTA',
    'critica': 'CRÍTICA'
  }

  const priorityColors: { [key: string]: string } = {
    'baja': 'bg-gray-500',
    'media': 'bg-blue-500',
    'alta': 'bg-orange-500',
    'critica': 'bg-red-500'
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
                <ClipboardList className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Nueva Orden de Trabajo</h1>
                <p className="text-blue-100">Crea una nueva orden de trabajo con múltiples tareas y operadores</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/ordenes-trabajo')}
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
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Información Principal</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cliente */}
                  <div className="space-y-2">
                    <Label htmlFor="client_id" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Cliente *</span>
                    </Label>
                    <Controller
                      name="client_id"
                      control={control}
                      render={({ field }) => {
                        const clients = [
                          { id: 1, name: 'Agrícola San Antonio S.A.' },
                          { id: 2, name: 'Fundo El Carmen' },
                          { id: 3, name: 'Cooperativa Agrícola Los Ríos' },
                          { id: 4, name: 'Hacienda Santa Rosa' },
                          { id: 5, name: 'Agroindustria del Sur' },
                          { id: 6, name: 'Agrícola San José' },
                          { id: 7, name: 'Campo Verde Ltda.' },
                          { id: 8, name: 'Fundo Los Robles' },
                          { id: 9, name: 'Agrícola del Valle S.A.' },
                          { id: 10, name: 'Hacienda Los Alamos' },
                          { id: 11, name: 'Cooperativa Agrícola del Sur' },
                          { id: 12, name: 'Fundo La Esperanza' },
                          { id: 13, name: 'Agropecuaria Central' },
                          { id: 14, name: 'Hacienda El Mirador' },
                          { id: 15, name: 'Agrícola Los Pinos' }
                        ]

                        const selectedClient = clients.find(c => c.id === field.value)

                        return (
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value > 0 ? field.value.toString() : ''}
                          >
                            <SelectTrigger className={`h-11 ${errors.client_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                              {selectedClient ? (
                                <span className="text-gray-900">{selectedClient.name}</span>
                              ) : (
                                <span className="text-gray-500">Selecciona un cliente</span>
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      }}
                    />
                    {errors.client_id && <p className="text-red-500 text-sm mt-1">{errors.client_id.message}</p>}
                  </div>

                  {/* Campo */}
                  <div className="space-y-2">
                    <Label htmlFor="field_name" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Campo *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="field_name"
                        {...register('field_name')}
                        placeholder="Ej: Potrero Norte"
                        className={`h-11 pl-10 ${errors.field_name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.field_name && <p className="text-red-500 text-sm mt-1">{errors.field_name.message}</p>}
                  </div>

                  {/* Tipo de Tarea */}
                  <div className="space-y-2">
                    <Label htmlFor="task_type" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <span>Tipo de Tarea *</span>
                    </Label>
                    <Controller
                      name="task_type"
                      control={control}
                      render={({ field }) => {
                        const taskTypes = [
                          'Preparación de suelo',
                          'Siembra',
                          'Fertilización',
                          'Fumigación',
                          'Riego',
                          'Cosecha',
                          'Transporte',
                          'Mantenimiento de campo',
                          'Control de malezas',
                          'Arado',
                          'Rastraje',
                          'Subsolado',
                          'Pulverización',
                          'Desmalezado',
                          'Aplicación de herbicida',
                          'Aplicación de fertilizante',
                          'Labranza',
                          'Cultivo',
                          'Otro'
                        ]

                        return (
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <SelectTrigger className={`h-11 ${errors.task_type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                              {field.value ? (
                                <span className="text-gray-900">{field.value}</span>
                              ) : (
                                <SelectValue placeholder="Selecciona el tipo de tarea" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {taskTypes.map((taskType) => (
                                <SelectItem key={taskType} value={taskType}>
                                  {taskType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      }}
                    />
                    {errors.task_type && <p className="text-red-500 text-sm mt-1">{errors.task_type.message}</p>}
                  </div>

                  {/* Prioridad */}
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span>Prioridad *</span>
                    </Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => {
                        const priorityLabels: { [key: string]: string } = {
                          'baja': 'Baja',
                          'media': 'Media',
                          'alta': 'Alta',
                          'critica': 'Crítica'
                        }

                        return (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={`h-11 ${errors.priority ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                              <span className={field.value ? "text-gray-900" : "text-gray-500"}>
                                {field.value ? priorityLabels[field.value] : "Selecciona una prioridad"}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baja">Baja</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="critica">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        )
                      }}
                    />
                    {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
                  </div>

                  {/* Fecha de Inicio Planificada */}
                  <div className="space-y-2">
                    <Label htmlFor="planned_start_date" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Fecha de Inicio Planificada *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="planned_start_date"
                        type="date"
                        {...register('planned_start_date')}
                        className={`h-11 pl-10 ${errors.planned_start_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.planned_start_date && <p className="text-red-500 text-sm mt-1">{errors.planned_start_date.message}</p>}
                  </div>

                  {/* Fecha de Fin Planificada */}
                  <div className="space-y-2">
                    <Label htmlFor="planned_end_date" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Fecha de Fin Planificada *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="planned_end_date"
                        type="date"
                        {...register('planned_end_date')}
                        className={`h-11 pl-10 ${errors.planned_end_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.planned_end_date && <p className="text-red-500 text-sm mt-1">{errors.planned_end_date.message}</p>}
                  </div>

                  {/* Total de Hectáreas */}
                  <div className="space-y-2">
                    <Label htmlFor="target_hectares" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span>Total de Hectáreas</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="target_hectares"
                        type="number"
                        {...register('target_hectares', { valueAsNumber: true })}
                        placeholder="Ej: 45"
                        className={`h-11 pl-10 ${errors.target_hectares ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.target_hectares && <p className="text-red-500 text-sm mt-1">{errors.target_hectares.message}</p>}
                  </div>

                  {/* Maquinarias Asignadas */}
                  <div className="md:col-span-2 space-y-2">
                    <Label className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Maquinarias Asignadas *</span>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {machinery.map((mach) => (
                        <label key={mach.id} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedMachinery.includes(mach.id)}
                            onChange={(e) => handleMachineryChange(mach.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{mach.brand} {mach.model}</span>
                        </label>
                      ))}
                    </div>
                    {errors.assigned_machinery && <p className="text-red-500 text-sm mt-1">{errors.assigned_machinery.message}</p>}
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Descripción *</span>
                    </Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Describe la tarea a realizar..."
                      className={`min-h-[120px] ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                  </div>
                </div>
              </div>

              {/* Resumen de la Orden */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full -ml-12 -mb-12"></div>
                <div className="relative p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Resumen de la Orden</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
                      <p className="text-sm text-gray-600 mb-1">Prioridad</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${priorityColors[priority] || 'bg-gray-500'}`}>
                        {priorityLabels[priority] || 'MEDIA'}
                      </span>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
                      <p className="text-sm text-gray-600 mb-1">Maquinarias</p>
                      <p className="text-2xl font-bold text-blue-700">{selectedMachinery.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
                      <p className="text-sm text-blue-100 mb-1">Total de Hectáreas</p>
                      <p className="text-2xl font-bold">{watch('target_hectares') || 0} ha</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción Mejorados */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/ordenes-trabajo')}
                  className="px-6 h-11 border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="px-8 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Orden de Trabajo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}