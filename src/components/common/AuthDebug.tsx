'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Componente de debug temporal para diagnosticar el problema
export function AuthDebug() {
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log('🔍 AuthDebug - Estado actual:', {
      user: user ? { email: user.email, role: user.role } : null,
      loading,
      timestamp: new Date().toISOString()
    })

    // Verificar localStorage directamente
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('futamaq-user')
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          console.log('🔍 AuthDebug - localStorage tiene usuario:', {
            email: parsed.email,
            role: parsed.role
          })
        } else {
          console.log('⚠️ AuthDebug - localStorage NO tiene usuario guardado')
        }
      } catch (error) {
        console.error('❌ AuthDebug - Error al leer localStorage:', error)
      }
    }
  }, [user, loading])

  // No renderizar nada, solo para debugging
  return null
}

