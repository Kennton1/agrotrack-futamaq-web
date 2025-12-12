'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  Fuel, AlertTriangle, CheckCircle, Clock, MapPin, 
  Truck, User, Calendar, DollarSign, Gauge, Save
} from 'lucide-react'
import { ACTIVE_WORK_ORDERS, validateFuelQuantity, calculateFuelEfficiency } from '@/data/fuelData'

interface FuelLoadFormProps {
  onSave: (fuelLoad: any) => void
  onCancel: () => void
  initialData?: any
}

export function FuelLoadForm({ onSave, onCancel, initialData }: FuelLoadFormProps) {
  const [formData, setFormData] = useState({
    order_id: initialData?.order_id || '',
    machinery_id: initialData?.machinery_id || '',
    fuel_type: initialData?.fuel_type || 'diesel',
    quantity_liters: initialData?.quantity_liters || '',
    unit_price: initialData?.unit_price || '',
    loading_date: initialData?.loading_date || new Date().toISOString().split('T')[0],
    loading_time: initialData?.loading_time || new Date().toTimeString().slice(0, 5),
    operator: initialData?.operator || '',
    odometer_hours: initialData?.odometer_hours || '',
    previous_odometer: initialData?.previous_odometer || '',
    estimated_consumption: initialData?.estimated_consumption || '',
    location_address: initialData?.location?.address || ''
  })

  const [validation, setValidation] = useState({
    isValid: true,
    discrepancy: 0,
    discrepancyPercentage: 0,
    validationStatus: 'valid' as 'valid' | 'warning' | 'error',
    message: ''
  })

  const [efficiency, setEfficiency] = useState({
    efficiencyRating: 'buena' as 'excelente' | 'buena' | 'regular' | 'mala',
    efficiencyPercentage: 0,
    litersPerHour: 0,
    litersPerHectare: 0
  })

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedMachinery, setSelectedMachinery] = useState<any>(null)
  const [systemQuantity, setSystemQuantity] = useState<number | null>(null)

  // Obtener orden seleccionada
  useEffect(() => {
    if (formData.order_id) {
      const order = ACTIVE_WORK_ORDERS.find(o => o.id === formData.order_id)
      setSelectedOrder(order)
    }
  }, [formData.order_id])

  // Obtener maquinaria seleccionada
  useEffect(() => {
    if (formData.machinery_id && selectedOrder) {
      // Simular obtención de datos de maquinaria
      const machinery = {
        id: parseInt(formData.machinery_id),
        code: `T${formData.machinery_id.padStart(3, '0')}`,
        name: `Maquinaria ${formData.machinery_id}`,
        fuel_capacity: 120
      }
      setSelectedMachinery(machinery)
    }
  }, [formData.machinery_id, selectedOrder])

  // Validar cantidad de combustible cuando cambie
  useEffect(() => {
    if (formData.quantity_liters && systemQuantity) {
      const validationResult = validateFuelQuantity(
        parseFloat(formData.quantity_liters),
        systemQuantity
      )
      setValidation(validationResult)
    }
  }, [formData.quantity_liters, systemQuantity])

  // Calcular eficiencia cuando cambien los datos
  useEffect(() => {
    if (formData.quantity_liters && formData.estimated_consumption && formData.previous_odometer && formData.odometer_hours) {
      const actualConsumption = parseFloat(formData.quantity_liters)
      const estimatedConsumption = parseFloat(formData.estimated_consumption)
      const hoursWorked = parseFloat(formData.odometer_hours) - parseFloat(formData.previous_odometer)
      const hectaresWorked = 25 // Valor simulado

      const efficiencyResult = calculateFuelEfficiency(
        actualConsumption,
        estimatedConsumption,
        hoursWorked,
        hectaresWorked
      )
      setEfficiency(efficiencyResult)
    }
  }, [formData.quantity_liters, formData.estimated_consumption, formData.previous_odometer, formData.odometer_hours])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    const totalCost = parseFloat(formData.quantity_liters) * parseFloat(formData.unit_price)
    
    const fuelLoad = {
      ...formData,
      quantity_liters: parseFloat(formData.quantity_liters),
      unit_price: parseFloat(formData.unit_price),
      total_cost: totalCost,
      odometer_hours: parseFloat(formData.odometer_hours),
      previous_odometer: parseFloat(formData.previous_odometer),
      estimated_consumption: parseFloat(formData.estimated_consumption),
      validated: validation.isValid,
      validation_method: 'manual',
      validation_notes: validation.message,
      efficiency_rating: efficiency.efficiencyRating,
      actual_consumption: parseFloat(formData.quantity_liters),
      location: {
        lat: -33.4489,
        lng: -70.6693,
        address: formData.location_address
      }
    }

    onSave(fuelLoad)
  }

  const getValidationIcon = () => {
    switch (validation.validationStatus) {
      case 'valid': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
  }

  const getValidationBadgeVariant = () => {
    switch (validation.validationStatus) {
      case 'valid': return 'success' as const
      case 'warning': return 'warning' as const
      case 'error': return 'danger' as const
    }
  }

  const getEfficiencyBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'excelente': return 'success' as const
      case 'buena': return 'info' as const
      case 'regular': return 'warning' as const
      case 'mala': return 'danger' as const
      default: return 'default' as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Información de la orden seleccionada */}
      {selectedOrder && (
        <Card variant="modern" className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Orden de Trabajo Seleccionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID Orden</p>
                <p className="font-semibold">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-semibold">{selectedOrder.client}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="font-semibold">{selectedOrder.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario principal */}
      <Card variant="modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Fuel className="h-5 w-5 mr-2" />
            Datos de Carga de Combustible
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de orden y maquinaria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden de Trabajo Activa *
              </label>
              <select
                value={formData.order_id}
                onChange={(e) => handleInputChange('order_id', e.target.value)}
                className="input-modern w-full"
                required
              >
                <option value="">Seleccionar orden...</option>
                {ACTIVE_WORK_ORDERS.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.id} - {order.client} ({order.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maquinaria *
              </label>
              <select
                value={formData.machinery_id}
                onChange={(e) => handleInputChange('machinery_id', e.target.value)}
                className="input-modern w-full"
                required
                disabled={!formData.order_id}
              >
                <option value="">Seleccionar maquinaria...</option>
                {selectedOrder?.machinery_assigned.map((machineryId: number) => (
                  <option key={machineryId} value={machineryId}>
                    {`T${machineryId.toString().padStart(3, '0')}`} - Maquinaria {machineryId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos de combustible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Input
                label="Cantidad (Litros) *"
                type="number"
                value={formData.quantity_liters}
                onChange={(e) => handleInputChange('quantity_liters', e.target.value)}
                placeholder="0"
                required
              />
              {systemQuantity && (
                <p className="text-xs text-gray-500 mt-1">
                  Sistema registra: {systemQuantity}L
                </p>
              )}
            </div>

            <div>
              <Input
                label="Precio por Litro *"
                type="number"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Combustible *
              </label>
              <select
                value={formData.fuel_type}
                onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                className="input-modern w-full"
                required
              >
                <option value="diesel">Diesel</option>
                <option value="gasolina">Gasolina</option>
                <option value="aceite">Aceite</option>
              </select>
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Fecha de Carga *"
                type="date"
                value={formData.loading_date}
                onChange={(e) => handleInputChange('loading_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Hora de Carga *"
                type="time"
                value={formData.loading_time}
                onChange={(e) => handleInputChange('loading_time', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Operador y ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Operador *"
                value={formData.operator}
                onChange={(e) => handleInputChange('operator', e.target.value)}
                placeholder="Nombre del operador"
                required
              />
            </div>

            <div>
              <Input
                label="Ubicación de Carga *"
                value={formData.location_address}
                onChange={(e) => handleInputChange('location_address', e.target.value)}
                placeholder="Estación de combustible, dirección"
                required
              />
            </div>
          </div>

          {/* Datos del odómetro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Horas Odómetro Actual *"
                type="number"
                value={formData.odometer_hours}
                onChange={(e) => handleInputChange('odometer_hours', e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div>
              <Input
                label="Horas Odómetro Anterior"
                type="number"
                value={formData.previous_odometer}
                onChange={(e) => handleInputChange('previous_odometer', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Consumo estimado */}
          <div>
            <Input
              label="Consumo Estimado (Litros)"
              type="number"
              value={formData.estimated_consumption}
              onChange={(e) => handleInputChange('estimated_consumption', e.target.value)}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validación de cantidad */}
      {formData.quantity_liters && systemQuantity && (
        <Card variant="modern" className={`border-l-4 ${
          validation.validationStatus === 'valid' ? 'border-green-500' :
          validation.validationStatus === 'warning' ? 'border-yellow-500' :
          'border-red-500'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getValidationIcon()}
              <span className="ml-2">Validación de Cantidad</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{validation.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Diferencia: {validation.discrepancy.toFixed(1)}L ({validation.discrepancyPercentage.toFixed(1)}%)
                </p>
              </div>
              <Badge variant={getValidationBadgeVariant()}>
                {validation.validationStatus.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eficiencia de combustible */}
      {formData.quantity_liters && formData.estimated_consumption && (
        <Card variant="modern">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="h-5 w-5 mr-2" />
              Eficiencia de Combustible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Calificación</p>
                <Badge variant={getEfficiencyBadgeVariant(efficiency.efficiencyRating)} size="lg">
                  {efficiency.efficiencyRating.toUpperCase()}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Eficiencia</p>
                <p className="text-2xl font-bold text-blue-600">{efficiency.efficiencyPercentage.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">L/Hora</p>
                <p className="text-2xl font-bold text-green-600">{efficiency.litersPerHour.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">L/Hectárea</p>
                <p className="text-2xl font-bold text-orange-600">{efficiency.litersPerHectare.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de costos */}
      {formData.quantity_liters && formData.unit_price && (
        <Card variant="modern" className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Resumen de Costos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Cantidad</p>
                <p className="text-2xl font-bold text-gray-900">{formData.quantity_liters}L</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Precio Unitario</p>
                <p className="text-2xl font-bold text-blue-600">${parseFloat(formData.unit_price).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(parseFloat(formData.quantity_liters) * parseFloat(formData.unit_price)).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!formData.order_id || !formData.machinery_id || !formData.quantity_liters || !formData.unit_price}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Guardar Carga</span>
        </Button>
      </div>
    </div>
  )
}








































