'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { User, Mail, Phone, Shield, X } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
const userSchema = z.object({
  full_name: z.string().min(1, 'El nombre completo es requerido'),
  email: z.string().email('El email debe ser válido'),
  role: z.enum(['administrador', 'operador', 'cliente'], {
    message: 'El rol es requerido',
  }),
  phone: z.string().optional(),
  is_active: z.boolean(),
})

type UserFormData = z.infer<typeof userSchema>

const mockUsers = [
  {
    id: '1',
    full_name: 'Administrador FUTAMAQ',
    email: 'admin@futamaq.cl',
    role: 'administrador' as const,
    phone: '',
    is_active: true,
  },
  {
    id: '2',
    full_name: 'Juan Pérez',
    email: 'juan.perez@futamaq.cl',
    role: 'operador' as const,
    phone: '',
    is_active: true,
  },
]

export default function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const userId = params.id
  const currentUser = mockUsers.find(u => u.id === userId)
  
  const updateUser = async (id: string, data: Partial<UserFormData>) => {
    // Mock update function
    toast.success('Usuario actualizado exitosamente')
  }

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'operador',
      phone: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (currentUser) {
      reset({
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        role: currentUser.role || 'operador',
        phone: currentUser.phone || '',
        is_active: currentUser.is_active ?? true,
      })
    } else {
      toast.error('Usuario no encontrado.')
      router.push('/gestion-usuarios')
    }
  }, [currentUser, reset, router])

  const onSubmit = (data: UserFormData) => {
    if (!currentUser) return

    updateUser(userId, data)
    toast.success('Usuario actualizado exitosamente!')
    router.push('/gestion-usuarios')
  }

  if (!currentUser) {
    return (
      <div className="p-6 text-center text-gray-600">Cargando o usuario no encontrado...</div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="text-gray-600">Modifica la información del usuario</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/gestion-usuarios')}>
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
                      'cliente': 'Cliente'
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
              <Button type="button" variant="outline" onClick={() => router.push('/gestion-usuarios')}>
                Cancelar
              </Button>
              <Button type="submit">
                <User className="h-4 w-4 mr-2" />
                Actualizar Usuario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}












































