'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { WorkOrder, Machinery } from '@/contexts/AppContext'
import {
  X, ClipboardList, Calendar, MapPin, Building2, Wrench,
  AlertCircle, Truck, FileText, Target, Save, Activity
} from 'lucide-react'

// Función para determinar qué maquinarias son relevantes para un tipo de tarea
const getRelevantMachineryForTaskType = (taskType: string, machinery: Machinery[]): number[] => {
  if (!taskType) return machinery.map(m => m.id)

  const taskTypeLower = taskType.toLowerCase()
  const brand = (m: Machinery) => m.brand.toLowerCase()

  // Preparación del suelo
  if (taskTypeLower.includes('preparación') || taskTypeLower.includes('preparacion') ||
    taskTypeLower.includes('arado') || taskTypeLower.includes('rastraje') ||
    taskTypeLower.includes('subsolado') || taskTypeLower.includes('labranza')) {
    return machinery.filter(m => {
      const b = brand(m)
      return b.includes('tractor') || b.includes('arado') || b.includes('rastra') ||
        b.includes('subsolador') || b.includes('rodillo') || m.type === 'tractor'
    }).map(m => m.id)
  }

  // Siembra y plantación
  if (taskTypeLower.includes('siembra') || taskTypeLower.includes('cultivo') ||
    taskTypeLower.includes('fertilización') || taskTypeLower.includes('fertilizacion') ||
    taskTypeLower.includes('aplicación de fertilizante') || taskTypeLower.includes('aplicacion de fertilizante')) {
    return machinery.filter(m => {
      const b = brand(m)
      return m.type === 'tractor' ||
        b.includes('sembradora') || b.includes('plantadora') || b.includes('trasplantadora') ||
        b.includes('abonadora') || b.includes('fertilizadora') || b.includes('cisterna') ||
        m.type === 'sembradora'
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
      return m.type === 'tractor' ||
        b.includes('pulverizadora') || b.includes('fumigadora') || b.includes('cultivador') ||
        b.includes('desmalezadora') || b.includes('cortacésped') || b.includes('riego') ||
        m.type === 'pulverizador'
    }).map(m => m.id)
  }

  // Cosecha
  if (taskTypeLower.includes('cosecha')) {
    return machinery.filter(m => {
      const b = brand(m)
      return m.type === 'tractor' ||
        b.includes('cosechadora') || b.includes('cabezal') || b.includes('segadora') ||
        b.includes('acondicionadora') || b.includes('hileradora') || b.includes('embaladora') ||
        b.includes('empacadora') || m.type === 'cosechadora'
    }).map(m => m.id)
  }

  // Transporte
  if (taskTypeLower.includes('transporte')) {
    return machinery.filter(m => m.type === 'camion').map(m => m.id)
  }

  // Mantenimiento de campo - puede usar varias categorías
  if (taskTypeLower.includes('mantenimiento')) {
    return machinery.map(m => m.id)
  }

  // Por defecto, mostrar todas
  return machinery.map(m => m.id)
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

// Componente Modal de Nueva Orden
export function NewOrderModal({
  onClose,
  addWorkOrder,
  machinery,
}: {
  onClose: () => void
  addWorkOrder: (workOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => void
  machinery: Machinery[]
}) {
  const [formData, setFormData] = useState({
    client_id: 0,
    field: '',
    taskType: '',
    priority: 'media' as 'baja' | 'media' | 'alta' | 'critica',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetHectares: 0,
    assignedMachinery: [] as number[],
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableFields = formData.client_id > 0
    ? (clientsWithFields[formData.client_id] || [])
    : []

  const filteredMachinery = formData.taskType
    ? machinery.filter(m => getRelevantMachineryForTaskType(formData.taskType, machinery).includes(m.id))
    : machinery

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      if (field === 'taskType') {
        const relevantIds = getRelevantMachineryForTaskType(value, machinery)
        newData.assignedMachinery = prev.assignedMachinery.filter(id => relevantIds.includes(id))
      }

      if (field === 'client_id') {
        newData.field = ''
      }

      return newData
    })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleMachineryToggle = (machineryId: number) => {
    setFormData(prev => ({
      ...prev,
      assignedMachinery: prev.assignedMachinery.includes(machineryId)
        ? prev.assignedMachinery.filter(id => id !== machineryId)
        : [...prev.assignedMachinery, machineryId]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    const newWorkOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'> = {
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
      target_hours: 0,
      actual_hectares: 0,
      actual_hours: 0,
      progress_percentage: 0,
    }

    addWorkOrder(newWorkOrder)
    toast.success('Orden de trabajo creada exitosamente')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full mx-auto space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ClipboardList className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Nueva Orden de Trabajo</h1>
                <p className="text-blue-100 text-sm">Crea una nueva orden de trabajo</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Principal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="client_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Cliente *</span>
                  </Label>
                  <Select
                    value={formData.client_id.toString()}
                    onValueChange={(value) => handleInputChange('client_id', parseInt(value))}
                  >
                    <SelectTrigger className={`h-11 ${errors.client_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                      {formData.client_id > 0 ? (
                        <span className="text-gray-900 dark:text-white">{clients.find(c => c.id === formData.client_id)?.name}</span>
                      ) : (
                        <SelectValue placeholder="Selecciona un cliente" className="dark:text-gray-400" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>}
                </div>

                {/* Campo */}
                <div className="space-y-2">
                  <Label htmlFor="field" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Campo *</span>
                  </Label>
                  {formData.client_id > 0 ? (
                    <Select
                      value={formData.field}
                      onValueChange={(value) => handleInputChange('field', value)}
                      disabled={availableFields.length === 0}
                    >
                      <SelectTrigger className={`h-11 ${errors.field ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                        {formData.field ? (
                          <span className="text-gray-900 dark:text-white">{formData.field}</span>
                        ) : (
                          <SelectValue placeholder={availableFields.length > 0 ? "Selecciona un campo" : "No hay campos disponibles"} className="dark:text-gray-400" />
                        )}
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {availableFields.length > 0 ? (
                          availableFields.map((fieldName) => (
                            <SelectItem key={fieldName} value={fieldName} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                              {fieldName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled className="dark:text-gray-400">No hay campos disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Input
                        id="field"
                        disabled
                        placeholder="Primero selecciona un cliente"
                        className="h-11 pl-10 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  {errors.field && <p className="text-red-500 text-sm mt-1">{errors.field}</p>}
                </div>

                {/* Tipo de Tarea */}
                <div className="space-y-2">
                  <Label htmlFor="taskType" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Tipo de Tarea *</span>
                  </Label>
                  <Select
                    value={formData.taskType}
                    onValueChange={(value) => handleInputChange('taskType', value)}
                  >
                    <SelectTrigger className={`h-11 ${errors.taskType ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                      {formData.taskType ? (
                        <span className="text-gray-900 dark:text-white">{formData.taskType}</span>
                      ) : (
                        <SelectValue placeholder="Selecciona el tipo de tarea" className="dark:text-gray-400" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {taskTypes.map((taskType) => (
                        <SelectItem key={taskType} value={taskType} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                          {taskType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.taskType && <p className="text-red-500 text-sm mt-1">{errors.taskType}</p>}
                </div>

                {/* Prioridad */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Prioridad *</span>
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <SelectValue className="dark:text-gray-400" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="baja" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Baja</SelectItem>
                      <SelectItem value="media" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Media</SelectItem>
                      <SelectItem value="alta" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Alta</SelectItem>
                      <SelectItem value="critica" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha de Inicio Planificada */}
                <div className="space-y-2">
                  <Label htmlFor="plannedStartDate" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha de Inicio Planificada *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="plannedStartDate"
                      type="date"
                      value={formData.plannedStartDate}
                      onChange={(e) => handleInputChange('plannedStartDate', e.target.value)}
                      className={`h-11 pl-10 ${errors.plannedStartDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.plannedStartDate && <p className="text-red-500 text-sm mt-1">{errors.plannedStartDate}</p>}
                </div>

                {/* Fecha de Fin Planificada */}
                <div className="space-y-2">
                  <Label htmlFor="plannedEndDate" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha de Fin Planificada *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="plannedEndDate"
                      type="date"
                      value={formData.plannedEndDate}
                      onChange={(e) => handleInputChange('plannedEndDate', e.target.value)}
                      className={`h-11 pl-10 ${errors.plannedEndDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.plannedEndDate && <p className="text-red-500 text-sm mt-1">{errors.plannedEndDate}</p>}
                </div>

                {/* Total de Hectáreas */}
                <div className="space-y-2">
                  <Label htmlFor="targetHectares" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Total de Hectáreas</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="targetHectares"
                      type="number"
                      value={formData.targetHectares}
                      onChange={(e) => handleInputChange('targetHectares', parseFloat(e.target.value) || 0)}
                      placeholder="Ej: 45"
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Descripción *</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe la tarea a realizar..."
                    className={`min-h-[120px] ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    rows={4}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Maquinarias Asignadas */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Maquinarias Asignadas *</h2>
                </div>
                {formData.taskType && (
                  <Badge variant="info" className="text-xs dark:bg-blue-900/30 dark:text-blue-300">
                    {filteredMachinery.length} maquinarias disponibles para &quot;{formData.taskType}&quot;
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMachinery.length > 0 ? (
                  filteredMachinery.map((mach) => (
                    <label
                      key={mach.id}
                      className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.assignedMachinery.includes(mach.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedMachinery.includes(mach.id)}
                        onChange={() => handleMachineryToggle(mach.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{mach.brand} {mach.model}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{mach.patent}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="col-span-full p-6 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <Truck className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No hay maquinarias disponibles para este tipo de tarea</p>
                  </div>
                )}
              </div>
              {errors.assignedMachinery && <p className="text-red-500 text-sm mt-1">{errors.assignedMachinery}</p>}
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 h-11 text-sm font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Crear Orden de Trabajo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Componente Modal de Editar Orden
export function EditOrderModal({
  order,
  onClose,
  updateWorkOrder,
  machinery,
}: {
  order: WorkOrder
  onClose: () => void
  updateWorkOrder: (id: string, workOrder: Partial<WorkOrder>) => void
  machinery: Machinery[]
}) {
  const [formData, setFormData] = useState({
    client_id: order.client_id,
    field: order.field_name,
    taskType: order.task_type,
    priority: order.priority,
    plannedStartDate: order.planned_start_date,
    plannedEndDate: order.planned_end_date,
    actualStartDate: order.actual_start_date || '',
    actualEndDate: order.actual_end_date || '',
    targetHectares: order.target_hectares,
    actualHectares: order.actual_hectares,
    progress: order.progress_percentage,
    assignedMachinery: order.assigned_machinery,
    description: order.description,
    status: order.status,
    workerNotes: order.worker_notes || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableFields = formData.client_id > 0
    ? (clientsWithFields[formData.client_id] || [])
    : []

  // Filtrar maquinarias según el tipo de tarea, pero mostrar solo las ya seleccionadas si no hay tipo
  const filteredMachinery = formData.taskType
    ? machinery.filter(m => {
      const relevantIds = getRelevantMachineryForTaskType(formData.taskType, machinery)
      // Incluir maquinarias relevantes O las ya seleccionadas
      return relevantIds.includes(m.id) || formData.assignedMachinery.includes(m.id)
    })
    : formData.assignedMachinery.length > 0
      ? machinery.filter(m => formData.assignedMachinery.includes(m.id))
      : machinery

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      if (field === 'taskType') {
        const relevantIds = getRelevantMachineryForTaskType(value, machinery)
        // Mantener solo las maquinarias que son relevantes O las ya seleccionadas
        newData.assignedMachinery = prev.assignedMachinery.filter(id =>
          relevantIds.includes(id) || prev.assignedMachinery.includes(id)
        )
      }

      if (field === 'client_id') {
        newData.field = ''
      }

      return newData
    })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleMachineryToggle = (machineryId: number) => {
    setFormData(prev => ({
      ...prev,
      assignedMachinery: prev.assignedMachinery.includes(machineryId)
        ? prev.assignedMachinery.filter(id => id !== machineryId)
        : [...prev.assignedMachinery, machineryId]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    const updatedWorkOrder: Partial<WorkOrder> = {
      ...order,
      client_id: formData.client_id,
      field_name: formData.field,
      task_type: formData.taskType,
      description: formData.description,
      priority: formData.priority,
      planned_start_date: formData.plannedStartDate,
      planned_end_date: formData.plannedEndDate,
      actual_start_date: formData.actualStartDate || null,
      actual_end_date: formData.actualEndDate || null,
      status: formData.status,
      assigned_machinery: formData.assignedMachinery,
      target_hectares: formData.targetHectares,
      actual_hectares: formData.actualHectares,
      progress_percentage: formData.progress,
      worker_notes: formData.workerNotes,
    }

    updateWorkOrder(order.id, updatedWorkOrder)
    toast.success('Orden de trabajo actualizada exitosamente!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full mx-auto space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ClipboardList className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Editar Orden de Trabajo: {order.id}</h1>
                <p className="text-blue-100 text-sm">Actualiza la información de la orden de trabajo</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Principal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="edit_client_id" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Cliente *</span>
                  </Label>
                  <Select
                    value={formData.client_id.toString()}
                    onValueChange={(value) => handleInputChange('client_id', parseInt(value))}
                  >
                    <SelectTrigger className={`h-11 ${errors.client_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                      {formData.client_id > 0 ? (
                        <span className="text-gray-900 dark:text-white">{clients.find(c => c.id === formData.client_id)?.name}</span>
                      ) : (
                        <SelectValue placeholder="Selecciona un cliente" className="dark:text-gray-400" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>}
                </div>

                {/* Campo */}
                <div className="space-y-2">
                  <Label htmlFor="edit_field" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Campo *</span>
                  </Label>
                  {formData.client_id > 0 ? (
                    <Select
                      value={formData.field}
                      onValueChange={(value) => handleInputChange('field', value)}
                      disabled={availableFields.length === 0}
                    >
                      <SelectTrigger className={`h-11 ${errors.field ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                        {formData.field ? (
                          <span className="text-gray-900 dark:text-white">{formData.field}</span>
                        ) : (
                          <SelectValue placeholder={availableFields.length > 0 ? "Selecciona un campo" : "No hay campos disponibles"} className="dark:text-gray-400" />
                        )}
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {availableFields.length > 0 ? (
                          availableFields.map((fieldName) => (
                            <SelectItem key={fieldName} value={fieldName} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                              {fieldName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled className="dark:text-gray-400">No hay campos disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Input
                        id="edit_field"
                        disabled
                        placeholder="Primero selecciona un cliente"
                        className="h-11 pl-10 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  {errors.field && <p className="text-red-500 text-sm mt-1">{errors.field}</p>}
                </div>

                {/* Tipo de Tarea */}
                <div className="space-y-2">
                  <Label htmlFor="edit_taskType" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Tipo de Tarea *</span>
                  </Label>
                  <Select
                    value={formData.taskType}
                    onValueChange={(value) => handleInputChange('taskType', value)}
                  >
                    <SelectTrigger className={`h-11 ${errors.taskType ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}>
                      {formData.taskType ? (
                        <span className="text-gray-900 dark:text-white">{formData.taskType}</span>
                      ) : (
                        <SelectValue placeholder="Selecciona el tipo de tarea" className="dark:text-gray-400" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {taskTypes.map((taskType) => (
                        <SelectItem key={taskType} value={taskType} className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                          {taskType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.taskType && <p className="text-red-500 text-sm mt-1">{errors.taskType}</p>}
                </div>

                {/* Prioridad */}
                <div className="space-y-2">
                  <Label htmlFor="edit_priority" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Prioridad *</span>
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <SelectValue className="dark:text-gray-400" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="baja" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Baja</SelectItem>
                      <SelectItem value="media" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Media</SelectItem>
                      <SelectItem value="alta" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Alta</SelectItem>
                      <SelectItem value="critica" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="edit_status" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Estado *</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <SelectValue className="dark:text-gray-400" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="planificada" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Planificada</SelectItem>
                      <SelectItem value="en_ejecucion" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">En Ejecución</SelectItem>
                      <SelectItem value="completada" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Completada</SelectItem>
                      <SelectItem value="retrasada" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Retrasada</SelectItem>
                      <SelectItem value="detenida" className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Detenida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha de Inicio Planificada */}
                <div className="space-y-2">
                  <Label htmlFor="edit_plannedStartDate" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha de Inicio Planificada *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_plannedStartDate"
                      type="date"
                      value={formData.plannedStartDate}
                      onChange={(e) => handleInputChange('plannedStartDate', e.target.value)}
                      className={`h-11 pl-10 ${errors.plannedStartDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.plannedStartDate && <p className="text-red-500 text-sm mt-1">{errors.plannedStartDate}</p>}
                </div>

                {/* Fecha de Fin Planificada */}
                <div className="space-y-2">
                  <Label htmlFor="edit_plannedEndDate" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha de Fin Planificada *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_plannedEndDate"
                      type="date"
                      value={formData.plannedEndDate}
                      onChange={(e) => handleInputChange('plannedEndDate', e.target.value)}
                      className={`h-11 pl-10 ${errors.plannedEndDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.plannedEndDate && <p className="text-red-500 text-sm mt-1">{errors.plannedEndDate}</p>}
                </div>

                {/* Fecha de Inicio Real */}
                <div className="space-y-2">
                  <Label htmlFor="edit_actualStartDate" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha de Inicio Real (Opcional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_actualStartDate"
                      type="date"
                      value={formData.actualStartDate}
                      onChange={(e) => handleInputChange('actualStartDate', e.target.value)}
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Fecha de Fin Real */}
                <div className="space-y-2">
                  <Label htmlFor="edit_actualEndDate" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Fecha de Fin Real (Opcional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_actualEndDate"
                      type="date"
                      value={formData.actualEndDate}
                      onChange={(e) => handleInputChange('actualEndDate', e.target.value)}
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Total de Hectáreas */}
                <div className="space-y-2">
                  <Label htmlFor="edit_targetHectares" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Total de Hectáreas</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_targetHectares"
                      type="number"
                      value={formData.targetHectares}
                      onChange={(e) => handleInputChange('targetHectares', parseFloat(e.target.value) || 0)}
                      placeholder="Ej: 45"
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Hectáreas Reales */}
                <div className="space-y-2">
                  <Label htmlFor="edit_actualHectares" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Hectáreas Reales</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_actualHectares"
                      type="number"
                      value={formData.actualHectares}
                      onChange={(e) => handleInputChange('actualHectares', parseFloat(e.target.value) || 0)}
                      placeholder="Ej: 28"
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Progreso */}
                <div className="space-y-2">
                  <Label htmlFor="edit_progress" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Progreso (%)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_progress"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => handleInputChange('progress', parseFloat(e.target.value) || 0)}
                      placeholder="Ej: 62"
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit_description" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Descripción *</span>
                  </Label>
                  <Textarea
                    id="edit_description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe la tarea a realizar..."
                    className={`min-h-[120px] ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    rows={4}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Maquinarias Asignadas */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Maquinarias Asignadas *</h2>
                </div>
                {formData.taskType && (
                  <Badge variant="info" className="text-xs dark:bg-blue-900/30 dark:text-blue-300">
                    {filteredMachinery.length} maquinarias disponibles para &quot;{formData.taskType}&quot;
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMachinery.length > 0 ? (
                  filteredMachinery.map((mach) => (
                    <label
                      key={mach.id}
                      className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.assignedMachinery.includes(mach.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedMachinery.includes(mach.id)}
                        onChange={() => handleMachineryToggle(mach.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{mach.brand} {mach.model}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{mach.patent}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="col-span-full p-6 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <Truck className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No hay maquinarias disponibles</p>
                  </div>
                )}
              </div>
              {errors.assignedMachinery && <p className="text-red-500 text-sm mt-1">{errors.assignedMachinery}</p>}
            </div>

            {/* REPORTE DEL OPERADOR (Nuevo) */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 pb-4">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reporte de Avance</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Notas del Operador</Label>
                  <Textarea
                    value={formData.workerNotes}
                    onChange={(e) => handleInputChange('workerNotes', e.target.value)}
                    className="min-h-[80px] bg-gray-50 dark:bg-gray-700/50"
                    placeholder="Sin notas del operador..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Hectáreas Realizadas</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={formData.actualHectares}
                      onChange={(e) => handleInputChange('actualHectares', parseFloat(e.target.value) || 0)}
                      className="h-11 dark:bg-gray-700"
                    />
                    <span className="text-gray-500">de {formData.targetHectares} ha</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Progreso (%)</Label>
                  <div className="relative pt-2">
                    <div className="overflow-hidden h-4 text-xs flex rounded bg-blue-200 dark:bg-blue-900/30">
                      <div style={{ width: `${formData.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                    <p className="text-right text-sm text-gray-500 mt-1">{formData.progress}% Completado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 h-11 text-sm font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

