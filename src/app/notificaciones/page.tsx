'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Bell, CheckCircle, XCircle, AlertTriangle, Info,
  Clock, Mail, MessageSquare, Truck, Wrench, Fuel,
  Package, Filter, Search, Check, Trash2,
  Settings, RefreshCw, Archive, AlertCircle, Eye, MapPin, X, Image as ImageIcon
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useApp } from '@/contexts/AppContext'

interface Notification {
  id: number
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'maintenance' | 'fuel' | 'stock' | 'system' | 'work_order' | 'machinery'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionRequired: boolean
  actionUrl?: string
  relatedId?: number
}

interface Incident {
  id: number
  title: string
  description: string
  type: 'mechanical' | 'operational' | 'safety' | 'environmental' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  machineryId?: number
  machineryCode?: string
  location?: string
  resolution?: string
  resolvedAt?: string
  photos?: string[]
  images?: string[]
}

export default function NotificacionesPage() {
  const { machinery, notifications: appNotifications, incidents: appIncidents, markNotificationAsRead, markAllAsRead: contextMarkAllAsRead } = useApp()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'notifications' | 'incidents'>('notifications')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  useEffect(() => {
    // Transformar notificaciones del contexto al formato local
    const mappedNotifications: Notification[] = appNotifications.map((n: any) => ({
      id: parseInt(n.id) || Date.now(), // Fallback por si id no es numérico
      type: n.type === 'incident' ? 'warning' : 'info', // Simplificación
      category: n.type === 'incident' ? 'machinery' : 'system',
      title: n.title,
      message: n.message,
      isRead: n.read,
      createdAt: n.timestamp,
      priority: 'high', // Por defecto
      actionRequired: true,
      actionUrl: n.link,
      relatedId: 0
    }))

    setNotifications(mappedNotifications)

    // Mapear incidentes reales
    const mappedIncidents: Incident[] = appIncidents.map((inc: any) => ({
      id: inc.id,
      title: inc.title,
      description: inc.description || '',
      reportedBy: inc.reporter_id || 'Usuario',
      reportedAt: inc.created_at,
      assignedTo: inc.assigned_to,
      machineryId: inc.machinery_id,
      machineryCode: inc.machinery_id ? 'MAQ-' + inc.machinery_id : undefined,
      location: inc.location ? (typeof inc.location === 'string' ? inc.location : inc.location.address || 'Ubicación') : 'Sin ubicación',
      resolution: inc.resolution,
      resolvedAt: inc.resolved_at,
      severity: (inc.severity === 'baja' ? 'low' :
        inc.severity === 'media' ? 'medium' :
          inc.severity === 'alta' ? 'high' :
            inc.severity === 'critica' ? 'critical' :
              (inc.severity || 'medium')) as any,
      type: (inc.type === 'mecanica' ? 'mechanical' :
        inc.type === 'operacional' ? 'operational' :
          inc.type === 'climatica' ? 'environmental' :
            inc.type === 'otra' ? 'other' :
              (inc.type || 'other')) as any,
      status: (inc.status === 'abierta' ? 'open' :
        inc.status === 'en_curso' ? 'in_progress' :
          inc.status === 'resuelta' ? 'resolved' :
            (inc.status || 'open')) as any,
      photos: inc.photos || []
    }))

    setIncidents(mappedIncidents)
    setLoading(false)
  }, [appNotifications, appIncidents])


  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead) ||
      notification.category === filter ||
      notification.type === filter ||
      notification.priority === filter

    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'maintenance') return <Wrench className="h-5 w-5" />
    if (category === 'fuel') return <Fuel className="h-5 w-5" />
    if (category === 'stock') return <Package className="h-5 w-5" />
    if (category === 'machinery') return <Truck className="h-5 w-5" />
    if (category === 'work_order') return <CheckCircle className="h-5 w-5" />
    if (category === 'system') return <Settings className="h-5 w-5" />

    switch (type) {
      case 'error': return <XCircle className="h-5 w-5" />
      case 'warning': return <AlertTriangle className="h-5 w-5" />
      case 'success': return <CheckCircle className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-500 dark:text-red-400'
      case 'warning': return 'text-yellow-500 dark:text-yellow-400'
      case 'success': return 'text-green-500 dark:text-green-400'
      default: return 'text-blue-500 dark:text-blue-400'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger' as const
      case 'high': return 'warning' as const
      case 'medium': return 'info' as const
      default: return 'success' as const
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítica'
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      default: return 'Baja'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'maintenance': return 'Mantenimiento'
      case 'fuel': return 'Combustible'
      case 'stock': return 'Stock'
      case 'system': return 'Sistema'
      case 'work_order': return 'Orden de Trabajo'
      case 'machinery': return 'Maquinaria'
      default: return 'General'
    }
  }

  const markAsRead = (id: number) => {
    markNotificationAsRead(id.toString())
  }

  const markAllAsRead = () => {
    contextMarkAllAsRead()
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id))
    toast.success('Notificación eliminada')
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isRead).length

  const openIncidentsCount = incidents.filter(i => i.status === 'open').length
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'closed').length

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = searchTerm === '' ||
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === 'all' ||
      incident.status === filter ||
      incident.type === filter ||
      incident.severity === filter

    return matchesSearch && matchesFilter
  })

  const getIncidentTypeLabel = (type: string) => {
    switch (type) {
      case 'mechanical': return 'Mecánica'
      case 'operational': return 'Operacional'
      case 'safety': return 'Seguridad'
      case 'environmental': return 'Ambiental'
      default: return 'Otro'
    }
  }

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800'
      default: return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
    }
  }

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      case 'in_progress': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'resolved': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700/50'
    }
  }

  const getIncidentStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierta'
      case 'in_progress': return 'En Progreso'
      case 'resolved': return 'Resuelta'
      default: return 'Cerrada'
    }
  }

  const getMachineryName = (machineryId?: number) => {
    if (!machineryId) return null
    const mach = machinery.find(m => m.id === machineryId)
    return mach ? `${mach.brand} ${mach.model}` : null
  }

  if (loading) {
    return (
      <div className="p-6">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notificaciones e Incidencias</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona las alertas, notificaciones e incidencias del sistema</p>
        </div>
        <div className="flex space-x-2">
          {activeTab === 'notifications' && (
            <>
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Marcar Todas como Leídas</span>
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Configurar</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
              {unreadCount > 0 && (
                <Badge variant="warning" size="sm">{unreadCount}</Badge>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'incidents'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Incidencias</span>
              {openIncidentsCount > 0 && (
                <Badge variant="danger" size="sm">{openIncidentsCount}</Badge>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Estadísticas rápidas */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card onClick={() => setFilter('all')} className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 ${filter === 'all' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setFilter('unread')} className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 ${filter === 'unread' ? 'ring-2 ring-orange-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No Leídas</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">{unreadCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setFilter('critical')} className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 ${filter === 'critical' ? 'ring-2 ring-red-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Críticas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-500">{criticalCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setFilter('read')} className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 ${filter === 'read' ? 'ring-2 ring-green-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leídas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-500">{notifications.length - unreadCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card onClick={() => setFilter('all')} className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 ${filter === 'all' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{incidents.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setFilter('open')} className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 ${filter === 'open' ? 'ring-2 ring-red-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Abiertas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-500">{openIncidentsCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setFilter('critical')} className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 ${filter === 'critical' ? 'ring-2 ring-red-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Críticas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-500">{criticalIncidentsCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card onClick={() => setFilter('resolved')} className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 ${filter === 'resolved' ? 'ring-2 ring-green-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resueltas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-500">{incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'notifications' ? "Buscar notificaciones..." : "Buscar incidencias..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
              />
            </div>

            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {activeTab === 'notifications' ? (
                  <>
                    <option value="all">Todas las notificaciones</option>
                    <option value="unread">No leídas</option>
                    <option value="read">Leídas</option>
                    <option value="critical">Críticas</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="fuel">Combustible</option>
                    <option value="stock">Stock</option>
                    <option value="system">Sistema</option>
                  </>
                ) : (
                  <>
                    <option value="all">Todas las incidencias</option>
                    <option value="open">Abiertas</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="resolved">Resueltas</option>
                    <option value="closed">Cerradas</option>
                    <option value="mechanical">Mecánicas</option>
                    <option value="operational">Operacionales</option>
                    <option value="safety">Seguridad</option>
                    <option value="environmental">Ambientales</option>
                    <option value="critical">Críticas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </>
                )}
              </select>
            </div>

            {activeTab === 'notifications' && (
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="error">Errores</option>
                  <option value="warning">Advertencias</option>
                  <option value="info">Información</option>
                  <option value="success">Éxito</option>
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow dark:bg-gray-800 ${!notification.isRead ? 'ring-2 ring-blue-100 bg-blue-50 dark:bg-blue-900/10 dark:ring-blue-900/30' : ''
                }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={getNotificationColor(notification.type)}>
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(notification.createdAt)} {formatTime(notification.createdAt)}</span>
                      </div>
                      <Badge variant={getPriorityBadgeVariant(notification.priority)}>
                        {getPriorityLabel(notification.priority)}
                      </Badge>
                      <Badge variant="default">
                        {getCategoryLabel(notification.category)}
                      </Badge>
                      {notification.actionRequired && (
                        <Badge variant="warning">
                          Requiere Acción
                        </Badge>
                      )}
                    </div>

                    {notification.actionUrl && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = notification.actionUrl!}
                          className="flex items-center space-x-2"
                        >
                          <span>Ver Detalles</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Marcar</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron notificaciones</h3>
            <p className="text-gray-500 dark:text-gray-400">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Lista de incidencias */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <Card
              key={incident.id}
              className={`hover:shadow-md transition-shadow dark:bg-gray-800 ${incident.status === 'open' ? 'ring-2 ring-red-100 bg-red-50/50 dark:bg-red-900/10 dark:ring-red-900/30' : ''
                }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertCircle className={`h-5 w-5 ${getIncidentSeverityColor(incident.severity).split(' ')[0] || 'text-gray-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {incident.title}
                          </h3>
                          {incident.status === 'open' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{incident.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getIncidentSeverityColor(incident.severity)}`}>
                        {incident.severity === 'critical' ? 'Crítica' :
                          incident.severity === 'high' ? 'Alta' :
                            incident.severity === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getIncidentStatusColor(incident.status)}`}>
                        {getIncidentStatusLabel(incident.status)}
                      </span>
                      <Badge variant="default">
                        {getIncidentTypeLabel(incident.type)}
                      </Badge>
                      {getMachineryName(incident.machineryId) && (
                        <Badge variant="info">
                          {getMachineryName(incident.machineryId)}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Reportada: {formatDate(incident.reportedAt)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Reportado por:</span> {incident.reportedBy}
                      </div>
                      {incident.assignedTo && (
                        <div>
                          <span className="font-medium">Asignado a:</span> {incident.assignedTo}
                        </div>
                      )}
                      {incident.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{incident.location}</span>
                        </div>
                      )}
                    </div>

                    {incident.resolution && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
                        <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">Resolución:</p>
                        <p className="text-sm text-green-700 dark:text-green-300">{incident.resolution}</p>
                        {incident.resolvedAt && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Resuelta el: {formatDate(incident.resolvedAt)}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedIncident(incident)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver Detalles</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'incidents' && filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron incidencias</h3>
            <p className="text-gray-500 dark:text-gray-400">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalles de incidencia */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className={`h-6 w-6 ${getIncidentSeverityColor(selectedIncident.severity).split(' ')[0] || 'text-gray-500'}`} />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{selectedIncident.title}</h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedIncident(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción</p>
                <p className="text-gray-900 dark:text-white">{selectedIncident.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo</p>
                  <Badge variant="default">{getIncidentTypeLabel(selectedIncident.type)}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Severidad</p>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getIncidentSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity === 'critical' ? 'Crítica' :
                      selectedIncident.severity === 'high' ? 'Alta' :
                        selectedIncident.severity === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Estado</p>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getIncidentStatusColor(selectedIncident.status)}`}>
                    {getIncidentStatusLabel(selectedIncident.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reportado por</p>
                  <p className="text-gray-900 dark:text-white">{selectedIncident.reportedBy}</p>
                </div>
                {selectedIncident.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Asignado a</p>
                    <p className="text-gray-900 dark:text-white">{selectedIncident.assignedTo}</p>
                  </div>
                )}
                {getMachineryName(selectedIncident.machineryId) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Maquinaria</p>
                    <p className="text-gray-900 dark:text-white">{getMachineryName(selectedIncident.machineryId)}</p>
                  </div>
                )}
                {selectedIncident.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ubicación</p>
                    <p className="text-gray-900 dark:text-white">{selectedIncident.location}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de Reporte</p>
                <p className="text-gray-900 dark:text-white">{formatDate(selectedIncident.reportedAt)} {formatTime(selectedIncident.reportedAt)}</p>
              </div>

              {selectedIncident.resolution && (
                <div className="p-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Resolución</p>
                  <p className="text-green-700 dark:text-green-300">{selectedIncident.resolution}</p>
                  {selectedIncident.resolvedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Resuelta el: {formatDate(selectedIncident.resolvedAt)} {formatTime(selectedIncident.resolvedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Photographic Evidence Section */}
              {((selectedIncident.photos && selectedIncident.photos.length > 0) || (selectedIncident.images && selectedIncident.images.length > 0)) && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Evidencia Fotográfica</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[...(selectedIncident.photos || []), ...(selectedIncident.images || [])].map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={photo}
                          alt={`Evidencia ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setSelectedIncident(null)}
                >
                  Cerrar
                </Button>
                {selectedIncident.status === 'open' && (
                  <Button>
                    Tomar Incidencia
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
