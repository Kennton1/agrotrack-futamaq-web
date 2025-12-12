'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function SetupInstructions() {
  const [copied, setCopied] = useState(false)

  const envContent = `# Supabase Configuration
# Obtén estos valores desde: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Company Configuration
NEXT_PUBLIC_COMPANY_NAME=FUTAMAQ`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(envContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-warning-500" />
            <CardTitle className="text-xl">Configuración Requerida</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <p className="text-warning-800">
              Para usar el sistema AgroTrack FUTAMAQ, necesitas configurar las variables de entorno de Supabase.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pasos para configurar:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Crear proyecto en Supabase</p>
                  <p className="text-sm text-gray-600">
                    Ve a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline inline-flex items-center">
                      supabase.com <ExternalLink className="h-3 w-3 ml-1" />
                    </a> y crea un nuevo proyecto
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Obtener credenciales</p>
                  <p className="text-sm text-gray-600">
                    En la configuración del proyecto, ve a Settings → API y copia:
                  </p>
                  <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
                    <li>Project URL</li>
                    <li>anon public key</li>
                    <li>service_role secret key</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Crear archivo .env.local</p>
                  <p className="text-sm text-gray-600">
                    Crea un archivo llamado <code className="bg-gray-100 px-1 rounded">.env.local</code> en la raíz del proyecto
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <p className="font-medium">Configurar variables</p>
                  <p className="text-sm text-gray-600">
                    Copia el contenido de abajo y reemplaza los valores con tus credenciales reales
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Contenido para .env.local:
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {envContent}
            </pre>
          </div>

          <div className="bg-info-50 border border-info-200 rounded-lg p-4">
            <p className="text-info-800 text-sm">
              <strong>Nota:</strong> Después de configurar las variables de entorno, reinicia el servidor de desarrollo con <code className="bg-info-100 px-1 rounded">npm run dev</code>
            </p>
          </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => window.location.href = '/demo'}
                      className="flex items-center space-x-2"
                    >
                      <span>🚀 Explorar Sistema (Modo Demo)</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/login'}
                      className="flex items-center space-x-2"
                    >
                      <span>🔐 Ir a Login</span>
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      className="flex items-center space-x-2"
                    >
                      <span>🔄 Reiniciar Aplicación</span>
                    </Button>
                  </div>
        </CardContent>
      </Card>
    </div>
  )
}
