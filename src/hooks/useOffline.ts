'use client'

import { useState, useEffect } from 'react'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setIsOfflineMode(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsOfflineMode(true)
    }

    // Verificar estado inicial
    setIsOnline(navigator.onLine)

    // Agregar listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
    isOfflineMode,
    setIsOfflineMode
  }
}

// Hook para manejar datos offline
export function useOfflineData<T>(key: string, initialData: T) {
  const [data, setData] = useState<T>(initialData)
  const [isLoaded, setIsLoaded] = useState(false)
  const { isOnline } = useOffline()

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const savedData = localStorage.getItem(`offline_${key}`)
    if (savedData) {
      try {
        setData(JSON.parse(savedData))
      } catch (error) {
        console.error('Error al cargar datos offline:', error)
      }
    }
    setIsLoaded(true)
  }, [key])

  // Guardar datos en localStorage cuando cambien
  const updateData = (newData: T) => {
    setData(newData)
    if (!isOnline) {
      localStorage.setItem(`offline_${key}`, JSON.stringify(newData))
    }
  }

  // Sincronizar datos cuando vuelva la conexión
  useEffect(() => {
    if (isOnline && isLoaded) {
      // Aquí se podría implementar la sincronización con el servidor
      console.log('Conexión restaurada, sincronizando datos...')
    }
  }, [isOnline, isLoaded])

  return {
    data,
    updateData,
    isLoaded,
    isOffline: !isOnline
  }
}

// Hook para manejar cola de sincronización
export function useSyncQueue() {
  const [queue, setQueue] = useState<any[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const { isOnline } = useOffline()

  // Agregar item a la cola
  const addToQueue = (item: any) => {
    setQueue(prev => [...prev, { ...item, id: Date.now(), timestamp: new Date().toISOString() }])
  }

  // Procesar cola cuando vuelva la conexión
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      processQueue()
    }
  }, [isOnline, queue.length, isSyncing])

  const processQueue = async () => {
    setIsSyncing(true)
    
    try {
      for (const item of queue) {
        // Aquí se implementaría la lógica de sincronización
        console.log('Sincronizando item:', item)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
      }
      
      // Limpiar cola después de sincronizar
      setQueue([])
    } catch (error) {
      console.error('Error al sincronizar cola:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    queue,
    addToQueue,
    isSyncing,
    queueLength: queue.length
  }
}



















































