'use client'
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

export default function TestPage() {
    const [status, setStatus] = useState('Iniciando...')
    const [envInfo, setEnvInfo] = useState<any>({})
    const [response, setResponse] = useState<any>(null)

    useEffect(() => {
        const runTest = async () => {
            try {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING'
                const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING'

                // Análisis de caracteres invisibles
                const keyHasNewline = key.includes('\n')
                const keyHasSpace = key.includes(' ')
                const keyLength = key.length

                setEnvInfo({
                    url,
                    keyStart: key.substring(0, 10),
                    keyEnd: key.substring(key.length - 10),
                    keyLength,
                    hasNewline: keyHasNewline,
                    hasSpace: keyHasSpace,
                    // Códigos ASCII de los últimos 5 caracteres para detectar basura oculta
                    lastCharCodes: key.split('').map(c => c.charCodeAt(0)).slice(-5)
                })

                const client = createClient(url, key)
                const { data, error } = await client.from('users').select('*').limit(1)

                setResponse({ data, error })
                setStatus('Completado')
            } catch (err: any) {
                setResponse({ exception: err.message, stack: err.stack })
                setStatus('Error crítico')
            }
        }

        runTest()
    }, [])

    return (
        <div className="p-8 font-mono text-sm overflow-auto h-screen bg-gray-900 text-green-400">
            <h1 className="text-2xl font-bold mb-6 border-b border-green-600 pb-2">Diagnóstico de Conexión Supabase</h1>

            <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">1. Variables de Entorno (Análisis Profundo)</h2>
                <pre className="bg-gray-800 p-4 rounded border border-gray-700 whitespace-pre-wrap word-break">
                    {JSON.stringify(envInfo, null, 2)}
                </pre>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">2. Respuesta de la API</h2>
                <pre className="bg-gray-800 p-4 rounded border border-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(response, null, 2)}
                </pre>
            </div>

            <div>
                <h2 className="text-xl font-bold text-white mb-2">Estado General: {status}</h2>
            </div>
        </div>
    )
}
