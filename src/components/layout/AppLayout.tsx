'use client'

import { useState } from 'react'
import {
  Home, ClipboardList, Truck, Wrench, Fuel, Package,
  BarChart3, Users, Settings, Bell, Search, Menu, X, LogOut, Activity,
  AlertTriangle, Briefcase, Layers, PieChart, Shield, Tractor
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import MobileNavigation from '@/components/mobile/MobileNavigation'
import GlobalSearch from '@/components/search/GlobalSearch'
import { useAuth } from '@/contexts/AuthContext'
import { useApp } from '@/contexts/AppContext'
import { BRANDING } from '@/lib/branding'

const navigationGroups = [
  {
    title: 'OPERACIÓN',
    icon: Briefcase,
    items: [
      { name: 'Inicio', href: '/dashboard', icon: Home },
      { name: 'Órdenes de Trabajo', href: '/ordenes-trabajo', icon: ClipboardList },
      { name: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
    ]
  },
  {
    title: 'FLOTA',
    icon: Tractor,
    items: [
      { name: 'Maquinarias', href: '/maquinarias', icon: Truck },
      { name: 'Mantenimientos', href: '/mantenimientos', icon: Wrench },
      { name: 'Combustible', href: '/combustible', icon: Fuel },
    ]
  },
  {
    title: 'INVENTARIO',
    icon: Layers,
    items: [
      { name: 'Repuestos', href: '/repuestos', icon: Package },
    ]
  },
  {
    title: 'ANÁLISIS',
    icon: PieChart,
    items: [
      { name: 'Reportes', href: '/reportes', icon: BarChart3 },
      { name: 'Análisis', href: '/analisis', icon: Activity },
    ]
  },
  {
    title: 'ADMINISTRACIÓN',
    icon: Shield,
    items: [
      { name: 'Usuarios', href: '/usuarios', icon: Users },
      { name: 'Notificaciones', href: '/notificaciones', icon: Bell },
      { name: 'Configuración', href: '/configuracion', icon: Settings },
    ]
  }
]

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const { notifications, markNotificationAsRead, clearNotifications } = useApp()

  // No mostrar el layout en páginas de autenticación
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return <>{children}</>
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!loading && !user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  // Si aún está cargando o no hay usuario, no renderizar el layout
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-50">
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
          <SidebarContent pathname={pathname} user={user} signOut={signOut} />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent pathname={pathname} user={user} signOut={signOut} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Barra superior */}
        <div className="px-6 py-4 w-full">
          {/* Header principal con logo FUTAMAQ extendido */}
          <div className="bg-gradient-primary rounded-2xl shadow-xl border border-primary-200/50 px-8 py-6 mb-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {/* Logo y título extendido */}
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm relative h-16 w-16 overflow-hidden">
                    <Image
                      src={BRANDING.logoPath}
                      alt={`${BRANDING.appName} Logo`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{BRANDING.appName.toUpperCase()}</h1>
                    <p className="text-primary-100 text-lg">{BRANDING.systemName}</p>
                  </div>
                </div>

                {/* Buscador */}
                <div className="hidden md:block ml-8">
                  <GlobalSearch />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <Bell className="h-6 w-6" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse border-2 border-primary-600">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de Notificaciones */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 z-50 origin-top-right">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                        {notifications.filter(n => !n.read).length > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                            {notifications.filter(n => !n.read).length} nuevas
                          </span>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No tienes notificaciones</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                markNotificationAsRead(notification.id)
                                setShowNotifications(false)
                                if (notification.link) {
                                  // Use standard navigation since useRouter might need import check
                                  window.location.href = notification.link
                                }
                              }}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/60' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-blue-700' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                  {new Date(notification.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                          <button
                            onClick={() => {
                              clearNotifications()
                              setShowNotifications(false)
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium w-full py-1"
                          >
                            Limpiar todas
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Link href="/perfil" className="flex items-center space-x-3 text-white hover:opacity-90 transition-opacity">
                  <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block text-lg font-semibold truncate max-w-[150px]">
                    {user?.full_name || 'Usuario'}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Navegación móvil */}
      <MobileNavigation />
    </div>
  )
}

function SidebarContent({ pathname, user, signOut }: { pathname: string, user: any, signOut: any }) {
  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-lg border-r border-gray-200/50 shadow-xl overflow-y-auto">
      {/* Navegación Agrupada */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <div className="flex items-center px-4 mb-3 text-gray-400">
              <group.icon className="w-4 h-4 mr-2" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                {group.title}
              </h3>
            </div>
            <div className="space-y-1 ml-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-gradient-primary text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600 hover:shadow-sm'
                      }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'animate-pulse' : 'group-hover:scale-110'
                        }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Usuario */}
      <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.full_name || 'Administrador'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'admin@futamaq.cl'}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Cerrar Sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
