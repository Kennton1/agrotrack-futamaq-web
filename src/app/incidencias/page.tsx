'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Plus, Search, Filter, Trash2, Eye, AlertTriangle,
  X, ChevronLeft, ChevronRight, Clock, User, MapPin, Package, RefreshCw, Image as ImageIcon
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useApp, Incident } from '@/contexts/AppContext'

export default function IncidenciasPage() {
  const { incidents, workOrders, machinery, users, deleteIncident, fetchData } = useApp()
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)


  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const itemsPerPage = 9
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for deep link to specific incident
    const incidentId = searchParams.get('id')
    if (incidentId && incidents.length > 0) {
      setHighlightedId(incidentId)
      // Opcional: limpiar el parámetro de la URL
    }
  }, [searchParams, incidents])

  useEffect(() => {
    // Cargar datos al montar el componente para asegurar consistencia
    fetchData()
  }, [])


  useEffect(() => {
    // Simular carga para UX
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [incidents])

  const getReporterName = (id: string) => {
    const user = users.find(u => u.id === id || u.email === id)
    return user ? user.full_name : id
  }

  const getWorkOrderInfo = (workOrderId?: string) => {
    if (!workOrderId) return null
    const wo = workOrders.find(w => w.id === workOrderId)
    if (!wo) return { label: workOrderId }

    // Intentar obtener maquinaria asociada
    let machineryCode = ''
    if (wo.assigned_machinery && wo.assigned_machinery.length > 0) {
      const m = machinery.find(mac => mac.id === wo.assigned_machinery![0])
      if (m) machineryCode = m.code
    }

    return {
      label: `OT-${wo.id}`,
      machineryCode
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = searchTerm === '' ||
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.work_order_id && incident.work_order_id.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = typeFilter === 'all' || incident.type === typeFilter
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Calcular paginación
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, statusFilter])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mecanica': return 'Mecánica'
      case 'operacional': return 'Operacional'
      case 'climatica': return 'Climática'
      case 'otra': return 'Otra'
      default: return type
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'abierta': return 'warning' as const
      case 'en_curso': return 'info' as const
      case 'resuelta': return 'success' as const
      default: return 'default' as const
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'abierta': return 'Abierta'
      case 'en_curso': return 'En Curso'
      case 'resuelta': return 'Resuelta'
      default: return status
    }
  }



  const handleView = (incident: Incident) => {
    console.log('Viewing incident:', incident)
    setSelectedIncident(incident)
  }

  const handleDelete = (incident: Incident) => {
    setSelectedIncident(incident)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedIncident) {
      deleteIncident(selectedIncident.id)
      setShowDeleteModal(false)
      setSelectedIncident(null)
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Incidencias</h1>
          <p className="text-gray-700 dark:text-gray-300">Gestión y seguimiento de incidencias reportadas (Sincronizado)</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            setIsRefreshing(true)
            await fetchData()
            setIsRefreshing(false)
          }}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Incidencias</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{incidents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Abiertas</p>
                <p className="text-2xl font-bold text-red-600">
                  {incidents.filter(i => i.status === 'abierta').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Curso</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {incidents.filter(i => i.status === 'en_curso').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
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
                placeholder="Buscar por título, descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">Todos los tipos</option>
                <option value="mecanica">Mecánica</option>
                <option value="operacional">Operacional</option>
                <option value="climatica">Climática</option>
                <option value="otra">Otra</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="abierta">Abierta</option>
                <option value="en_curso">En Curso</option>
                <option value="resuelta">Resuelta</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de incidencias con paginación */}
      <div className="space-y-6">
        {/* Grid de incidencias - formato compacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedIncidents.map((incident) => {
            const woInfo = getWorkOrderInfo(incident.work_order_id)
            const isHighlighted = highlightedId === incident.id.toString()

            return (
              <Card
                key={incident.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${isHighlighted ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => {
                  if (isHighlighted) setHighlightedId(null)
                  // No abrir modal automáticamente al hacer clic en la tarjeta si solo se está desseleccionando
                  // Pero el usuario dijo "durara hasta que se seleccione". 
                  // Si "seleccionar" es hacer clic para ver detalles, entonces:
                  handleView(incident)
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <CardTitle className="text-base">{incident.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="font-medium">{getTypeLabel(incident.type)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado</p>
                      <Badge variant={getStatusBadgeVariant(incident.status)} size="sm">
                        {getStatusLabel(incident.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <p className="text-gray-500">Reportado por</p>
                      <p className="font-medium text-xs truncate">{getReporterName(incident.reporter_id)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha</p>
                      <p className="font-medium text-xs">{formatDate(incident.created_at)}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 line-clamp-2">
                    {incident.description}
                  </div>

                  {woInfo && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Package className="h-3 w-3" />
                      <span>OT: {woInfo.label} {woInfo.machineryCode ? `(${woInfo.machineryCode})` : ''}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(incident)}
                        title="Ver detalles"
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(incident)}
                        title="Eliminar"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1 pt-4">
            {currentPage > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-8 px-3 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 font-medium mr-1"
              >
                Anterior
              </Button>
            )}

            <span className="text-sm text-gray-400 px-2">
              Página {currentPage} de {totalPages}
            </span>

            {currentPage < totalPages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8 px-3 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 font-medium ml-1"
              >
                Siguiente
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron incidencias</h3>
            <p className="text-gray-500">No hay registros que coincidan con los filtros o aún no se han reportado incidencias.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Incidencia</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar la incidencia{' '}
                <span className="font-semibold">{selectedIncident.title}</span>?
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualización de Detalles */}
      {selectedIncident && !showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedIncident.title}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getTypeLabel(selectedIncident.type)} • ID: #{selectedIncident.id}
                  </p>
                  <Badge variant={getStatusBadgeVariant(selectedIncident.status)}>
                    {getStatusLabel(selectedIncident.status)}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Hero Image */}
              {selectedIncident.photos && selectedIncident.photos.length > 0 ? (
                <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  {(() => {
                    // Get first image for hero
                    const firstPhoto = selectedIncident.photos![0];
                    const heroUrl = typeof firstPhoto === 'string' ? firstPhoto : (firstPhoto as any).url;
                    return (
                      <div className="relative aspect-video group">
                        <img
                          src={heroUrl}
                          alt="Evidencia Principal"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a
                            href={heroUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" /> Ver Original
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Thumbnails if more than 1 */}
                  {selectedIncident.photos.length > 1 && (
                    <div className="p-2 gap-2 flex overflow-x-auto bg-white/50 dark:bg-black/20">
                      {selectedIncident.photos.slice(1).map((photo, idx) => {
                        const url = typeof photo === 'string' ? photo : (photo as any).url;
                        return (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block w-20 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity">
                            <img src={url} alt={`Evidencia ${idx + 2}`} className="w-full h-full object-cover" />
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-700">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm">Sin evidencia fotográfica</span>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Información General</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Reportado por</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{getReporterName(selectedIncident.reporter_id)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Fecha</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{formatDate(selectedIncident.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Estado</span>
                      <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-200">{selectedIncident.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Gravedad</span>
                      <span className={`text-sm font-bold uppercase ${selectedIncident.severity === 'critica' ? 'text-red-600' :
                          selectedIncident.severity === 'alta' ? 'text-orange-500' :
                            selectedIncident.severity === 'media' ? 'text-yellow-600' :
                              'text-blue-500'
                        }`}>
                        {selectedIncident.severity === 'critica' ? 'CRÍTICA' :
                          selectedIncident.severity === 'alta' ? 'ALTA' :
                            selectedIncident.severity === 'media' ? 'MEDIA' : 'BAJA'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Ubicación y Contexto</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Ubicación</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center justify-end truncate max-w-[150px]">
                        {selectedIncident.location?.address ? (
                          <>
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="truncate">{selectedIncident.location.address}</span>
                          </>
                        ) : 'No registrada'}
                      </span>
                    </div>
                    {selectedIncident.work_order_id && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Orden Trabajo</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{getWorkOrderInfo(selectedIncident.work_order_id)?.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Descripción</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3 rounded-b-xl">
              <Button
                variant="outline"
                onClick={() => setSelectedIncident(null)}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

