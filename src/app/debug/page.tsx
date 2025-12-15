'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
  const { user, loading } = useAuth()
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Comprobando...')
  const [envStatus, setEnvStatus] = useState<any>({})
  const [tableCounts, setTableCounts] = useState<any>({})

  useEffect(() => {
    checkSystem()
  }, [])

  const checkSystem = async () => {
    // Check Env Vars
    const envs = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
    setEnvStatus(envs)

    // Check Supabase Connection & Counts
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setSupabaseStatus('Error: Faltan variables de entorno')
        return
      }

      const tables = ['users', 'clients', 'machinery', 'work_orders']
      const counts: any = {}

      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          counts[table] = `Error: ${error.message}`
        } else {
          counts[table] = count
        }
      }

      setTableCounts(counts)
      setSupabaseStatus('Conectado correctamente')
    } catch (error: any) {
      setSupabaseStatus(`Error de conexión: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Panel de Diagnóstico</h1>

          {/* Autenticación */}
          <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
            <h2 className="text-lg font-semibold mb-2">1. Estado de Autenticación</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
              <p><strong>Usuario Autenticado:</strong> {user ? 'Sí' : 'No'}</p>
              {user && (
                <div className="pl-4 border-l-2 border-blue-300 mt-2">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Rol:</strong> {user.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Variables de Entorno */}
          <div className="mb-6 p-4 bg-yellow-50 rounded border border-yellow-200">
            <h2 className="text-lg font-semibold mb-2">2. Variables de Entorno</h2>
            <div className="space-y-1 text-sm">
              <p>
                <strong>URL:</strong> {' '}
                {envStatus.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Faltante'}
                <span className="text-xs text-gray-500 ml-2">({process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15)}...)</span>
              </p>
              <p>
                <strong>ANON KEY:</strong> {' '}
                {envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Faltante'}
                <span className="text-xs text-gray-500 ml-2">({process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}...)</span>
              </p>
            </div>
          </div>

          {/* Estado de Supabase */}
          <div className="mb-6 p-4 bg-green-50 rounded border border-green-200">
            <h2 className="text-lg font-semibold mb-2">3. Conexión a Base de Datos</h2>
            <p className="font-medium mb-3">Estado: <span className={supabaseStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}>{supabaseStatus}</span></p>

            <h3 className="font-semibold text-sm mb-2">Registros en Tablas:</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(tableCounts).map(([table, count]) => (
                <div key={table} className="bg-white p-3 rounded border">
                  <span className="block text-xs font-bold uppercase text-gray-500">{table}</span>
                  <span className="text-lg font-mono">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4 pt-4 border-t">
            <a href="/login" className="flex-1 bg-gray-600 text-white text-center py-2 rounded hover:bg-gray-700 transition">
              Ir al Login
            </a>
            <a href="/dashboard" className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition">
              Ir al Dashboard
            </a>
            <button onClick={checkSystem} className="flex-1 bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition">
              Re-scanear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
















































