'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Logo } from '@/components/layout/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const savedEmail = localStorage.getItem('futamaq_saved_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        toast.error('Error al iniciar sesión: ' + error.message)
      } else {
        toast.success('¡Bienvenido a FUTAMAQ!')

        // Manejar "Recordarme"
        if (rememberMe) {
          localStorage.setItem('futamaq_saved_email', email)
        } else {
          localStorage.removeItem('futamaq_saved_email')
        }

        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      }
    } catch (error) {
      toast.error('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo FUTAMAQ mejorado */}
        <div className="flex justify-center mb-8">
          <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-200/50">
            <Logo
              variant="dark"
              size="lg"
              showText={true}
            />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-bold text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-lg text-gray-600">
          Accede a tu sistema de gestión agrícola
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="modern" className="shadow-2xl">
          <CardHeader variant="gradient">
            <CardTitle variant="gradient" className="text-center text-xl">
              Acceso al Sistema
            </CardTitle>
          </CardHeader>
          <CardContent padding="lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-modern w-full"
                    placeholder="usuario@futamaq.cl"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern w-full pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              {/* "Create Account" option removed as per requirements. Admin manages users internally. */}
            </div>
          </CardContent>
        </Card>

        {/* Información de contacto mejorada */}
        <div className="mt-8 text-center">
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
            <p className="text-sm text-gray-700 font-medium">
              ¿Necesitas ayuda? Contacta a{' '}
              <a href="mailto:soporte@futamaq.cl" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200">
                soporte@futamaq.cl
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
