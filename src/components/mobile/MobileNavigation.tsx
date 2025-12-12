'use client'

import React, { useState } from 'react'
import { useMobile } from '@/hooks/useMobile'
import { Button } from '@/components/ui/Button'
import { 
  Home, ClipboardList, Truck, Wrench, Fuel, Package,
  BarChart3, Users, Settings, Bell, Activity, Menu, X, User
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Órdenes', href: '/ordenes-trabajo', icon: ClipboardList },
  { name: 'Maquinarias', href: '/maquinarias', icon: Truck },
  { name: 'Mantenimientos', href: '/mantenimientos', icon: Wrench },
  { name: 'Combustible', href: '/combustible', icon: Fuel },
  { name: 'Repuestos', href: '/repuestos', icon: Package },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  { name: 'Análisis', href: '/analisis', icon: Activity },
  { name: 'Notificaciones', href: '/notificaciones', icon: Bell },
]

export default function MobileNavigation() {
  const { isMobile, isTablet } = useMobile()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  if (!isMobile && !isTablet) {
    return null
  }

  return (
    <>
      {/* Botón de menú flotante */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg bg-gradient-primary hover:scale-110 transition-transform"
          size="lg"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menú deslizable */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="p-4">
          {/* Header del menú */}
          <div className="flex items-center justify-between mb-6 px-2">
            <Logo 
              variant="dark" 
              size="sm" 
              showText={true}
              href="/dashboard"
              className="flex-row items-center space-x-2"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navegación principal */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {navigation.slice(0, 8).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex flex-col items-center p-4 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-primary text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium text-center">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Navegación secundaria */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-3 gap-3">
              {navigation.slice(8).map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex flex-col items-center p-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-primary text-white' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium text-center">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Información del usuario */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center overflow-hidden">
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
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.full_name || 'Administrador FUTAMAQ'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@futamaq.cl'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Componente de tabs móviles
export function MobileTabs({ 
  tabs, 
  activeTab, 
  onTabChange 
}: {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>
  activeTab: string
  onTabChange: (tabId: string) => void
}) {
  const { isMobile } = useMobile()

  if (!isMobile) {
    return null
  }

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
            ${activeTab === tab.id
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}


