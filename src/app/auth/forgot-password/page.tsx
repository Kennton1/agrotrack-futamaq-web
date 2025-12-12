'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) {
                throw error
            }

            setSubmitted(true)
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al intentar enviar el correo.')
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

                {!submitted ? (
                    <>
                        <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                            Recuperar Contraseña
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    </>
                ) : (
                    <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                        ¡Correo Enviado!
                    </h2>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card variant="modern" className="shadow-2xl">
                    <CardContent padding="lg">
                        {!submitted ? (
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
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Correo Electrónico
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-modern w-full pl-10"
                                            placeholder="ejemplo@futamaq.cl"
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
                                        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-4">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Revisa tu bandeja de entrada</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
                                    Sigue las instrucciones para restablecer tu contraseña.
                                </p>
                                <div className="bg-blue-50 p-4 rounded-md mb-6 text-left">
                                    <p className="text-xs text-blue-700">
                                        <strong>Nota:</strong> Si no encuentras el correo, revisa tu carpeta de Spam o Correo no deseado.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <Button
                                variant="ghost"
                                className="w-full flex items-center justify-center gap-2"
                                onClick={() => router.push('/login')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver al inicio de sesión
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
