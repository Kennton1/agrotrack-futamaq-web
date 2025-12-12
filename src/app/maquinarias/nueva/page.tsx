'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Truck, Wrench, X, MapPin, Fuel, Settings, CreditCard, Calendar, Activity, DollarSign } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { useApp } from '@/contexts/AppContext'
import { MachineryImage } from '@/components/maquinarias/ImageCarousel'
import { ImageUpload } from '@/components/maquinarias/ImageUpload'

const machinerySchema = z.object({
  patent: z.string().min(1, 'La patente es requerida'),
  type: z.enum(['tractor', 'implemento', 'camion', 'cosechadora', 'pulverizador', 'sembradora'], {
    message: 'El tipo de maquinaria es requerido',
  }),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().min(1900, 'El año debe ser válido').max(new Date().getFullYear() + 1, 'El año no puede ser futuro'),
  total_hours: z.number().min(0, 'Las horas totales no pueden ser negativas'),
  status: z.enum(['disponible', 'en_faena', 'en_mantencion', 'fuera_servicio'], {
    message: 'El estado es requerido',
  }),
  fuel_capacity: z.number().min(0, 'La capacidad de combustible no puede ser negativa'),
  hourly_cost: z.number().min(0, 'El costo por hora no puede ser negativo'),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    alt: z.string(),
    is_primary: z.boolean(),
  })).optional(),
  last_location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1, 'La dirección es requerida'),
  }),
})

type MachineryFormData = z.infer<typeof machinerySchema>

export default function NuevaMaquinariaPage() {
  const router = useRouter()
  const { addMachinery } = useApp()
  const [images, setImages] = useState<MachineryImage[]>([])

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MachineryFormData>({
    resolver: zodResolver(machinerySchema),
    defaultValues: {
      patent: '',
      type: 'tractor',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      total_hours: 0,
      status: 'disponible',
      fuel_capacity: 0,
      hourly_cost: 0,
      images: [],
      last_location: {
        lat: -39.7500,
        lng: -73.1800,
        address: '',
      },
    },
  })

  const onSubmit = async (data: MachineryFormData) => {
    // Crear una copia profunda de las imágenes para evitar problemas de referencia
    const imagesToSave = images && images.length > 0
      ? JSON.parse(JSON.stringify(images))
      : []

    const newMachinery = {
      ...data,
      code: '', // Código vacío ya que no se usa
      images: imagesToSave,
      id: Math.floor(Math.random() * 10000) + 1000, // Generar ID temporal (Will be ignored/overwritten by Context/DB logic usually, but Machinery DB has Serial ID, so it is ignored)
      created_at: new Date().toISOString(),
    }

    await addMachinery(newMachinery)
    router.push('/maquinarias')
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
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Nueva Maquinaria</h1>
                <p className="text-blue-100">Registra una nueva maquinaria en el inventario</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/maquinarias')}
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
                  {/* Patente */}
                  <div className="space-y-2">
                    <Label htmlFor="patent" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span>Patente *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="patent"
                        {...register('patent')}
                        placeholder="Ej: JKL012"
                        className={`h-11 pl-10 ${errors.patent ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.patent && <p className="text-red-500 text-sm mt-1">{errors.patent.message}</p>}
                  </div>

                  {/* Tipo */}
                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <span>Tipo de Maquinaria *</span>
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
                            <SelectItem value="tractor">Tractor</SelectItem>
                            <SelectItem value="implemento">Implemento</SelectItem>
                            <SelectItem value="camion">Camión</SelectItem>
                            <SelectItem value="cosechadora">Cosechadora</SelectItem>
                            <SelectItem value="pulverizador">Pulverizador</SelectItem>
                            <SelectItem value="sembradora">Sembradora</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                  </div>

                  {/* Marca */}
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Marca *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="brand"
                        {...register('brand')}
                        placeholder="Ej: John Deere"
                        className={`h-11 pl-10 ${errors.brand ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
                  </div>

                  {/* Modelo */}
                  <div className="space-y-2">
                    <Label htmlFor="model" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Settings className="h-4 w-4 text-blue-600" />
                      <span>Modelo *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="model"
                        {...register('model')}
                        placeholder="Ej: 6120M"
                        className={`h-11 pl-10 ${errors.model ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>}
                  </div>

                  {/* Año */}
                  <div className="space-y-2">
                    <Label htmlFor="year" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Año *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="year"
                        type="number"
                        {...register('year', { valueAsNumber: true })}
                        placeholder="Ej: 2023"
                        className={`h-11 pl-10 ${errors.year ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
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
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="en_faena">En Faena</SelectItem>
                            <SelectItem value="en_mantencion">En Mantención</SelectItem>
                            <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                  </div>

                  {/* Horas Totales */}
                  <div className="space-y-2">
                    <Label htmlFor="total_hours" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Horas Totales</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="total_hours"
                        type="number"
                        {...register('total_hours', { valueAsNumber: true })}
                        placeholder="Ej: 2500"
                        className={`h-11 pl-10 ${errors.total_hours ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.total_hours && <p className="text-red-500 text-sm mt-1">{errors.total_hours.message}</p>}
                  </div>

                  {/* Capacidad de Combustible */}
                  <div className="space-y-2">
                    <Label htmlFor="fuel_capacity" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Fuel className="h-4 w-4 text-blue-600" />
                      <span>Capacidad de Combustible (L)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="fuel_capacity"
                        type="number"
                        {...register('fuel_capacity', { valueAsNumber: true })}
                        placeholder="Ej: 120"
                        className={`h-11 pl-10 ${errors.fuel_capacity ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.fuel_capacity && <p className="text-red-500 text-sm mt-1">{errors.fuel_capacity.message}</p>}
                  </div>

                  {/* Costo por Hora */}
                  <div className="space-y-2">
                    <Label htmlFor="hourly_cost" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span>Costo por Hora ($)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="hourly_cost"
                        type="number"
                        {...register('hourly_cost', { valueAsNumber: true })}
                        placeholder="Ej: 45000"
                        className={`h-11 pl-10 ${errors.hourly_cost ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.hourly_cost && <p className="text-red-500 text-sm mt-1">{errors.hourly_cost.message}</p>}
                  </div>

                  {/* Ubicación */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="flex items-center space-x-2 text-gray-700 font-medium">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Ubicación Actual *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="address"
                        {...register('last_location.address')}
                        placeholder="Ej: Camino a Melipilla Km 15, San Antonio"
                        className={`h-11 pl-10 ${errors.last_location?.address ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.last_location?.address && <p className="text-red-500 text-sm mt-1">{errors.last_location.address.message}</p>}
                  </div>
                </div>
              </div>

              {/* Carga de imágenes */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={10}
                  label="Imágenes de la Maquinaria"
                />
              </div>

              {/* Botones de Acción Mejorados */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/maquinarias')}
                  className="px-6 h-11 border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="px-8 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Guardar Maquinaria
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}