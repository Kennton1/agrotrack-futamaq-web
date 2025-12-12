'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DebugPage() {
  const { user, loading } = useAuth()
  
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Debug - Estado de Autenticación</h1>
        
        <div className="space-y-2">
          <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
          <p><strong>User existe:</strong> {user ? 'Sí' : 'No'}</p>
          
          {user && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold">Datos del usuario:</h3>
              <p><strong>Nombre:</strong> {user.full_name || 'No disponible'}</p>
              <p><strong>Email:</strong> {user.email || 'No disponible'}</p>
              <p><strong>Rol:</strong> {user.role || 'No disponible'}</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 space-y-2">
          <a href="/login" className="block w-full bg-green-500 text-white text-center py-2 rounded hover:bg-green-600">
            Ir al Login
          </a>
          <a href="/dashboard" className="block w-full bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600">
            Ir al Dashboard
          </a>
          <a href="/" className="block w-full bg-gray-500 text-white text-center py-2 rounded hover:bg-gray-600">
            Ir al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}
















































