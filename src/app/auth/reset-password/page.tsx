'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Correct import for App Router
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Verificar si hay una sesión activa.
        // Al hacer clic en el enlace del correo, Supabase debería establecer la sesión.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // Si no hay sesión, es posible que el link haya expirado o sea inválido.
                // Sin embargo, a veces el hash tarda un momento en procesarse.
                // Podríamos redirigir al login si no detectamos sesión tras un breve tiempo,
                // Pero por ahora dejaremos que el usuario intente.
                // setError('No se detectó una sesión válida. El enlace puede haber expirado.')
            }
        }
        checkSession()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                throw error
            }

            setSuccess(true)

            // Redirigir al inicio después de unos segundos
            setTimeout(() => {
                router.push('/')
            }, 3000)

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al actualizar la contraseña')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo variant="dark" size="lg" showText={true} />
                </div>

                {!success ? (
                    <>
                        <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                            Restablecer Contraseña
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Ingresa tu nueva contraseña a continuación.
                        </p>
                    </>
                ) : (
                    <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                        ¡Contraseña Actualizada!
                    </h2>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card variant="modern" className="shadow-2xl">
                    <CardContent padding="lg">
                        {!success ? (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nueva Contraseña
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input-modern w-full pl-10 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input-modern w-full pl-10"
                                            placeholder="••••••••"
                                        />
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
                                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-4">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Contraseña restablecida exitosamente</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Ahora puedes iniciar sesión con tu nueva contraseña.
                                    <br />
                                    Redirigiendo al inicio...
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
