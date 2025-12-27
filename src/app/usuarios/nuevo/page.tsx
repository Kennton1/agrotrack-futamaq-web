'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Plus, User, Mail, Phone, Shield, X, Lock } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { createNewUser } from '@/app/actions/auth-actions'
import { useApp } from '@/contexts/AppContext'

const userSchema = z.object({
  full_name: z.string().min(1, 'El nombre completo es requerido'),
  email: z.string().email('El email debe ser válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['administrador', 'operador', 'cliente', 'mecanico', 'trabajador'], {
    message: 'El rol es requerido',
  }),
  phone: z.string().optional(),
  is_active: z.boolean(),
})

type UserFormData = z.infer<typeof userSchema>

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const { fetchData } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      role: 'operador',
      phone: '',
      is_active: true,
    },
  })

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createNewUser(data)

      if (result.success) {
        toast.success('Usuario creado exitosamente')
        // Recargar datos globales para que aparezca en la lista
        await fetchData()
        router.push('/usuarios')
      } else {
        toast.error('Error al crear usuario: ' + result.error)
      }
    } catch (error) {
      toast.error('Error inesperado al crear usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
          <p className="text-gray-600">Crea un nuevo usuario en el sistema</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/usuarios')}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Información del Usuario</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre Completo */}
              <div>
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Ej: Juan Pérez González"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Ej: juan.perez@futamaq.cl"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Contraseña */}
              <div>
                <Label htmlFor="password">Contraseña Temporal</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="text"
                    {...register('password')}
                    placeholder="Ej: Temporal.123"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Comparte esta contraseña con el usuario para su primer ingreso.</p>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {/* Rol */}
              <div>
                <Label htmlFor="role">Rol</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => {
                    const roleLabels: { [key: string]: string } = {
                      'administrador': 'Administrador',
                      'operador': 'Operador',
                      'cliente': 'Cliente',
                      'mecanico': 'Mecánico',
                      'trabajador': 'Trabajador'
                    }

                    return (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                          <span className={field.value ? "text-gray-900" : "text-gray-500"}>
                            {field.value ? roleLabels[field.value] : "Selecciona un rol"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administrador">Administrador</SelectItem>
                          <SelectItem value="operador">Operador</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="mecanico">Mecánico</SelectItem>
                          <SelectItem value="trabajador">Trabajador</SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  }}
                />
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <Label htmlFor="phone">Teléfono (Opcional)</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Ej: +56 9 1234 5678"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              {/* Estado */}
              <div className="md:col-span-2">
                <Label htmlFor="is_active">Estado</Label>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value.toString()}>
                      <SelectTrigger>
                        <span className="text-gray-900">
                          {field.value ? "Activo" : "Inactivo"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" variant="outline" onClick={() => router.push('/usuarios')}>
                Cancelar
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Usuario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
















































