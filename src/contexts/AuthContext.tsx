'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string
  role: 'administrador' | 'operador' | 'cliente' | 'mecanico' | 'trabajador'
  is_active: boolean
  created_at: string
  last_login: string
  avatar_url?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string, role?: 'administrador' | 'operador' | 'cliente' | 'mecanico' | 'trabajador') => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateUser: (data: { full_name?: string; role?: 'administrador' | 'operador' | 'cliente' | 'mecanico' | 'trabajador'; avatar_url?: string | null }) => Promise<{ error: any }>
  updateAvatar: (avatarUrl: string | null) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 1. Obtener la sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const userData = mapSupabaseUser(session.user)
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // 2. Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth State Change:', _event)

      if (session?.user) {
        const userData = mapSupabaseUser(session.user)
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Helper para mapear usuario de Supabase a nuestra interfaz User
  const mapSupabaseUser = (supabaseUser: any): User => {
    const metadata = supabaseUser.user_metadata || {}
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      full_name: metadata.full_name || 'Usuario',
      role: metadata.role || 'operador', // Default role
      is_active: true, // Asumimos activo si tiene sesión
      created_at: supabaseUser.created_at,
      last_login: supabaseUser.last_sign_in_at || new Date().toISOString(),
      avatar_url: metadata.avatar_url || null
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      return { error }
    }

    // El estado del usuario se actualizará automáticamente gracias al listener onAuthStateChange
    setLoading(false)
    return { error: null }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'administrador' | 'operador' | 'cliente' | 'mecanico' | 'trabajador' = 'operador') => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (error) {
      setLoading(false)
      return { error }
    }

    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateUser = async (data: { full_name?: string; role?: 'administrador' | 'operador' | 'cliente' | 'mecanico' | 'trabajador'; avatar_url?: string | null }) => {
    if (!user) return { error: { message: 'No hay usuario autenticado' } }

    const { error } = await supabase.auth.updateUser({
      data: {
        ...data
      }
    })

    if (error) {
      return { error }
    }

    // 2. Sincronizar con la tabla pública 'users'
    try {
      await supabase
        .from('users')
        .update({
          full_name: data.full_name,
          role: data.role,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    } catch (syncError) {
      console.error('Error syncing profile to public table:', syncError)
      // No bloqueamos el retorno porque el update en Auth ya fue exitoso
    }

    // Actualizamos el estado local inmediatamente para una UI reactiva
    // aunque onAuthStateChange también debería dispararse
    setUser(prev => prev ? {
      ...prev,
      ...data,
      ...(data.full_name && { full_name: data.full_name }),
      ...(data.role && { role: data.role }),
      ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url })
    } : null)

    return { error: null }
  }

  const updateAvatar = async (avatarUrl: string | null) => {
    await updateUser({ avatar_url: avatarUrl })
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    updateAvatar
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

