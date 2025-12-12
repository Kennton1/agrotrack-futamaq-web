'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import {
  Plus, X, Save, Calendar, User, MapPin, Clock,
  Truck, AlertTriangle, CheckCircle, Zap, Target,
  Wrench, FileText, ClipboardList, Building2, AlertCircle, Trash2
} from 'lucide-react'
import { Label } from '@/components/ui/Label'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

interface TaskFormData {
  id: string
  name: string
  description: string
  estimatedHours: number
  assignedMachinery: number[]
}

interface FormData {
  client_id: number
  field: string
  taskType: string
  priority: 'baja' | 'media' | 'alta' | 'critica'
  plannedStartDate: string
  plannedEndDate: string
  targetHectares: number
  assignedMachinery: number[]
  description: string
  tasks: TaskFormData[]
}

export default function NuevaOrdenTrabajoPage() {
  const router = useRouter()
  const { addWorkOrder, machinery } = useApp()
  const [loading, setLoading] = useState(false)
  const [currentTask, setCurrentTask] = useState<TaskFormData>({
    id: '',
    name: '',
    description: '',
    estimatedHours: 0,
    assignedMachinery: []
  })

  const [formData, setFormData] = useState<FormData>({
    client_id: 0,
    field: '',
    taskType: '',
    priority: 'media',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetHectares: 0,
    assignedMachinery: [],
    description: '',
    tasks: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock data - Clientes con sus campos asociados
  const clientsWithFields: Record<number, string[]> = {
    1: ['Potrero Norte', 'Potrero Sur', 'Sector Este', 'Lote 5', 'Campo Central'],
    2: ['Parcela A', 'Parcela B', 'Sector Oeste', 'Lote 12'],
    3: ['Campo Los Ríos', 'Sector Norte', 'Potrero 1', 'Potrero 2', 'Lote 8'],
    4: ['Hacienda Principal', 'Sector Sur', 'Campo Nuevo', 'Lote 15'],
    5: ['Potrero Industrial', 'Sector Este', 'Campo Sur', 'Lote 20', 'Parcela Central'],
    6: ['Campo San José', 'Sector Norte', 'Potrero A', 'Potrero B', 'Lote 10'],
    7: ['Campo Verde Norte', 'Campo Verde Sur', 'Sector Central', 'Lote 7'],
    8: ['Fundo Principal', 'Sector Los Robles', 'Potrero 1', 'Potrero 2', 'Lote 3'],
    9: ['Valle Norte', 'Valle Sur', 'Sector Este', 'Campo Central', 'Lote 18'],
    10: ['Hacienda Los Alamos', 'Sector Principal', 'Potrero Norte', 'Lote 22'],
    11: ['Campo Cooperativo', 'Sector Sur', 'Potrero 1', 'Potrero 2', 'Lote 9'],
    12: ['Fundo La Esperanza', 'Sector Norte', 'Campo Central', 'Lote 11'],
    13: ['Agropecuaria Norte', 'Agropecuaria Sur', 'Sector Central', 'Lote 14'],
    14: ['Hacienda El Mirador', 'Sector Principal', 'Campo Este', 'Lote 16'],
    15: ['Campo Los Pinos', 'Sector Norte', 'Potrero Central', 'Lote 19']
  }

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

  // Obtener campos disponibles para el cliente seleccionado
  const availableFields = formData.client_id > 0
    ? (clientsWithFields[formData.client_id] || [])
    : []

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


  // Función para determinar qué maquinarias son relevantes para un tipo de tarea
  const getRelevantMachineryForTaskType = (taskType: string): number[] => {
    if (!taskType) return machinery.map(m => m.id) // Si no hay tipo seleccionado, mostrar todas

    const taskTypeLower = taskType.toLowerCase()
    const brand = (m: typeof machinery[0]) => m.brand.toLowerCase()

    // Preparación del suelo
    if (taskTypeLower.includes('preparación') || taskTypeLower.includes('preparacion') ||
      taskTypeLower.includes('arado') || taskTypeLower.includes('rastraje') ||
      taskTypeLower.includes('subsolado') || taskTypeLower.includes('labranza')) {
      return machinery.filter(m => {
        const b = brand(m)
        return b.includes('tractor') || b.includes('arado') || b.includes('rastra') ||
          b.includes('subsolador') || b.includes('rodillo')
      }).map(m => m.id)
    }

    // Siembra y plantación
    if (taskTypeLower.includes('siembra') || taskTypeLower.includes('cultivo') ||
      taskTypeLower.includes('fertilización') || taskTypeLower.includes('fertilizacion') ||
      taskTypeLower.includes('aplicación de fertilizante') || taskTypeLower.includes('aplicacion de fertilizante')) {
      return machinery.filter(m => {
        const b = brand(m)
        return m.type === 'tractor' || // Tractores necesarios para sembradoras
          b.includes('sembradora') || b.includes('plantadora') || b.includes('trasplantadora') ||
          b.includes('abonadora') || b.includes('fertilizadora') || b.includes('cisterna')
      }).map(m => m.id)
    }

    // Cuidado del cultivo
    if (taskTypeLower.includes('fumigación') || taskTypeLower.includes('fumigacion') ||
      taskTypeLower.includes('pulverización') || taskTypeLower.includes('pulverizacion') ||
      taskTypeLower.includes('aplicación de herbicida') || taskTypeLower.includes('aplicacion de herbicida') ||
      taskTypeLower.includes('control de malezas') || taskTypeLower.includes('desmalezado') ||
      taskTypeLower.includes('riego')) {
      return machinery.filter(m => {
        const b = brand(m)
        return m.type === 'tractor' || // Tractores necesarios para pulverizadoras de arrastre
          b.includes('pulverizadora') || b.includes('fumigadora') || b.includes('cultivador') ||
          b.includes('desmalezadora') || b.includes('cortacésped') || b.includes('riego')
      }).map(m => m.id)
    }

    // Cosecha
    if (taskTypeLower.includes('cosecha')) {
      return machinery.filter(m => {
        const b = brand(m)
        return m.type === 'tractor' || // Tractores para segadoras y otras máquinas de cosecha
          b.includes('cosechadora') || b.includes('cabezal') || b.includes('segadora') ||
          b.includes('acondicionadora') || b.includes('hileradora') || b.includes('embaladora') ||
          b.includes('empacadora')
      }).map(m => m.id)
    }

    // Transporte
    if (taskTypeLower.includes('transporte')) {
      return machinery.filter(m => m.type === 'camion').map(m => m.id)
    }

    // Mantenimiento de campo - puede usar varias categorías
    if (taskTypeLower.includes('mantenimiento')) {
      return machinery.map(m => m.id) // Mostrar todas para mantenimiento
    }

    // Por defecto, mostrar todas
    return machinery.map(m => m.id)
  }

  // Obtener maquinarias filtradas según el tipo de tarea
  const filteredMachinery = formData.taskType
    ? machinery.filter(m => getRelevantMachineryForTaskType(formData.taskType).includes(m.id))
    : machinery

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      // Si se cambia el tipo de tarea, limpiar las maquinarias seleccionadas que no sean relevantes
      if (field === 'taskType') {
        const relevantIds = getRelevantMachineryForTaskType(value)
        newData.assignedMachinery = prev.assignedMachinery.filter(id => relevantIds.includes(id))
      }

      // Si se cambia el cliente, limpiar el campo seleccionado
      if (field === 'client_id') {
        newData.field = ''
      }

      return newData
    })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTaskInputChange = (field: string, value: any) => {
    setCurrentTask(prev => ({ ...prev, [field]: value }))
  }

  const handleMachineryToggle = (machineryId: number) => {
    setFormData(prev => ({
      ...prev,
      assignedMachinery: prev.assignedMachinery.includes(machineryId)
        ? prev.assignedMachinery.filter(id => id !== machineryId)
        : [...prev.assignedMachinery, machineryId]
    }))
  }

  const handleTaskMachineryToggle = (machineryId: number) => {
    setCurrentTask(prev => ({
      ...prev,
      assignedMachinery: prev.assignedMachinery.includes(machineryId)
        ? prev.assignedMachinery.filter(id => id !== machineryId)
        : [...prev.assignedMachinery, machineryId]
    }))
  }

  const addTask = () => {
    if (!currentTask.name.trim()) {
      toast.error('El nombre de la tarea es requerido')
      return
    }
    if (!currentTask.description.trim()) {
      toast.error('La descripción es requerida')
      return
    }
    if (currentTask.estimatedHours <= 0) {
      toast.error('Las horas estimadas deben ser mayor a 0')
      return
    }

    const newTask: TaskFormData = {
      ...currentTask,
      id: `T${Date.now()}`
    }

    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))

    setCurrentTask({
      id: '',
      name: '',
      description: '',
      estimatedHours: 0,
      assignedMachinery: []
    })

    toast.success('Tarea agregada exitosamente')
  }

  const removeTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.client_id) newErrors.client_id = 'Cliente es requerido'
    if (!formData.field.trim()) newErrors.field = 'Campo es requerido'
    if (!formData.taskType.trim()) newErrors.taskType = 'Tipo de tarea es requerido'
    if (!formData.plannedStartDate) newErrors.plannedStartDate = 'Fecha de inicio es requerida'
    if (!formData.plannedEndDate) newErrors.plannedEndDate = 'Fecha de fin es requerida'
    if (formData.assignedMachinery.length === 0) newErrors.assignedMachinery = 'Al menos una maquinaria es requerida'
    if (!formData.description.trim()) newErrors.description = 'Descripción es requerida'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)
    try {
      const newWorkOrder = {
        client_id: formData.client_id,
        field_name: formData.field,
        task_type: formData.taskType,
        description: formData.description,
        priority: formData.priority,
        planned_start_date: formData.plannedStartDate,
        planned_end_date: formData.plannedEndDate,
        actual_start_date: null,
        actual_end_date: null,
        status: 'planificada' as const,
        assigned_operator: '',
        assigned_machinery: formData.assignedMachinery,
        target_hectares: formData.targetHectares,
        target_hours: formData.tasks.reduce((sum, task) => sum + task.estimatedHours, 0),
        actual_hectares: 0,
        actual_hours: 0,
        progress_percentage: 0,
      }

      addWorkOrder(newWorkOrder)
      toast.success('Orden de trabajo creada exitosamente')
      router.push('/ordenes-trabajo')
    } catch (error) {
      toast.error('Error al crear la orden de trabajo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
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
                    <Select
                      value={formData.client_id.toString()}
                      onValueChange={(value) => handleInputChange('client_id', parseInt(value))}
                    >
                      <SelectTrigger className={`h-11 ${errors.client_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                        {formData.client_id > 0 ? (
                          <span className="text-gray-900">{clients.find(c => c.id === formData.client_id)?.name}</span>
                        ) : (
                          <SelectValue placeholder="Selecciona un cliente" />
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
                    {errors.client_id && <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>}
                  </div>

                  {/* Campo */}
                  <div className="space-y-2">
                    <Label htmlFor="field" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Campo *</span>
                    </Label>
                    {formData.client_id > 0 ? (
                      <Select
                        value={formData.field}
                        onValueChange={(value) => handleInputChange('field', value)}
                        disabled={availableFields.length === 0}
                      >
                        <SelectTrigger className={`h-11 ${errors.field ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                          {formData.field ? (
                            <span className="text-gray-900">{formData.field}</span>
                          ) : (
                            <SelectValue placeholder={availableFields.length > 0 ? "Selecciona un campo" : "No hay campos disponibles"} />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.length > 0 ? (
                            availableFields.map((fieldName) => (
                              <SelectItem key={fieldName} value={fieldName}>
                                {fieldName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No hay campos disponibles</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="relative">
                        <Input
                          id="field"
                          disabled
                          placeholder="Primero selecciona un cliente"
                          className="h-11 pl-10 bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                        />
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    {errors.field && <p className="text-red-500 text-sm mt-1">{errors.field}</p>}
                    {formData.client_id > 0 && availableFields.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {availableFields.length} campo{availableFields.length !== 1 ? 's' : ''} disponible{availableFields.length !== 1 ? 's' : ''} para este cliente
                      </p>
                    )}
                  </div>

                  {/* Tipo de Tarea */}
                  <div className="space-y-2">
                    <Label htmlFor="taskType" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <span>Tipo de Tarea *</span>
                    </Label>
                    <Select
                      value={formData.taskType}
                      onValueChange={(value) => handleInputChange('taskType', value)}
                    >
                      <SelectTrigger className={`h-11 ${errors.taskType ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                        {formData.taskType ? (
                          <span className="text-gray-900">{formData.taskType}</span>
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
                    {errors.taskType && <p className="text-red-500 text-sm mt-1">{errors.taskType}</p>}
                  </div>

                  {/* Prioridad */}
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span>Prioridad *</span>
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

                  {/* Fecha de Inicio Planificada */}
                  <div className="space-y-2">
                    <Label htmlFor="plannedStartDate" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Fecha de Inicio Planificada *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="plannedStartDate"
                        type="date"
                        value={formData.plannedStartDate}
                        onChange={(e) => handleInputChange('plannedStartDate', e.target.value)}
                        className={`h-11 pl-10 ${errors.plannedStartDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.plannedStartDate && <p className="text-red-500 text-sm mt-1">{errors.plannedStartDate}</p>}
                  </div>

                  {/* Fecha de Fin Planificada */}
                  <div className="space-y-2">
                    <Label htmlFor="plannedEndDate" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Fecha de Fin Planificada *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="plannedEndDate"
                        type="date"
                        value={formData.plannedEndDate}
                        onChange={(e) => handleInputChange('plannedEndDate', e.target.value)}
                        className={`h-11 pl-10 ${errors.plannedEndDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.plannedEndDate && <p className="text-red-500 text-sm mt-1">{errors.plannedEndDate}</p>}
                  </div>

                  {/* Total de Hectáreas */}
                  <div className="space-y-2">
                    <Label htmlFor="targetHectares" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span>Total de Hectáreas</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="targetHectares"
                        type="number"
                        value={formData.targetHectares}
                        onChange={(e) => handleInputChange('targetHectares', parseFloat(e.target.value) || 0)}
                        placeholder="Ej: 45"
                        className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Descripción *</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe la tarea a realizar..."
                      className={`min-h-[120px] ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Maquinarias Asignadas */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Maquinarias Asignadas *</h2>
                  </div>
                  {formData.taskType && (
                    <Badge variant="info" className="text-xs">
                      {filteredMachinery.length} maquinarias disponibles para &quot;{formData.taskType}&quot;
                    </Badge>
                  )}
                </div>
                {formData.taskType ? (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Filtrado automático:</strong> Se muestran solo las maquinarias relevantes para el tipo de tarea seleccionado.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Tip:</strong> Selecciona un tipo de tarea para filtrar automáticamente las maquinarias relevantes.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMachinery.length > 0 ? (
                    filteredMachinery.map((mach) => (
                      <label
                        key={mach.id}
                        className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.assignedMachinery.includes(mach.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedMachinery.includes(mach.id)}
                          onChange={(e) => handleMachineryToggle(mach.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">{mach.brand} {mach.model}</span>
                          <p className="text-xs text-gray-500">{mach.patent}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="col-span-full p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                      <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No hay maquinarias disponibles para este tipo de tarea</p>
                    </div>
                  )}
                </div>
                {errors.assignedMachinery && <p className="text-red-500 text-sm mt-1">{errors.assignedMachinery}</p>}
              </div>

              {/* Tareas */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Tareas ({formData.tasks.length})</h2>
                  </div>
                </div>

                {/* Formulario para agregar tarea */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-blue-600" />
                    Agregar Nueva Tarea
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="taskName" className="text-gray-700 font-medium">Nombre de la Tarea *</Label>
                      <Input
                        id="taskName"
                        value={currentTask.name}
                        onChange={(e) => handleTaskInputChange('name', e.target.value)}
                        placeholder="Ej: Preparación del terreno, Siembra de semillas..."
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="taskDescription" className="text-gray-700 font-medium">Descripción *</Label>
                      <Textarea
                        id="taskDescription"
                        value={currentTask.description}
                        onChange={(e) => handleTaskInputChange('description', e.target.value)}
                        placeholder="Describe detalladamente qué se realizará en esta tarea..."
                        className="mt-1 min-h-[100px]"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="taskHours" className="text-gray-700 font-medium">Horas Estimadas *</Label>
                      <Input
                        id="taskHours"
                        type="number"
                        value={currentTask.estimatedHours}
                        onChange={(e) => handleTaskInputChange('estimatedHours', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-gray-700 font-medium mb-2 block">Maquinaria para esta Tarea</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {formData.assignedMachinery.length > 0 ? (
                          formData.assignedMachinery.map((machId) => {
                            const mach = machinery.find(m => m.id === machId)
                            if (!mach) return null
                            return (
                              <label
                                key={mach.id}
                                className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all ${currentTask.assignedMachinery.includes(mach.id)
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-300 hover:border-gray-400'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={currentTask.assignedMachinery.includes(mach.id)}
                                  onChange={(e) => handleTaskMachineryToggle(mach.id)}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-xs text-gray-700">{mach.brand} {mach.model}</span>
                              </label>
                            )
                          })
                        ) : (
                          <div className="col-span-full p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500">Primero selecciona maquinarias en la sección &quot;Maquinarias Asignadas&quot;</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addTask}
                    className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Tarea
                  </Button>
                </div>

                {/* Lista de tareas agregadas */}
                {formData.tasks.length > 0 && (
                  <div className="space-y-3">
                    {formData.tasks.map((task) => (
                      <div key={task.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{task.name}</h4>
                              <Badge variant="info" size="sm">{task.estimatedHours}h</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            {task.assignedMachinery.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.assignedMachinery.map((machId) => {
                                  const mach = machinery.find(m => m.id === machId)
                                  return mach ? (
                                    <Badge key={machId} variant="default" size="sm">
                                      {mach.brand} {mach.model}
                                    </Badge>
                                  ) : null
                                })}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(task.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
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
                  disabled={loading}
                  className="px-8 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creando...' : 'Crear Orden de Trabajo'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
