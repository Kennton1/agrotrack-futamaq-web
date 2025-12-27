'use client'

import { useRouter } from 'next/navigation'
import { Truck, Mail, Phone, MapPin } from 'lucide-react'
import { BRANDING } from '@/lib/branding'

export default function Footer() {
  const router = useRouter()

  return (
    <footer className="bg-slate-900 border-t border-slate-700 w-full text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Contenido principal del footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Logo y copyright */}
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-gradient-to-r from-slate-600 to-slate-700 rounded">
              <Truck className="h-3 w-3 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{BRANDING.appName.toUpperCase()}</h3>
              <p className="text-xs text-gray-400">{BRANDING.systemName}</p>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xs text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/ordenes-trabajo')}
              className="text-xs text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Órdenes
            </button>
            <button
              onClick={() => router.push('/maquinarias')}
              className="text-xs text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Maquinarias
            </button>
            <button
              onClick={() => router.push('/mantenimientos')}
              className="text-xs text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Mantenimientos
            </button>
            <button
              onClick={() => router.push('/reportes')}
              className="text-xs text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Reportes
            </button>
          </div>

          {/* Copyright y enlaces legales */}
          <div className="flex items-center space-x-4">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} {BRANDING.companyName}
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors duration-200">Privacidad</a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors duration-200">Términos</a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors duration-200">Soporte</a>
            </div>
          </div>
        </div>
      </div>
    </footer >
  )
}
