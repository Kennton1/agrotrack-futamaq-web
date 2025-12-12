'use client'

import React from 'react'
import { useOffline } from '@/hooks/useOffline'
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function OfflineIndicator() {
  const { isOnline, isOfflineMode } = useOffline()

  React.useEffect(() => {
    if (!isOnline) {
      toast.error('Sin conexión a internet. Modo offline activado.', {
        duration: 5000,
        icon: '📡',
      })
    } else if (isOfflineMode) {
      toast.success('Conexión restaurada. Sincronizando datos...', {
        duration: 3000,
        icon: '🔄',
      })
    }
  }, [isOnline, isOfflineMode])

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Sin Conexión</span>
      </div>
    </div>
  )
}

// Componente para mostrar estado de sincronización
export function SyncIndicator() {
  const { isOnline } = useOffline()
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (isOnline) {
      setIsVisible(true)
      const timer = setTimeout(() => setIsVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-success-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Sincronizando...</span>
      </div>
    </div>
  )
}

// Componente para mostrar funcionalidades offline disponibles
export function OfflineFeatures() {
  const { isOffline } = useOffline()

  if (!isOffline) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Modo Offline Activo
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Funcionalidades disponibles sin conexión:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Ver maquinarias registradas</li>
              <li>Consultar órdenes de trabajo</li>
              <li>Revisar mantenimientos programados</li>
              <li>Acceder a reportes guardados</li>
              <li>Crear nuevas entradas (se sincronizarán cuando vuelva la conexión)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
