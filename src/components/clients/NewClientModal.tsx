import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'react-hot-toast'
import { Loader2, X, Users } from 'lucide-react'

interface NewClientModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (clientId: number) => void
}

export default function NewClientModal({ isOpen, onClose, onSuccess }: NewClientModalProps) {
    const { addClient } = useApp()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        rut: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
    })

    // Close if not open
    if (!isOpen) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.rut) {
            toast.error('El nombre y el RUT son obligatorios')
            return
        }

        setLoading(true)
        try {
            const newClient = await addClient({
                name: formData.name,
                rut: formData.rut,
                contact_person: formData.contact_person,
                phone: formData.phone,
                email: formData.email,
                address: formData.address
            })

            setFormData({
                name: '',
                rut: '',
                contact_person: '',
                phone: '',
                email: '',
                address: ''
            })

            if (newClient) {
                onSuccess?.(newClient.id)
                onClose()
            }

        } catch (error) {
            console.error(error)
            toast.error('Error al crear el cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Nuevo Cliente</h2>
                                <p className="text-blue-100 text-sm">Registrar un nuevo cliente en el sistema</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre / Razón Social *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej: Agrícola Ltda."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rut">RUT *</Label>
                                <Input
                                    id="rut"
                                    name="rut"
                                    value={formData.rut}
                                    onChange={handleChange}
                                    placeholder="Ej: 76.123.456-K"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_person">Persona de Contacto</Label>
                            <Input
                                id="contact_person"
                                name="contact_person"
                                value={formData.contact_person}
                                onChange={handleChange}
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+56 9 ..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contacto@empresa.cl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Ej: Ruta 5 Sur Km 20"
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Registrar Cliente'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
