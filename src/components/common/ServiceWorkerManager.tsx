'use client'

import { useEffect } from 'react'

export function ServiceWorkerManager() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1'

    // En desarrollo, desregistrar TODOS los service workers inmediatamente
    if (isDevelopment && 'serviceWorker' in navigator) {
      console.log('🔧 ServiceWorkerManager: Desregistrando service workers en desarrollo...')
      
      // Desregistrar todos los service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length > 0) {
          console.log(`🔧 Encontrados ${registrations.length} service workers, desregistrando...`)
          registrations.forEach((registration) => {
            registration.unregister().then((success) => {
              if (success) {
                console.log('✅ Service worker desregistrado:', registration.scope)
              } else {
                console.warn('⚠️ No se pudo desregistrar:', registration.scope)
              }
            })
          })
        } else {
          console.log('✅ No hay service workers registrados')
        }
      })

      // Limpiar todos los caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          if (cacheNames.length > 0) {
            console.log(`🔧 Encontrados ${cacheNames.length} caches, eliminando...`)
            cacheNames.forEach((cacheName) => {
              caches.delete(cacheName).then((success) => {
                if (success) {
                  console.log('✅ Cache eliminado:', cacheName)
                }
              })
            })
          }
        })
      }

      // Prevenir que se registren nuevos service workers en desarrollo
      const originalRegister = navigator.serviceWorker.register
      navigator.serviceWorker.register = function(...args) {
        console.warn('🚫 Bloqueado registro de service worker en desarrollo')
        return Promise.reject(new Error('Service workers deshabilitados en desarrollo'))
      }
    }
  }, [])

  return null
}

