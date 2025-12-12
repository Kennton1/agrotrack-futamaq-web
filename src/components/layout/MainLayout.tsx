'use client'

import { useState } from 'react'
import {
  Home, ClipboardList, Truck, Wrench, Fuel, Package,
  BarChart3, Users, Settings, Bell, Search, Calendar,
  Menu, X, LogOut, User, ChevronLeft, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Logo } from './Logo'

interface MainLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Órdenes de Trabajo', href: '/ordenes-trabajo', icon: ClipboardList },
  { name: 'Maquinarias', href: '/maquinarias', icon: Truck },
  { name: 'Mantenimientos', href: '/mantenimientos', icon: Wrench },
  { name: 'Combustible', href: '/combustible', icon: Fuel },
  { name: 'Repuestos', href: '/repuestos', icon: Package },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  { name: 'Usuarios', href: '/usuarios', icon: Users },
  { name: 'Mi Perfil', href: '/perfil', icon: User },
]

function SidebarContent({
  navigation,
  pathname,
  user,
  onLogout,
  collapsed = false,
  onToggleCollapse
}: {
  navigation: any[],
  pathname: string,
  user: any,
  onLogout: () => void,
  collapsed?: boolean,
  onToggleCollapse?: () => void
}) {
  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo y botón de toggle en el sidebar */}
      <div className={cn(
        "px-4 py-4 border-b border-gray-200 flex items-center transition-all duration-300",
        collapsed ? "justify-center px-2" : "justify-between"
      )}>
        {collapsed ? (
          <Logo
            variant="dark"
            size="sm"
            showText={false}
            href="/dashboard"
          />
        ) : (
          <>
            <Logo
              variant="dark"
              size="sm"
              showText={true}
              href="/dashboard"
            />
            {/* Botón de toggle prominente en el header del sidebar */}
            {onToggleCollapse && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (onToggleCollapse) {
                    onToggleCollapse()
                  }
                }}
                className="p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
                title="Colapsar sidebar"
                aria-label="Colapsar sidebar"
                type="button"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Botón de toggle adicional en la parte superior (solo cuando está colapsado) */}
      {onToggleCollapse && collapsed && (
        <div className="hidden lg:flex justify-center px-2 py-3 border-b border-gray-200">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onToggleCollapse) {
                onToggleCollapse()
              }
            }}
            className="p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow w-full flex justify-center"
            title="Expandir sidebar"
            aria-label="Expandir sidebar"
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Navegación */}
      <nav className={cn(
        "flex-1 py-4 space-y-1 transition-all duration-300",
        collapsed ? "px-2" : "px-4"
      )}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center text-sm font-medium rounded-md transition-colors',
                collapsed ? 'justify-center px-3 py-2' : 'px-3 py-2',
                isActive
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  collapsed ? '' : 'mr-3',
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className={cn(
        "border-t border-gray-200 transition-all duration-300",
        collapsed ? "p-2" : "p-4"
      )}>
        {collapsed ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                <span className="capitalize">{user?.role || 'Operador'}</span>
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState(5) // Mock
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Sesión cerrada exitosamente')
      router.push('/login')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar móvil */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} pathname={pathname} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className={cn(
        "hidden lg:flex lg:flex-shrink-0 transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex flex-col w-full">
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            user={user}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => {
              setSidebarCollapsed(prev => !prev)
            }}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Barra superior */}
        <div className="px-6 py-4">
          {/* Header principal con logo FUTAMAQ extendido */}
          <div className="bg-gradient-primary rounded-2xl shadow-xl border border-primary-200/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Primera fila: Logo y botones de acción */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 sm:p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
                  >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>

                  {/* Botón para colapsar sidebar en desktop */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSidebarCollapsed(prev => !prev)
                    }}
                    className="hidden lg:flex items-center justify-center p-2.5 sm:p-3 rounded-xl text-white/90 hover:text-white hover:bg-white/30 active:bg-white/40 transition-all duration-200 min-w-[44px] border border-white/20 hover:border-white/40 shadow-sm hover:shadow"
                    title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                    aria-label={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                    type="button"
                  >
                    {sidebarCollapsed ? (
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                  </button>

                  {/* Logo y título extendido */}
                  <Logo
                    variant="light"
                    size="md"
                    showText={true}
                    className="flex-shrink-0 flex-row items-center space-x-3"
                  />
                </div>

                {/* Botones de acción móvil */}
                <div className="flex items-center space-x-2 lg:hidden">
                  <button className="relative p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-primary-600 bg-white rounded-full">
                        {notifications}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Segunda fila: Buscador y botones de acción desktop */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                {/* Buscador */}
                <div className="hidden lg:block flex-1 max-w-xl">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                    <input
                      type="text"
                      placeholder="Buscar OT, maquinaria, cliente..."
                      className="w-full pl-12 pr-4 py-2.5 border border-white/30 bg-white/20 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 shadow-sm transition-all duration-300 hover:shadow-md text-white placeholder-white/70 text-sm"
                    />
                  </div>
                </div>

                {/* Botones de acción desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  {/* Notificaciones */}
                  <button className="relative p-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110">
                    <Bell className="h-6 w-6" />
                    {notifications > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-white rounded-full animate-pulse">
                        {notifications}
                      </span>
                    )}
                  </button>

                  {/* Calendario */}
                  <button className="p-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110">
                    <Calendar className="h-6 w-6" />
                  </button>

                  {/* Configuración */}
                  <button className="p-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110">
                    <Settings className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
