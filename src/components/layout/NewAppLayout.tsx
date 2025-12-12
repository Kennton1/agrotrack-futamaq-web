'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Home, ClipboardList, Truck, Wrench, Fuel, Package,
  BarChart3, Bell, Search, Menu, X, LogOut, Activity, User, Edit3, ChevronDown, Settings, Users, AlertTriangle, CheckCheck, Trash2, Moon, Sun
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MobileNavigation from '@/components/mobile/MobileNavigation'
import GlobalSearch from '@/components/search/GlobalSearch'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useApp } from '@/contexts/AppContext'
import { Logo } from './Logo'

const navigation = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Órdenes de Trabajo', href: '/ordenes-trabajo', icon: ClipboardList },
  { name: 'Maquinarias', href: '/maquinarias', icon: Truck },
  { name: 'Mantenimientos', href: '/mantenimientos', icon: Wrench },
  { name: 'Combustible', href: '/combustible', icon: Fuel },
  { name: 'Repuestos', href: '/repuestos', icon: Package },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  { name: 'Análisis', href: '/analisis', icon: Activity },
  { name: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
]

interface NewAppLayoutProps {
  children: React.ReactNode
}

export default function NewAppLayout({ children }: NewAppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isInitialized, setIsInitialized] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const pathname = usePathname()
  const authContext = useAuth()
  const { notifications: contextNotifications, markNotificationAsRead } = useApp()
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const notificationsDropdownRef = useRef<HTMLDivElement>(null)

  // Sync notifications from AppContext
  useEffect(() => {
    const mappedNotifications = contextNotifications.map(n => {
      // Determine type and priority based on notification type
      let type = 'info'
      let priority = 'medium'

      if (n.type === 'fuel') {
        type = 'error'
        priority = 'critical'
      } else if (n.type === 'maintenance') {
        type = 'warning'
        priority = 'high'
      } else if (n.type === 'incident') {
        // Incidents can be critical, but let's default to info/warning styling
        // or map based on content if possible. For now, use 'warning' for visibility.
        type = 'warning'
        priority = 'high'
      }

      return {
        id: n.id,
        title: n.title,
        message: n.message,
        isRead: n.read || false,
        createdAt: n.timestamp,
        type,
        category: n.type,
        priority,
        actionUrl: n.link,
        actionRequired: true
      }
    })
    setNotifications(mappedNotifications)
  }, [contextNotifications])

  // Load theme from localStorage or default to dark
  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyTheme = () => {
      // Siempre leer de localStorage primero para mantener la persistencia
      const storedTheme = localStorage.getItem('theme')
      if (storedTheme === 'light' || storedTheme === 'dark') {
        // Aplicar el tema guardado inmediatamente
        setTheme(storedTheme)
        document.documentElement.setAttribute('data-theme', storedTheme)
      } else {
        // Si no hay tema guardado, usar modo oscuro por defecto
        const defaultTheme: 'light' | 'dark' = 'dark'
        setTheme(defaultTheme)
        document.documentElement.setAttribute('data-theme', defaultTheme)
        localStorage.setItem('theme', defaultTheme)
      }
      setIsInitialized(true)
    }

    // Aplicar tema inmediatamente
    applyTheme()

    // Escuchar cambios en el atributo data-theme (por si se cambia desde otro lugar)
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme')
      if (currentTheme === 'light' || currentTheme === 'dark') {
        setTheme(currentTheme as 'light' | 'dark')
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    // Escuchar eventos de navegación para asegurar que el tema se mantenga
    const handleRouteChange = () => {
      applyTheme()
    }

    // Aplicar tema cuando la página se vuelve visible (útil para navegación del lado del cliente)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        applyTheme()
      }
    })

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleRouteChange)
    }
  }, [])

  // Sync theme changes to localStorage and html attribute
  // Este efecto asegura que cualquier cambio manual del tema se persista
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return
    // Aplicar el tema al DOM
    document.documentElement.setAttribute('data-theme', theme)
    // Guardar en localStorage para persistencia entre navegaciones
    localStorage.setItem('theme', theme)
  }, [theme, isInitialized])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }))
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const deleteAllNotifications = () => {
    setNotifications([])
    localStorage.setItem('notifications', JSON.stringify([]))
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Hoy'
    if (days === 1) return 'Hace 1 día'
    return `Hace ${days} días`
  }

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setNotificationsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const { user, loading, signOut } = authContext || {}

  // Redirigir al login si no está autenticado (solo en cliente y después de verificar)
  useEffect(() => {
    // Solo ejecutar en el cliente y después de que la carga haya terminado
    if (typeof window === 'undefined') return

    // Si aún está cargando, no hacer nada
    if (loading) return

    // Si no hay usuario y no estamos en una página de autenticación, redirigir
    if (!user) {
      const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/'
      if (!isAuthPage) {
        // Usar router.push en lugar de window.location para evitar recargas
        window.location.href = '/login'
      }
    }
  }, [loading, user, pathname])

  // No mostrar el layout en páginas de autenticación
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return <>{children}</>
  }

  // Verificar si el contexto está disponible
  if (!authContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    )
  }

  // Determinar si estamos en una página de autenticación
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/'

  // Si hay usuario, mostrar el layout sin importar el estado de loading
  // Esto evita bloqueos cuando el usuario ya está autenticado
  if (user) {
    // Continuar con el renderizado normal del layout
  } else if (isAuthPage) {
    // Si estamos en página de auth, mostrar contenido
  } else if (loading) {
    // Solo mostrar loading si no hay usuario y está cargando
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  } else {
    // Si no hay usuario y no está cargando, redirigir
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  // Si llegamos aquí, hay usuario O estamos en página de auth, mostrar el layout normal
  return (
    <div className="app w-screen overflow-hidden relative">
      {/* Header fijo mejorado */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 shadow-2xl border-b border-slate-200/50 backdrop-blur-lg">
        <div className="w-full max-w-[1920px] mx-auto">
          <div className="flex items-center h-20 px-4 sm:px-6 lg:px-8">
            {/* Logo y botón Menú */}
            <div className="flex items-center">
              {/* Botón Menú Hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all duration-300 mr-4"
              >
                <Menu className="h-5 w-5" />
                <span className="font-medium text-sm text-white">Menú</span>
              </button>

              <div className="flex items-center">
                <Logo
                  variant="light"
                  size="md"
                  showText={true}
                  href="/dashboard"
                />
              </div>
            </div>

            {/* Buscador centrado estilo YouTube */}
            <div className="hidden md:block flex-1 flex justify-center px-8">
              <GlobalSearch />
            </div>

            <div className="navbar__right space-x-4">
              {/* Notificaciones con dropdown */}
              <div className="relative" ref={notificationsDropdownRef}>
                <button
                  onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                  className="relative p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 shadow-lg"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-danger rounded-full">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {/* Dropdown de Notificaciones */}
                {notificationsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-[420px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                      <p className="text-base font-semibold text-gray-900 dark:text-white">Notificaciones</p>
                      <div className="flex items-center space-x-2">
                        {notifications.filter(n => !n.isRead).length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
                          >
                            <CheckCheck className="h-4 w-4" />
                            <span>Marcar todas</span>
                          </button>
                        )}
                        <button
                          onClick={() => setNotificationsDropdownOpen(false)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
                        >
                          <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Contenido de notificaciones */}
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                          <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No hay notificaciones</p>
                        </div>
                      ) : (
                        <>
                          {/* Notificaciones Importantes */}
                          {notifications.filter(n => n.type === 'error' || n.type === 'warning').length > 0 && (
                            <div className="px-4 py-2">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
                                IMPORTANTE
                              </p>
                              <div className="space-y-1">
                                {notifications
                                  .filter(n => n.type === 'error' || n.type === 'warning')
                                  .map((notification) => (
                                    <button
                                      key={notification.id}
                                      onClick={() => {
                                        markNotificationAsRead(notification.id)
                                        if (notification.actionUrl) {
                                          window.location.href = notification.actionUrl
                                        }
                                        setNotificationsDropdownOpen(false)
                                      }}
                                      className="w-full text-left px-3 py-3 text-sm transition-all duration-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                                    >
                                      <div className="flex items-start space-x-3">
                                        <div className={`mt-0.5 flex-shrink-0 ${notification.type === 'error' ? 'text-red-500' :
                                          notification.type === 'warning' ? 'text-yellow-500' :
                                            'text-blue-500'
                                          }`}>
                                          <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                                            {notification.title}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                            {notification.message}
                                          </p>
                                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                                            {formatTimeAgo(notification.createdAt)}
                                          </p>
                                        </div>
                                        {!notification.isRead && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Más Notificaciones */}
                          {notifications.filter(n => n.type !== 'error' && n.type !== 'warning').length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
                                {notifications.filter(n => n.type === 'error' || n.type === 'warning').length > 0
                                  ? 'MÁS NOTIFICACIONES'
                                  : 'NOTIFICACIONES'}
                              </p>
                              <div className="space-y-1">
                                {notifications
                                  .filter(n => n.type !== 'error' && n.type !== 'warning')
                                  .map((notification) => (
                                    <button
                                      key={notification.id}
                                      onClick={() => {
                                        markNotificationAsRead(notification.id)
                                        if (notification.actionUrl) {
                                          window.location.href = notification.actionUrl
                                        }
                                        setNotificationsDropdownOpen(false)
                                      }}
                                      className={`w-full text-left px-3 py-3 text-sm transition-all duration-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                                        }`}
                                    >
                                      <div className="flex items-start space-x-3">
                                        <div className={`mt-0.5 flex-shrink-0 ${notification.type === 'success' ? 'text-green-500' :
                                          notification.type === 'info' ? 'text-blue-500' :
                                            'text-gray-500 dark:text-gray-400'
                                          }`}>
                                          <Bell className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                            {notification.title}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                            {notification.message}
                                          </p>
                                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                                            {formatTimeAgo(notification.createdAt)}
                                          </p>
                                        </div>
                                        {!notification.isRead && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                        <Link href="/notificaciones">
                          <button
                            onClick={() => setNotificationsDropdownOpen(false)}
                            className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                          >
                            Ver todas las notificaciones
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mi Perfil Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 text-white hover:bg-white/10 rounded-xl px-4 py-2 transition-all duration-300 shadow-lg"
                >
                  <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-white">{user?.full_name || 'Mi Perfil'}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu mejorado */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 animate-slideIn">
                    <div className="px-4 py-3 border-b border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-700 dark:to-gray-700 rounded-t-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user?.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.full_name || 'Mi Perfil'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email || 'admin@futamaq.cl'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link href="/perfil" className="block">
                        <button
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-white flex items-center space-x-3 transition-all duration-300 rounded-lg mx-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span className="font-medium">Editar Perfil</span>
                        </button>
                      </Link>
                      <Link href="/configuracion" className="block">
                        <button
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-white flex items-center space-x-3 transition-all duration-300 rounded-lg mx-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="font-medium">Configuración</span>
                        </button>
                      </Link>
                      <Link href="/gestion-usuarios" className="block">
                        <button
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-white flex items-center space-x-3 transition-all duration-300 rounded-lg mx-2"
                        >
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Gestionar Usuarios</span>
                        </button>
                      </Link>
                    </div>

                    {/* Toggle de tema */}
                    <div className="border-t border-gray-100/50 dark:border-gray-700/50 py-1">
                      <button
                        onClick={() => {
                          toggleTheme()
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-white flex items-center justify-between transition-all duration-300 rounded-lg mx-2"
                      >
                        <div className="flex items-center space-x-3">
                          {theme === 'light' ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                          </span>
                        </div>
                        {/* Switch */}
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-500' : 'bg-gray-300'
                          }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-gray-100/50 dark:border-gray-700/50 py-1">
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center space-x-3 transition-all duration-300 rounded-lg mx-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-lg shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} pathname={pathname} />
        </div>
      </div>

      {/* Contenedor principal con ancho máximo fijo para mantener tamaño independiente del zoom */}
      <div className="w-full max-w-[1920px] mx-auto flex flex-1 overflow-hidden relative">
        {/* Sidebar - Se desliza desde la izquierda y empuja el contenido */}
        <div className={`sidebar flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'w-64' : 'w-0'
          }`}>
          <div className={`flex-1 pt-20 overflow-y-auto transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}>
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <SidebarContent navigation={navigation} pathname={pathname} />
          </div>
        </div>

        {/* Contenido principal - Se ajusta automáticamente */}
        <div className="flex-1 overflow-hidden flex flex-col pt-20 min-w-0 transition-all duration-300">
          {/* Contenido */}
          <main className="flex-1 overflow-y-auto w-full min-h-0">
            <div className="min-h-full pb-0">
              {children}
            </div>
            {/* Footer - Siempre al final del contenido */}
            <div className="mt-8">
              <Footer />
            </div>
          </main>

          <MobileNavigation />
        </div>
      </div>
    </div>
  )
}

function SidebarContent({
  navigation,
  pathname
}: {
  navigation: any[],
  pathname: string
}) {
  return (
    <div className="sidebar">
      {/* Navegación mejorada */}
      <nav className="flex-1 px-4 py-6 space-y-2 pt-8">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar__item ${isActive
                ? 'sidebar__item--active'
                : 'hover:bg-white/10 hover:border-white/20 hover:text-white group-hover:text-white'
                }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-all duration-300 ${isActive
                  ? 'text-gray-900 dark:text-white animate-pulse'
                  : 'text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white'
                  }`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}



