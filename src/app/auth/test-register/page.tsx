'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function TestRegisterPage() {
    const [status, setStatus] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setLoading(true)
        setStatus('')

        try {
            // Intentar registrar el usuario de prueba
            const { data, error } = await supabase.auth.signUp({
                email: 'ignacio.lpkz@gmail.com',
                password: 'TempPassword123!', // Contraseña temporal
                options: {
                    data: {
                        full_name: 'Ignacio Test',
                        role: 'administrador', // Intentar asignar rol admin
                    },
                },
            })

            if (error) {
                setStatus(`Error: ${error.message}`)
            } else if (data.user) {
                if (data.user.identities?.length === 0) {
                    setStatus('El usuario ya existe. Intenta recuperar la contraseña ahora.')
                } else {
                    setStatus('¡Usuario creado exitosamente! Revisa tu correo para confirmar la cuenta (si es necesario) y luego intenta recuperar la contraseña.')
                }
            }
        } catch (e: any) {
            setStatus(`Error inesperado: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Crear Usuario de Prueba</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Esta página permite crear el usuario <strong>ignacio.lpkz@gmail.com</strong> en Supabase para probar el flujo de recuperación de contraseña.
                    </p>

                    <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-800">
                        <strong>Nota:</strong> Si el registro es exitoso, Supabase podría enviar un correo de confirmación antes de permitir el restablecimiento de contraseña.
                    </div>

                    <Button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </Button>

                    {status && (
                        <div className={`p-4 rounded-md text-sm ${status.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {status}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
