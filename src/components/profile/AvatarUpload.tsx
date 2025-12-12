'use client'

import { useState, useRef } from 'react'
import { Upload, X, Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'

interface AvatarUploadProps {
  imageUrl?: string
  onChange: (imageUrl: string) => void
  error?: string
}

export function AvatarUpload({ 
  imageUrl,
  onChange,
  error
}: AvatarUploadProps) {
  
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Función para comprimir y redimensionar imágenes
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
          
          // Crear canvas para redimensionar y comprimir
          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No se pudo crear el contexto del canvas'))
            return
          }
          
          // Mejorar la calidad de renderizado
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Dibujar la imagen redimensionada
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          
          // Intentar diferentes niveles de calidad hasta conseguir el tamaño deseado
          let quality = 0.8
          let compressedBase64 = ''
          let base64Size = 0
          let attempts = 0
          const maxAttempts = 10
          
          // Reducir calidad progresivamente hasta conseguir el tamaño deseado
          while (base64Size > maxSizeKB * 1024 && attempts < maxAttempts && quality > 0.1) {
            compressedBase64 = canvas.toDataURL('image/jpeg', quality)
            base64Size = (compressedBase64.length * 3) / 4
            quality -= 0.1
            attempts++
          }
          
          resolve(compressedBase64)
        }
        img.onerror = () => reject(new Error('Error al cargar la imagen'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máximo 5MB antes de comprimir)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Por favor, selecciona una imagen menor a 5MB')
      return
    }

    setIsProcessing(true)

    try {
      const compressedImage = await compressImage(file)
      onChange(compressedImage)
    } catch (error) {
      console.error('Error al procesar la imagen:', error)
      alert('Error al procesar la imagen. Por favor, intenta con otra imagen.')
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Por favor, selecciona una imagen menor a 5MB')
      return
    }

    setIsProcessing(true)

    try {
      const compressedImage = await compressImage(file)
      onChange(compressedImage)
    } catch (error) {
      console.error('Error al procesar la imagen:', error)
      alert('Error al procesar la imagen. Por favor, intenta con otra imagen.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <Label>Foto de Perfil</Label>
      
      {/* Preview de imagen */}
      {imageUrl && (
        <div className="relative inline-block">
          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
            <img
              src={imageUrl}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            title="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload area */}
      {!imageUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-full p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          } ${error ? 'border-red-500' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center space-y-2">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="text-sm text-gray-600">Procesando imagen...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-primary-100 rounded-full">
                  <Camera className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Arrastra una imagen aquí o{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      haz clic para seleccionar
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG o WEBP (máx. 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Botón para cambiar imagen si ya hay una */}
      {imageUrl && (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Cambiar imagen</span>
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

