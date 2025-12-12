'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Save, Package, X, DollarSign, Truck, AlertTriangle, Info, Warehouse, Settings, Tag, Building2, Box, CheckCircle } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { useApp } from '@/contexts/AppContext'
import { formatCLP } from '@/lib/utils'

const sparePartSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  current_stock: z.number().min(0, 'El stock actual no puede ser negativo'),
  minimum_stock: z.number().min(0, 'El stock mínimo no puede ser negativo'),
  unit_cost: z.number().min(0, 'El costo unitario no puede ser negativo'),
  supplier: z.string().min(1, 'El proveedor es requerido'),
  machinery_id: z.number().nullable().optional(),
})

type SparePartFormData = z.infer<typeof sparePartSchema>

export default function EditarRepuestoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { spareParts, updateSparePart, machinery } = useApp()
  const sparePartId = parseInt(params.id)
  const currentSparePart = spareParts.find(s => s.id === sparePartId)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SparePartFormData>({
    resolver: zodResolver(sparePartSchema),
    defaultValues: {
      description: '',
      category: '',
      current_stock: 0,
      minimum_stock: 0,
      unit_cost: 0,
      supplier: '',
      machinery_id: null,
    },
  })

  const currentStock = watch('current_stock')
  const minimumStock = watch('minimum_stock')
  const unitCost = watch('unit_cost')
  const isLowStock = currentStock <= minimumStock
  const totalValue = (currentStock || 0) * (unitCost || 0)

  useEffect(() => {
    if (currentSparePart) {
      reset({
        description: currentSparePart.description,
        category: currentSparePart.category,
        current_stock: currentSparePart.current_stock,
        minimum_stock: currentSparePart.minimum_stock,
        unit_cost: currentSparePart.unit_cost,
        supplier: currentSparePart.supplier,
        machinery_id: currentSparePart.machinery_id || null,
      })
    } else {
      toast.error('Repuesto no encontrado.')
      router.push('/repuestos')
    }
  }, [currentSparePart, reset, router])

  const onSubmit = (data: SparePartFormData) => {
    if (!currentSparePart) return

    const selectedMachinery = data.machinery_id ? machinery.find(m => m.id === data.machinery_id) : null
    const updatedSparePart = {
      ...currentSparePart,
      ...data,
      machinery_id: data.machinery_id || null,
      machinery_brand: selectedMachinery?.brand || null,
      machinery_model: selectedMachinery?.model || null,
    }

    updateSparePart(sparePartId, updatedSparePart)
    toast.success('Repuesto actualizado exitosamente!')
    router.push('/repuestos')
  }

  if (!currentSparePart) {
    return (
      <div className="p-6 text-center text-gray-600">Cargando o repuesto no encontrado...</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header mejorado con banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Editar Repuesto</h1>
                <p className="text-blue-100">{currentSparePart.description}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/repuestos')}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                  {/* Sección 1: Información Básica */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                      <Info className="h-5 w-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
                    </div>
                    <div className="space-y-4">
                      {/* Categoría */}
                      <div className="space-y-2">
                        <Label htmlFor="category" className="flex items-center space-x-2 text-gray-700 font-medium">
                          <Tag className="h-4 w-4 text-blue-600" />
                          <span>Categoría *</span>
                        </Label>
                        <Controller
                          name="category"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={`h-11 ${errors.category ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}>
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Filtros">Filtros</SelectItem>
                                <SelectItem value="Lubricantes">Lubricantes</SelectItem>
                                <SelectItem value="Encendido">Encendido</SelectItem>
                                <SelectItem value="Transmisión">Transmisión</SelectItem>
                                <SelectItem value="Frenos">Frenos</SelectItem>
                                <SelectItem value="Repuestos Motor">Repuestos Motor</SelectItem>
                                <SelectItem value="Repuestos Hidráulicos">Repuestos Hidráulicos</SelectItem>
                                <SelectItem value="Herramientas">Herramientas</SelectItem>
                                <SelectItem value="Otros">Otros</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.category && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{errors.category.message}</span>
                          </p>
                        )}
                      </div>

                      {/* Descripción */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center space-x-2 text-gray-700 font-medium">
                          <Box className="h-4 w-4 text-blue-600" />
                          <span>Descripción del Repuesto *</span>
                        </Label>
                        <Input
                          id="description"
                          {...register('description')}
                          placeholder="Ej: Filtro de aceite para motor John Deere 6120M"
                          className={`h-11 ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{errors.description.message}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <Info className="h-3 w-3" />
                          <span>Nombre completo y descriptivo</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sección 2: Stock e Inventario */}
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                      <Warehouse className="h-5 w-5 text-green-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Stock e Inventario</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Stock Actual */}
                      <div className="space-y-2">
                        <Label htmlFor="current_stock" className="flex items-center space-x-2 text-gray-700 font-medium">
                          <Box className="h-4 w-4 text-green-600" />
                          <span>Stock Actual *</span>
                        </Label>
                        <Input
                          id="current_stock"
                          type="number"
                          min="0"
                          {...register('current_stock', { valueAsNumber: true })}
                          placeholder="0"
                          className={`h-11 ${errors.current_stock ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                        />
                        {errors.current_stock && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{errors.current_stock.message}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">Cantidad disponible</p>
                      </div>

                      {/* Stock Mínimo */}
                      <div className="space-y-2">
                        <Label htmlFor="minimum_stock" className="flex items-center space-x-2 text-gray-700 font-medium">
                          <AlertTriangle className="h-4 w-4 text-green-600" />
                          <span>Stock Mínimo *</span>
                        </Label>
                        <Input
                          id="minimum_stock"
                          type="number"
                          min="0"
                          {...register('minimum_stock', { valueAsNumber: true })}
                          placeholder="0"
                          className={`h-11 ${errors.minimum_stock ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                        />
                        {errors.minimum_stock && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{errors.minimum_stock.message}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">Nivel mínimo</p>
                      </div>
                    </div>

                    {/* Resumen de valor */}
                    {(currentStock > 0 || unitCost > 0) && (
                      <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Valor Total Inventario</span>
                          </div>
                          <span className="text-lg font-bold text-blue-700">
                            ${totalValue.toLocaleString('es-CL')}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          {currentStock || 0} unidades × ${(unitCost || 0).toLocaleString('es-CL')} c/u
                        </p>
                      </div>
                    )}

                    {/* Estado del stock */}
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">Estado del Stock</span>
                        {currentStock > 0 && minimumStock > 0 ? (
                          isLowStock ? (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                              <span className="text-xs font-semibold text-yellow-700">Bajo</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-xs font-semibold text-green-700">Normal</span>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-gray-500">Sin definir</span>
                        )}
                      </div>
                      {currentStock > 0 && minimumStock > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span>{Math.min(100, Math.round((currentStock / minimumStock) * 100))}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isLowStock ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, (currentStock / minimumStock) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Alerta de stock bajo */}
                    {isLowStock && currentStock > 0 && (
                      <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-yellow-800 font-semibold text-sm">Alerta: Stock Bajo</p>
                            <p className="text-yellow-700 text-xs mt-1">
                              Stock actual ({currentStock}) ≤ mínimo ({minimumStock})
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                  {/* Sección 3: Costos y Proveedor */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Costos y Proveedor</h2>
                    </div>
                    <div className="space-y-4">
                      {/* Costo Unitario */}
                      <div className="space-y-2">
                        <Label htmlFor="unit_cost" className="flex items-center space-x-2 text-gray-700 font-medium">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                          <span>Costo Unitario (CLP) *</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="unit_cost"
                            type="number"
                            min="0"
                            step="0.01"
                            {...register('unit_cost', { valueAsNumber: true })}
                            placeholder="0"
                            className={`h-11 pl-10 ${errors.unit_cost ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                          />
                        </div>
                        {errors.unit_cost && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{errors.unit_cost.message}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">Precio de compra por unidad</p>
                      </div>

                      {/* Proveedor */}
                      <div className="space-y-2">
                        <Label htmlFor="supplier" className="flex items-center space-x-2 text-gray-700 font-medium">
                          <Building2 className="h-4 w-4 text-purple-600" />
                          <span>Proveedor *</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="supplier"
                            {...register('supplier')}
                            placeholder="Ej: Repuestos Agrícolas S.A."
                            className={`h-11 pl-10 ${errors.supplier ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'}`}
                          />
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.supplier && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{errors.supplier.message}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">Nombre del proveedor o distribuidor</p>
                      </div>
                    </div>
                  </div>

                  {/* Sección 4: Compatibilidad */}
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                      <Truck className="h-5 w-5 text-orange-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Compatibilidad</h2>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="machinery_id" className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Settings className="h-4 w-4 text-orange-600" />
                        <span>Maquinaria Compatible</span>
                      </Label>
                      <Controller
                        name="machinery_id"
                        control={control}
                        render={({ field }) => (
                          <Select 
                            onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))} 
                            value={field.value?.toString() || 'none'}
                          >
                            <SelectTrigger className={`h-11 ${errors.machinery_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}>
                              <SelectValue placeholder="Selecciona una maquinaria (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sin maquinaria específica (Repuesto genérico)</SelectItem>
                              {machinery.map((mach) => (
                                <SelectItem key={mach.id} value={mach.id.toString()}>
                                  {mach.brand} {mach.model} - {mach.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.machinery_id && (
                        <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{errors.machinery_id.message}</span>
                        </p>
                      )}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-blue-800 flex items-start space-x-2">
                          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Importante:</strong> Selecciona la maquinaria específica para evitar usar repuestos incompatibles.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de Valor Mejorado */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full -ml-12 -mb-12"></div>
                <div className="relative p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Resumen de Valor</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
                      <p className="text-sm text-gray-600 mb-1">Stock Actual</p>
                      <p className="text-2xl font-bold text-blue-700">{currentStock || 0} unidades</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
                      <p className="text-sm text-gray-600 mb-1">Costo Unitario</p>
                      <p className="text-2xl font-bold text-indigo-700">{formatCLP(unitCost || 0)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
                      <p className="text-sm text-blue-100 mb-1">Valor Total</p>
                      <p className="text-2xl font-bold">{formatCLP(totalValue)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción Mejorados */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/repuestos')}
                  className="px-6 h-11 border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="px-8 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



















































