'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const [message, setMessage] = useState('Verificando autenticación...')
  const hasRedirected = useRef(false)
  const mounted = useRef(false)

  // Asegurar que solo se ejecute en el cliente
  useEffect(() => {
    mounted.current = true
  }, [])

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined' || !mounted.current) {
      return
    }

    // No hacer nada si ya redirigimos
    if (hasRedirected.current) {
      return
    }

    // Actualizar mensaje basado en el estado
    if (loading) {
      setMessage('Verificando autenticación...')
      return
    }

    // Si terminó de cargar, proceder con la redirección
    if (!loading) {
      hasRedirected.current = true
      
      if (user) {
        setMessage('Redirigiendo al dashboard...')
        // Usar window.location.href para forzar una navegación completa
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
      } else {
        setMessage('Redirigiendo al login...')
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
    }
  }, [user, loading])

  // Timeout de seguridad: si después de 3 segundos aún no se ha redirigido, forzar redirección
  useEffect(() => {
    if (typeof window === 'undefined') return

    const safetyTimeout = setTimeout(() => {
      if (!hasRedirected.current && !loading && mounted.current) {
        console.log('⏱️ Home: Timeout de seguridad, forzando redirección')
        hasRedirected.current = true
        if (user) {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/login'
        }
      }
    }, 3000)

    return () => clearTimeout(safetyTimeout)
  }, [loading, user])

  // Siempre mostrar algo para evitar pantalla en blanco
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}