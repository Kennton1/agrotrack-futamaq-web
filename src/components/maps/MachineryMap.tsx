'use client'

import { useState } from 'react'
import { X, MapPin, Truck, Settings, Clock, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Machinery {
  id: number
  code: string
  patent: string
  type: 'tractor' | 'implemento' | 'camion' | 'cosechadora' | 'pulverizador' | 'sembradora'
  brand: string
  model: string
  year: number
  total_hours: number
  status: 'disponible' | 'en_faena' | 'en_mantencion' | 'fuera_servicio'
  fuel_capacity: number
  hourly_cost: number
  last_location: {
    lat: number
    lng: number
    address: string
  }
  created_at: string
}

interface MachineryMapProps {
  machinery: Machinery[]
  onClose: () => void
}

export default function MachineryMap({ machinery, onClose }: MachineryMapProps) {
  const [selectedMachinery, setSelectedMachinery] = useState<Machinery | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tractor':
        return <Truck className="h-4 w-4 text-blue-500" />
      case 'implemento':
        return <Settings className="h-4 w-4 text-green-500" />
      case 'camion':
        return <Truck className="h-4 w-4 text-orange-500" />
      case 'cosechadora':
        return <Truck className="h-4 w-4 text-purple-500" />
      case 'pulverizador':
        return <Settings className="h-4 w-4 text-cyan-500" />
      case 'sembradora':
        return <Settings className="h-4 w-4 text-yellow-500" />
      default:
        return <Truck className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'success' as const
      case 'en_faena':
        return 'info' as const
      case 'en_mantencion':
        return 'warning' as const
      case 'fuera_servicio':
        return 'danger' as const
      default:
        return 'default' as const
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'Disponible'
      case 'en_faena':
        return 'En Faena'
      case 'en_mantencion':
        return 'En Mantención'
      case 'fuera_servicio':
        return 'Fuera de Servicio'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible':
        return '#10B981' // green-500
      case 'en_faena':
        return '#3B82F6' // blue-500
      case 'en_mantencion':
        return '#F59E0B' // yellow-500
      case 'fuera_servicio':
        return '#EF4444' // red-500
      default:
        return '#6B7280' // gray-500
    }
  }

  // Calcular el centro del mapa basado en las ubicaciones de las maquinarias
  const centerLat = machinery.length > 0 
    ? machinery.reduce((sum, m) => sum + m.last_location.lat, 0) / machinery.length 
    : -39.7500
  const centerLng = machinery.length > 0 
    ? machinery.reduce((sum, m) => sum + m.last_location.lng, 0) / machinery.length 
    : -73.1800

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mapa de Maquinarias</h2>
            <p className="text-gray-600">Ubicaciones actuales de {machinery.length} maquinarias</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 flex">
          {/* Mapa simulado */}
          <div className="flex-1 relative bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
            {/* Fondo del mapa simulado */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 800 600">
                {/* Líneas de cuadrícula */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Elementos del paisaje simulado */}
                <circle cx="200" cy="150" r="30" fill="#22C55E" opacity="0.4" />
                <circle cx="600" cy="300" r="40" fill="#22C55E" opacity="0.4" />
                <rect x="100" y="400" width="150" height="80" fill="#3B82F6" opacity="0.3" rx="10" />
                <rect x="500" y="100" width="200" height="60" fill="#3B82F6" opacity="0.3" rx="10" />
              </svg>
            </div>

            {/* Marcadores de maquinarias */}
            {machinery.map((machine, index) => {
              // Convertir coordenadas reales a posición en el mapa simulado
              const x = 100 + (index % 5) * 120 + Math.random() * 50
              const y = 100 + Math.floor(index / 5) * 100 + Math.random() * 50
              
              return (
                <div
                  key={machine.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
                  style={{ left: `${x}px`, top: `${y}px` }}
                  onClick={() => setSelectedMachinery(machine)}
                >
                  <div className="relative">
                    {/* Pin del mapa */}
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: getStatusColor(machine.status) }}
                    >
                      {getTypeIcon(machine.type)}
                    </div>
                    
                    {/* Etiqueta con nombre */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
                      {machine.brand} {machine.model}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Leyenda */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Estado de Maquinarias</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">En Faena</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600">En Mantención</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Fuera de Servicio</span>
                </div>
              </div>
            </div>

            {/* Información de coordenadas */}
            <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
              <div className="text-xs text-gray-600">
                <div>Centro: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}</div>
                <div className="mt-1 text-gray-500">Región de Los Ríos, Chile</div>
              </div>
            </div>
          </div>

          {/* Panel lateral con lista de maquinarias */}
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lista de Maquinarias</h3>
              <div className="space-y-3">
                {machinery.map((machine) => (
                  <Card 
                    key={machine.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedMachinery?.id === machine.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                    }`}
                    onClick={() => setSelectedMachinery(machine)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(machine.type)}
                          <span className="font-medium text-sm">{machine.brand} {machine.model}</span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(machine.status)} className="text-xs">
                          {getStatusLabel(machine.status)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div className="font-medium">{machine.brand} {machine.model}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{machine.last_location.address}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel de detalles de maquinaria seleccionada */}
        {selectedMachinery && (
          <div className="border-t bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTypeIcon(selectedMachinery.type)}
                <div>
                  <h3 className="font-medium text-gray-900">{selectedMachinery.brand} {selectedMachinery.model}</h3>
                  <p className="text-sm text-gray-600">Patente: {selectedMachinery.patent}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedMachinery.status)}>
                  {getStatusLabel(selectedMachinery.status)}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{selectedMachinery.total_hours}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedMachinery.last_location.address}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}




































