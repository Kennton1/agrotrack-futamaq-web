'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { MachineryImage } from '@/contexts/AppContext'

interface ImageUploadProps {
  images: MachineryImage[]
  onChange: (images: MachineryImage[]) => void
  maxImages?: number
  label?: string
  error?: string
}

export function ImageUpload({ 
  images = [], 
  onChange, 
  maxImages = 10,
  label = 'Imágenes de la Maquinaria',
  error
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Función para comprimir y redimensionar imágenes
  const compressImage = (file: File, maxWidth: number = 1200, maxSizeKB: number = 300): Promise<string> => {
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
          while (attempts < maxAttempts) {
            compressedBase64 = canvas.toDataURL('image/jpeg', quality)
            base64Size = (compressedBase64.length * 3) / 4
            
            // Si el tamaño es aceptable, salir del bucle
            if (base64Size <= maxSizeKB * 1024) {
              break
            }
            
            // Reducir calidad
            quality -= 0.05
            
            // Si la calidad es muy baja y aún es grande, reducir dimensiones
            if (quality < 0.5 && base64Size > maxSizeKB * 1024 && targetWidth > 400) {
              targetWidth = Math.round(targetWidth * 0.85)
              targetHeight = Math.round((img.height * targetWidth) / img.width)
              canvas.width = targetWidth
              canvas.height = targetHeight
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
              quality = 0.7 // Resetear calidad después de redimensionar
            }
            
            attempts++
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    // Comprimir imágenes: máximo 1200px de ancho, máximo 300KB comprimido por imagen
    // Esto permite ~15-20 imágenes por maquinaria antes de llenar localStorage
    return compressImage(file, 1200, 300)
  }

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB (se comprimirá después)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG o WEBP')
      return false
    }
    
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo es 10MB (se comprimirá automáticamente)')
      return false
    }
    
    return true
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      alert(`Solo se pueden subir hasta ${maxImages} imágenes`)
      return
    }

    const filesArray = Array.from(files).slice(0, remainingSlots)
    const validFiles = filesArray.filter(validateFile)

    if (validFiles.length === 0) return

    setIsProcessing(true)
    try {
      const newImages: MachineryImage[] = await Promise.all(
        validFiles.map(async (file, index) => {
          const base64 = await convertFileToBase64(file)
          const imageId = `img_${Date.now()}_${index}`
          return {
            id: imageId,
            url: base64,
            alt: file.name,
            is_primary: images.length === 0 && index === 0 // Primera imagen es principal por defecto
          }
        })
      )

      // Si es la primera imagen, marcarla como principal
      const updatedImages = [...images, ...newImages]
      if (images.length === 0 && updatedImages.length > 0) {
        updatedImages[0].is_primary = true
      }

      onChange(updatedImages)
    } catch (error) {
      console.error('Error al procesar las imágenes:', error)
      alert('Error al procesar las imágenes. Por favor, intenta nuevamente.')
    } finally {
      setIsProcessing(false)
    }
  }, [images, maxImages, onChange])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    
    // Si se eliminó la imagen principal, marcar la primera como principal
    if (updatedImages.length > 0 && !updatedImages.find(img => img.is_primary)) {
      updatedImages[0].is_primary = true
    }
    
    onChange(updatedImages)
  }

  const setPrimaryImage = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      is_primary: img.id === imageId
    }))
    onChange(updatedImages)
  }

  const remainingSlots = maxImages - images.length

  return (
    <div className="space-y-4">
      <Label className="text-gray-700 dark:text-gray-300">{label}</Label>
      
      {/* Upload area */}
      {remainingSlots > 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800'
          } ${error ? 'border-red-500 dark:border-red-500' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            disabled={remainingSlots === 0}
          />
          
          <div className="flex flex-col items-center space-y-2">
            <div className={`p-3 rounded-full ${isDragging ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Upload className={`h-6 w-6 ${isDragging ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formatos: JPG, PNG, WEBP (máx. 10MB por imagen, se comprimirán automáticamente)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Puedes subir hasta {remainingSlots} imagen{remainingSlots !== 1 ? 'es' : ''} más
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 text-sm font-medium rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              disabled={isProcessing}
            >
              <Camera className="h-4 w-4" />
              {isProcessing ? 'Comprimiendo...' : 'Seleccionar Imágenes'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Imágenes subidas ({images.length}/{maxImages})
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition-all"
              >
                <img
                  src={image.url}
                  alt={image.alt || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(image.id)}
                      className={`p-2 rounded-full ${
                        image.is_primary
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/90 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600'
                      }`}
                      title={image.is_primary ? 'Imagen principal' : 'Marcar como principal'}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                      title="Eliminar imagen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Primary badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Principal
                  </div>
                )}

                {/* Image number */}
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No hay imágenes subidas. Agrega imágenes para identificar mejor la maquinaria.
        </p>
      )}
    </div>
  )
}

