'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Search, Edit, Trash2, Shield, UserCheck, UserX, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLogin: string
  department: string
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador FUTAMAQ',
    email: 'admin@futamaq.cl',
    role: 'Administrador',
    status: 'active',
    lastLogin: '2024-01-15 10:30',
    department: 'Gestión Agrícola'
  },
  {
    id: '2',
    name: 'Juan Pérez',
    email: 'juan.perez@futamaq.cl',
    role: 'Operador',
    status: 'active',
    lastLogin: '2024-01-15 09:15',
    department: 'Operaciones'
  },
  {
    id: '3',
    name: 'María González',
    email: 'maria.gonzalez@futamaq.cl',
    role: 'Supervisor',
    status: 'inactive',
    lastLogin: '2024-01-10 16:45',
    department: 'Supervisión'
  },
  {
    id: '4',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@futamaq.cl',
    role: 'Técnico',
    status: 'active',
    lastLogin: '2024-01-15 08:20',
    department: 'Mantenimiento'
  }
]

export default function GestionUsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')

  const filteredUsers = users.filter(user => {
    const userName = user.name || ''
    const userEmail = user.email || ''
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
      }
      return user
    }))
    toast.success('Estado del usuario actualizado')
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(prev => prev.filter(user => user.id !== userId))
      toast.success('Usuario eliminado')
    }
  }

  const handleNewUser = () => {
    router.push('/usuarios/nuevo')
  }


  const getStatusBadge = (user: any) => {
    const isActive = user.status === 'active'
    return isActive
      ? <Badge className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full text-xs font-medium">Activo</Badge>
      : <Badge className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-full text-xs font-medium">Inactivo</Badge>
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      'Administrador': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Supervisor': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Operador': 'bg-green-50 text-green-700 border border-green-200',
      'Técnico': 'bg-orange-50 text-orange-700 border border-orange-200'
    }
    return <Badge className={`${colors[role as keyof typeof colors] || 'bg-slate-50 text-slate-700 border border-slate-200'} px-2 py-1 rounded-full text-xs font-medium`}>{role}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Usuarios</h1>
                <p className="text-slate-600">Administra los usuarios del sistema</p>
              </div>
            </div>
        <Button 
          className="flex items-center space-x-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md"
          onClick={handleNewUser}
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Usuario</span>
        </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
              <div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
                >
                  <option value="all">Todos los roles</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Operador">Operador</option>
                  <option value="Técnico">Técnico</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">
                  {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-500">Activos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-14 w-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{user.name}</h3>
                      <p className="text-sm text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id)}
                      className="p-2 h-8 w-8 hover:bg-slate-50"
                      title={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/usuarios/editar/${user.id}`)}
                      className="p-2 h-8 w-8 hover:bg-slate-50"
                      title="Editar usuario"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Rol:</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Estado:</span>
                    {getStatusBadge(user)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Departamento:</span>
                    <span className="text-sm font-medium text-slate-700">{user.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Último acceso:</span>
                    <span className="text-sm text-slate-500">{user.lastLogin}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No se encontraron usuarios</h3>
              <p className="text-slate-500">Intenta ajustar los filtros de búsqueda</p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
