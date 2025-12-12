'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function PerfilPage() {
  const { user, updateUser, updateAvatar, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null)
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    role: user?.role || 'Operador',
    department: '',
    address: '',
    bio: '',
    password: '',
    confirmPassword: ''
  })

  // Cargar avatar del usuario al montar
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url)
    } else if (user && !user.avatar_url) {
      // Solo establecer null si el usuario existe pero no tiene avatar
      setAvatarUrl(null)
    }
  }, [user?.id]) // Solo actualizar cuando cambia el usuario, no cuando cambia el avatar_url

  // Cargar datos del usuario al montar
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        email: user.email || prev.email,
        role: user.role || prev.role
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Función para comprimir imagen
  const compressImage = (file: File, maxWidth: number = 400, maxSizeKB: number = 200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          let targetWidth = img.width
          let targetHeight = img.height

          // Redimensionar si es necesario
          if (targetWidth > maxWidth) {
            targetHeight = Math.round((targetHeight * maxWidth) / targetWidth)
            targetWidth = maxWidth
          }

          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No se pudo crear el contexto del canvas'))
            return
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          // Intentar diferentes niveles de calidad hasta conseguir el tamaño deseado
          let quality = 0.8
          let compressedBase64 = ''
          let base64Size = 0
          let attempts = 0
          const maxAttempts = 10
          const targetSizeBytes = maxSizeKB * 1024

          do {
            compressedBase64 = canvas.toDataURL('image/jpeg', quality)
            base64Size = (compressedBase64.length * 3) / 4

            // Si el tamaño es aceptable, salir del bucle
            if (base64Size <= targetSizeBytes) {
              break
            }

            // Reducir calidad
            quality -= 0.1

            // Si la calidad es muy baja y aún es grande, reducir dimensiones
            if (quality < 0.5 && base64Size > targetSizeBytes && targetWidth > 200) {
              targetWidth = Math.round(targetWidth * 0.85)
              targetHeight = Math.round((img.height * targetWidth) / img.width)
              canvas.width = targetWidth
              canvas.height = targetHeight
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
              quality = 0.7 // Resetear calidad
            }

            attempts++
          } while (base64Size > targetSizeBytes && attempts < maxAttempts && quality > 0.1)

          // Si no se pudo comprimir lo suficiente, usar la última versión
          if (!compressedBase64) {
            compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
          }

          resolve(compressedBase64)
        }
        img.onerror = () => reject(new Error('Error al cargar la imagen'))
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result
        } else {
          reject(new Error('Error al leer el archivo'))
        }
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarChange = async (url: string | null) => {
    console.log('🔄 handleAvatarChange llamado con URL:', url ? `${url.substring(0, 50)}...` : 'null')

    // Actualizar el estado primero para reflejar el cambio inmediatamente
    setAvatarUrl(url)
    console.log('✅ Estado avatarUrl actualizado a:', url ? 'imagen' : 'null')

    // Guardar en el contexto y localStorage
    if (updateAvatar) {
      try {
        await updateAvatar(url)
        console.log('✅ Avatar guardado en contexto y localStorage')
        toast.success('Foto de perfil actualizada')
      } catch (error) {
        console.error('❌ Error al actualizar avatar:', error)
        toast.error('Error al actualizar la foto de perfil')
        // Revertir el cambio si hay error
        const previousAvatar = user?.avatar_url || null
        setAvatarUrl(previousAvatar)
        console.log('🔄 Avatar revertido a:', previousAvatar ? 'anterior' : 'null')
      }
    } else {
      console.warn('⚠️ updateAvatar no está disponible')
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Por favor, selecciona una imagen menor a 5MB')
      return
    }

    try {
      console.log('📸 Procesando imagen:', file.name, file.size, 'bytes')
      const compressedImage = await compressImage(file)
      console.log('✅ Imagen comprimida, tamaño:', compressedImage.length, 'caracteres')
      console.log('🔄 Actualizando avatar...')
      await handleAvatarChange(compressedImage)
      console.log('✅ Avatar actualizado')
    } catch (error) {
      console.error('❌ Error al procesar la imagen:', error)
      toast.error('Error al procesar la imagen. Por favor, intenta con otra imagen.')
    } finally {
      // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar contraseñas si se están cambiando
      if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden')
        setLoading(false)
        return
      }

      // Actualizar usuario en el contexto
      if (updateUser) {
        await updateUser({
          full_name: formData.fullName,
          avatar_url: avatarUrl
        })
      }

      toast.success('Perfil actualizado exitosamente')

      // Limpiar contraseñas
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }))
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
            <p className="text-gray-600 dark:text-gray-300">Gestiona tu información personal y configuración</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del perfil */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Departamento"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Dirección completa"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Cuéntanos sobre ti..."
                    rows={3}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Avatar y resumen - Formato Instagram */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-6">
                {/* Foto de perfil a la izquierda */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    {avatarUrl && avatarUrl.trim() !== '' ? (
                      <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                        <img
                          key={`avatar-${avatarUrl.substring(0, 30)}`}
                          src={avatarUrl}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Imagen cargada correctamente')}
                          onError={(e) => {
                            console.error('❌ Error al cargar la imagen:', e)
                            // Si hay error, mostrar placeholder
                            setAvatarUrl(null)
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center border-2 border-gray-300">
                        <User className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del usuario en el centro */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{formData.fullName}</h3>
                  <p className="text-sm text-gray-500 capitalize">{formData.role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formData.email}</p>
                </div>

                {/* Botón "Cambiar foto" a la derecha */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        document.getElementById('avatar-upload')?.click()
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Cambiar foto
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cambiar contraseña */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cambiar Contraseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Contacto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{formData.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{formData.phone}</span>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600">{formData.address}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}












































