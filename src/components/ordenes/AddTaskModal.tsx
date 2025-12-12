'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  X, Save, Plus, Clock, User, Truck, FileText, 
  AlertTriangle, CheckCircle, Zap
} from 'lucide-react'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: any) => void
  assignedOperators: string[]
  assignedMachinery: number[]
}

export function AddTaskModal({ isOpen, onClose, onSave, assignedOperators, assignedMachinery }: AddTaskModalProps) {
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    estimatedHours: 0,
    assignedOperator: '',
    assignedMachinery: [] as number[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock data
  const machinery = [
    { id: 1, code: 'T001', name: 'John Deere 6120M', type: 'Tractor' },
    { id: 2, code: 'T002', name: 'New Holland T6080', type: 'Tractor' },
    { id: 3, code: 'I001', name: 'Amazone Catros 6001-2', type: 'Implemento' },
    { id: 4, code: 'C001', name: 'Mercedes-Benz Atego 1015', type: 'Camión' },
    { id: 5, code: 'COS001', name: 'Claas Lexion 760', type: 'Cosechadora' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setTaskData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleMachineryToggle = (machineryId: number) => {
    setTaskData(prev => ({
      ...prev,
      assignedMachinery: prev.assignedMachinery.includes(machineryId)
        ? prev.assignedMachinery.filter(id => id !== machineryId)
        : [...prev.assignedMachinery, machineryId]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!taskData.name.trim()) newErrors.name = 'Nombre de la tarea es requerido'
    if (!taskData.description.trim()) newErrors.description = 'Descripción es requerida'
    if (taskData.estimatedHours <= 0) newErrors.estimatedHours = 'Horas estimadas deben ser mayor a 0'
    if (!taskData.assignedOperator) newErrors.assignedOperator = 'Operador es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(taskData)
      setTaskData({
        name: '',
        description: '',
        estimatedHours: 0,
        assignedOperator: '',
        assignedMachinery: []
      })
      setErrors({})
    }
  }

  const handleClose = () => {
    setTaskData({
      name: '',
      description: '',
      estimatedHours: 0,
      assignedOperator: '',
      assignedMachinery: []
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Agregar Nueva Tarea
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nombre de la Tarea *"
                  value={taskData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Preparación del terreno, Siembra de semillas..."
                  error={errors.name}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe detalladamente qué se realizará en esta tarea..."
                  className="input-modern w-full min-h-[100px] resize-none"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <Input
                  label="Horas Estimadas *"
                  type="number"
                  value={taskData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  error={errors.estimatedHours}
                />
              </div>
            </div>
          </div>

          {/* Operator Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Asignación de Operador
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Operador Responsable *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignedOperators.map(operator => (
                  <div
                    key={operator}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      taskData.assignedOperator === operator
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('assignedOperator', operator)}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{operator}</span>
                    </div>
                  </div>
                ))}
              </div>
              {errors.assignedOperator && (
                <p className="text-sm text-red-600 mt-1">{errors.assignedOperator}</p>
              )}
            </div>
          </div>

          {/* Machinery Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Maquinaria Requerida
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecciona las maquinarias necesarias para esta tarea
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {machinery.filter(m => assignedMachinery.includes(m.id)).map(machine => (
                  <div
                    key={machine.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      taskData.assignedMachinery.includes(machine.id)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handleMachineryToggle(machine.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Truck className="h-4 w-4" />
                          <p className="text-sm font-medium">{machine.name}</p>
                        </div>
                        <p className="text-xs text-gray-500">{machine.type}</p>
                      </div>
                      {taskData.assignedMachinery.includes(machine.id) && (
                        <CheckCircle className="h-4 w-4 text-primary-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {taskData.assignedMachinery.length === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-700">
                      No hay maquinarias asignadas a esta tarea
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {taskData.name && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Resumen de la Tarea
              </h3>
              
              <Card variant="modern" className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tarea:</span>
                      <span className="font-medium">{taskData.name}</span>
                    </div>
                    {taskData.estimatedHours > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Horas estimadas:</span>
                        <Badge variant="info">{taskData.estimatedHours}h</Badge>
                      </div>
                    )}
                    {taskData.assignedOperator && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Operador:</span>
                        <Badge variant="success">{taskData.assignedOperator}</Badge>
                      </div>
                    )}
                    {taskData.assignedMachinery.length > 0 && (
                      <div>
                        <span className="text-gray-600">Maquinarias:</span>
                        <div className="mt-1 space-y-1">
                          {taskData.assignedMachinery.map(id => {
                            const machine = machinery.find(m => m.id === id)
                            return machine ? (
                              <Badge key={id} variant="default" size="sm" className="mr-1">
                                {machine.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Save className="h-4 w-4" />
            <span>Agregar Tarea</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
























