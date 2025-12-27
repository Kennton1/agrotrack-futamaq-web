'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Plus, Search, Edit, Trash2, Eye,
  Users, User, Mail, Phone, Calendar, Shield, X, Settings
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useApp } from '@/contexts/AppContext'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/Select'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'

const userSchema = z.object({
  full_name: z.string().min(1, 'El nombre completo es requerido'),
  email: z.string().email('El email debe ser válido'),
  role: z.enum(['administrador', 'operador', 'cliente', 'mecanico', 'trabajador'], {
    message: 'El rol es requerido',
  }),
  phone: z.string().optional(),
  is_active: z.boolean(),
})

type UserFormData = z.infer<typeof userSchema>

export default function UsuariosPage() {
  const { users, deleteUser, currentUser } = useApp()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading && currentUser && currentUser.role !== 'administrador') {
      router.push('/dashboard')
      toast.error('No tienes permisos para acceder a esta sección')
    }
  }, [currentUser, loading, router])

  // Funciones para manejar acciones
  const handleView = (user: any) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDelete = (user: any) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id)
      setShowDeleteModal(false)
      setSelectedUser(null)
    }
  }

  // Asegurar que users esté definido antes de usar filter
  const usersList = users || []
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrador':
        return <Shield className="h-5 w-5 text-red-500" />
      case 'operador':
        return <User className="h-5 w-5 text-blue-500" />
      case 'cliente':
        return <Users className="h-5 w-5 text-green-500" />
      case 'mecanico':
      case 'trabajador':
        return <Settings className="h-5 w-5 text-orange-500" />
      default:
        return <User className="h-5 w-5 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'danger' as const
      case 'operador':
        return 'info' as const
      case 'cliente':
        return 'success' as const
      case 'mecanico':
      case 'trabajador':
        return 'warning' as const
      default:
        return 'default' as const
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'Administrador'
      case 'operador':
        return 'Operador'
      case 'cliente':
        return 'Cliente'
      case 'mecanico':
        return 'Mecánico'
      case 'trabajador':
        return 'Trabajador'
      default:
        return role
    }
  }

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'success' as const : 'danger' as const
  }

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Inactivo'
  }

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-300">Administra los usuarios del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/usuarios/nuevo">
            <Button className="flex items-center space-x-2 !transform-none !scale-100 !transition-none bg-green-600 hover:bg-green-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{usersList.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {usersList.filter(u => u.is_active).length}
                </p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-red-600">
                  {usersList.filter(u => u.role === 'administrador').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operadores</p>
                <p className="text-2xl font-bold text-blue-600">
                  {usersList.filter(u => u.role === 'operador').length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos los roles</option>
                <option value="administrador">Administrador</option>
                <option value="operador">Operador</option>
                <option value="cliente">Cliente</option>
                <option value="mecanico">Mecánico</option>
                <option value="trabajador">Trabajador</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.full_name}</CardTitle>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(user.is_active)}>
                  {getStatusLabel(user.is_active)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(user.role)}
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>

              {user.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Registrado: {formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Último acceso: {formatDate(user.last_login)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(user)}
                    title="Ver detalles"
                    className="!transform-none !scale-100 !transition-none dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(user)}
                    title="Editar usuario"
                    className="!transform-none !scale-100 !transition-none dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user)}
                    title="Eliminar usuario"
                    className="!transform-none !scale-100 !transition-none dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Modal Ver Usuario */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Usuario</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                <p className="text-gray-900">{selectedUser.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Rol</label>
                <p className="text-gray-900">{getRoleLabel(selectedUser.role)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <p className="text-gray-900">{getStatusLabel(selectedUser.is_active)}</p>
              </div>
              {selectedUser.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-gray-900">{selectedUser.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Registro</label>
                <p className="text-gray-900">{formatDate(selectedUser.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Último Acceso</label>
                <p className="text-gray-900">{formatDate(selectedUser.last_login)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
        />
      )}

      {/* Modal Eliminar Usuario */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Eliminar Usuario</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.full_name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente Modal para Editar Usuario
function EditUserModal({ user, onClose, onSave }: { user: any, onClose: () => void, onSave: () => void }) {
  const { updateUser } = useApp()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      is_active: user.is_active,
    },
  })

  const onSubmit = (data: UserFormData) => {
    updateUser(user.id, data)
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Usuario</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div>
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                {...register('full_name')}
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
                    'cliente': 'Cliente',
                    'mecanico': 'Mecánico',
                    'trabajador': 'Trabajador'
                  }

                  return (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                        <span className="text-gray-900">
                          {roleLabels[field.value]}
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
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}



