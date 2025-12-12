'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Plus, Fuel, X, MapPin, DollarSign, Calendar, Truck, User, Package, FileText, Camera } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { useApp } from '@/contexts/AppContext'
import { FuelImageUpload } from '@/components/combustible/FuelImageUpload'
import { formatCLP } from '@/lib/utils'

const fuelLoadSchema = z.object({
  machinery_id: z.number().min(1, 'La maquinaria es requerida'),
  operator_id: z.string().min(1, 'El operador es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  liters: z.number().min(0.1, 'Los litros deben ser mayores a 0'),
  cost_per_liter: z.number().min(0, 'El costo por litro no puede ser negativo'),
  work_order_id: z.string().optional(),
  source: z.enum(['bodega', 'estacion'], {
    message: 'La fuente es requerida',
  }),
  location: z.string().min(1, 'La ubicación es requerida'),
})

type FuelLoadFormData = z.infer<typeof fuelLoadSchema>

export default function NuevaCargaCombustiblePage() {
  const router = useRouter()
  const { machinery, workOrders, addFuelLoad } = useApp()
  const [fuelLoadImage, setFuelLoadImage] = useState<string | undefined>()
  const [receiptImage, setReceiptImage] = useState<string | undefined>()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FuelLoadFormData>({
    resolver: zodResolver(fuelLoadSchema),
    defaultValues: {
      machinery_id: 0,
      operator_id: '',
      date: new Date().toISOString().split('T')[0],
      liters: 0,
      cost_per_liter: 0,
      work_order_id: '',
      source: 'bodega',
      location: '',
    },
  })

  const liters = watch('liters')
  const costPerLiter = watch('cost_per_liter')
  const totalCost = liters * costPerLiter

  const onSubmit = async (data: FuelLoadFormData) => {
    const selectedMachinery = machinery.find(m => m.id === data.machinery_id)
    if (!selectedMachinery) {
      toast.error('Maquinaria seleccionada no encontrada')
      return
    }

    const newFuelLoad = {
      machinery_id: data.machinery_id,
      machinery_code: `${selectedMachinery.brand} ${selectedMachinery.model}`,
      operator_id: data.operator_id,
      operator: data.operator_id, // En una app real, esto vendría de una tabla de usuarios
      date: data.date,
      liters: data.liters,
      total_cost: totalCost,
      cost_per_liter: data.cost_per_liter,
      work_order_id: data.work_order_id || null,
      source: data.source,
      location: data.location,
      fuel_load_image: fuelLoadImage,
      receipt_image: receiptImage,
    }

    await addFuelLoad(newFuelLoad)
    router.push('/combustible')
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
                <Fuel className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Nueva Carga de Combustible</h1>
                <p className="text-blue-100">Registra una nueva carga de combustible para tu maquinaria</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/combustible')}
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
                  <Truck className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Información Principal</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Maquinaria */}
                  <div className="space-y-2">
                    <Label htmlFor="machinery_id" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Maquinaria</span>
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
                    {errors.machinery_id && <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">{errors.machinery_id.message}</p>}
                  </div>

                  {/* Operador */}
                  <div className="space-y-2">
                    <Label htmlFor="operator_id" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Operador</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="operator_id"
                        {...register('operator_id')}
                        placeholder="Ej: Carlos Muñoz"
                        className={`h-11 pl-10 ${errors.operator_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.operator_id && <p className="text-red-500 text-sm mt-1">{errors.operator_id.message}</p>}
                  </div>

                  {/* Fecha */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Fecha</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        {...register('date')}
                        className={`h-11 pl-10 ${errors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                  </div>

                  {/* Fuente */}
                  <div className="space-y-2">
                    <Label htmlFor="source" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span>Fuente</span>
                    </Label>
                    <Controller
                      name="source"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-11 ${errors.source ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                            <SelectValue placeholder="Selecciona una fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bodega">Bodega</SelectItem>
                            <SelectItem value="estacion">Estación de Servicio</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.source && <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>}
                  </div>

                  {/* Litros */}
                  <div className="space-y-2">
                    <Label htmlFor="liters" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Fuel className="h-4 w-4 text-blue-600" />
                      <span>Litros</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="liters"
                        type="number"
                        step="0.1"
                        {...register('liters', { valueAsNumber: true })}
                        placeholder="Ej: 150.5"
                        className={`h-11 pl-10 ${errors.liters ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.liters && <p className="text-red-500 text-sm mt-1">{errors.liters.message}</p>}
                  </div>

                  {/* Costo por Litro */}
                  <div className="space-y-2">
                    <Label htmlFor="cost_per_liter" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span>Costo por Litro ($)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="cost_per_liter"
                        type="number"
                        {...register('cost_per_liter', { valueAsNumber: true })}
                        placeholder="Ej: 1300"
                        className={`h-11 pl-10 ${errors.cost_per_liter ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.cost_per_liter && <p className="text-red-500 text-sm mt-1">{errors.cost_per_liter.message}</p>}
                  </div>

                  {/* Orden de Trabajo (Opcional) */}
                  <div className="space-y-2">
                    <Label htmlFor="work_order_id" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Orden de Trabajo (Opcional)</span>
                    </Label>
                    <Controller
                      name="work_order_id"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecciona una orden de trabajo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sin orden de trabajo</SelectItem>
                            {workOrders.map((wo) => (
                              <SelectItem key={wo.id} value={wo.id}>
                                {wo.id} - {wo.field_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Ubicación */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Ubicación</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="location"
                        {...register('location')}
                        placeholder="Ej: Base FUTAMAQ, Valdivia"
                        className={`h-11 pl-10 ${errors.location ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                  </div>
                </div>
              </div>

              {/* Resumen de Costo Mejorado */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full -ml-12 -mb-12"></div>
                <div className="relative p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Resumen de Costo</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
                      <p className="text-sm text-gray-600 mb-1">Litros</p>
                      <p className="text-2xl font-bold text-blue-700">{liters || 0} L</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
                      <p className="text-sm text-gray-600 mb-1">Costo por Litro</p>
                      <p className="text-2xl font-bold text-indigo-700">${costPerLiter || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
                      <p className="text-sm text-blue-100 mb-1">Total</p>
                      <p className="text-2xl font-bold">{formatCLP(totalCost)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Imágenes Mejorada */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 pb-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Registro Fotográfico</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Foto de la Carga de Combustible */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <FuelImageUpload
                      label="Foto de la Carga de Combustible"
                      imageUrl={fuelLoadImage}
                      onChange={setFuelLoadImage}
                      type="fuel_load"
                    />
                    <p className="text-xs text-gray-600 mt-3 flex items-start space-x-1">
                      <span className="text-blue-600">💡</span>
                      <span>Toma una foto del medidor o indicador para verificar la cantidad de combustible cargado</span>
                    </p>
                  </div>

                  {/* Foto/Archivo de la Boleta */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <FuelImageUpload
                      label="Foto o Archivo PDF de la Boleta (Opcional)"
                      imageUrl={receiptImage}
                      onChange={setReceiptImage}
                      type="receipt"
                    />
                    <p className="text-xs text-gray-600 mt-3 flex items-start space-x-1">
                      <span className="text-green-600">💡</span>
                      <span>Sube una foto o archivo PDF de la boleta o comprobante de pago del combustible</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de Acción Mejorados */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/combustible')}
                  className="px-6 h-11 border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="px-8 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Carga
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}







































