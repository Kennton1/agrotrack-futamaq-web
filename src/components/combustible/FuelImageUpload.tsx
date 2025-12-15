'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Camera, Image as ImageIcon, Receipt, FileText, DollarSign, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'

interface FuelImageUploadProps {
  label: string
  imageUrl?: string
  onChange: (imageUrl: string | undefined) => void
  error?: string
  type?: 'fuel_load' | 'receipt'
}

export function FuelImageUpload({
  label,
  imageUrl,
  onChange,
  error,
  type = 'fuel_load'
}: FuelImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

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
    // Si es PDF, convertir directamente a base64 sin comprimir
    if (file.type === 'application/pdf') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            resolve(e.target.result)
          } else {
            reject(new Error('Error al leer el archivo PDF'))
          }
        }
        reader.onerror = () => reject(new Error('Error al leer el archivo PDF'))
        reader.readAsDataURL(file)
      })
    }
    // Si es imagen, comprimir
    return compressImage(file, 1200, 300)
  }

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const allowedPdfTypes = ['application/pdf']

    // Si es tipo receipt, permitir imágenes y PDFs
    if (type === 'receipt') {
      const allowedTypes = [...allowedImageTypes, ...allowedPdfTypes]
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, WEBP o archivos PDF')
        return false
      }
    } else {
      // Si es fuel_load, solo permitir imágenes
      if (!allowedImageTypes.includes(file.type)) {
        alert('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG o WEBP')
        return false
      }
    }

    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo es 10MB')
      return false
    }

    return true
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!validateFile(file)) return

    setIsProcessing(true)
    try {
      const base64 = await convertFileToBase64(file)
      onChange(base64)
    } catch (error) {
      console.error('Error al procesar el archivo:', error)
      alert('Error al procesar el archivo. Por favor, intenta nuevamente.')
    } finally {
      setIsProcessing(false)
    }
  }, [onChange])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
    // Reset input para permitir seleccionar el mismo archivo nuevamente
    // Hacemos esto DESPUÉS de capturar los archivos
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

  const removeImage = () => {
    onChange(undefined)
  }

  const IconComponent = type === 'receipt' ? DollarSign : Camera

  // Determinar si el archivo actual es un PDF
  const isPdf = imageUrl?.startsWith('data:application/pdf')

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Upload area */}
      {!imageUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800'
            } ${error ? 'border-red-500' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={type === 'receipt' ? 'image/jpeg,image/jpg,image/png,image/webp,application/pdf' : 'image/jpeg,image/jpg,image/png,image/webp'}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isProcessing}
          />

          <div className="flex flex-col items-center space-y-2">
            <div className={`p-3 rounded-full ${isDragging ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <IconComponent className={`h-6 w-6 ${isDragging ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {type === 'receipt'
                  ? 'Arrastra una imagen o PDF aquí o haz clic para seleccionar'
                  : 'Arrastra una imagen aquí o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {type === 'receipt'
                  ? 'Formatos: JPG, PNG, WEBP, PDF (máx. 10MB, las imágenes se comprimirán automáticamente)'
                  : 'Formatos: JPG, PNG, WEBP (máx. 10MB, se comprimirá automáticamente)'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
              disabled={isProcessing}
            >
              {type === 'receipt' ? (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Procesando...' : 'Seleccionar Archivo'}
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Comprimiendo...' : 'Tomar o Seleccionar Foto'}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Image/PDF preview */}
      {imageUrl && (
        <div className="relative group rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          {/* Badge de tipo de archivo */}
          <div className="absolute top-2 right-2 z-10">
            {isPdf ? (
              <div className="bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 shadow-lg">
                <FileText className="h-3 w-3" />
                <span>PDF</span>
              </div>
            ) : (
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 shadow-lg">
                <ImageIcon className="h-3 w-3" />
                <span>IMAGEN</span>
              </div>
            )}
          </div>

          {isPdf ? (
            <div className="w-full min-h-[200px] bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-6 cursor-pointer" onClick={() => setShowPreviewModal(true)}>
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <FileText className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archivo PDF cargado</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Haz clic para ver el PDF</p>
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <Maximize2 className="h-4 w-4" />
                <span>Ver en pantalla completa</span>
              </div>
            </div>
          ) : (
            <div className="cursor-pointer" onClick={() => setShowPreviewModal(true)}>
              <img
                src={imageUrl}
                alt={label}
                className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-800"
              />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPreviewModal(true)
                }}
                className="bg-white/90 hover:bg-white"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Ver
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="bg-white/90 hover:bg-white"
              >
                {type === 'receipt' ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Cambiar
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Cambiar
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                title="Eliminar archivo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista previa ampliada */}
      {showPreviewModal && imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {isPdf ? (
                  <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isPdf ? 'Vista previa del PDF' : 'Vista previa de la imagen'}
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Cerrar"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
              {isPdf ? (
                <div className="w-full h-full min-h-[500px]">
                  <iframe
                    src={imageUrl}
                    className="w-full h-full min-h-[500px] border-0 rounded-lg"
                    title="Vista previa del PDF"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <img
                    src={imageUrl}
                    alt={label}
                    className="max-w-full max-h-[calc(90vh-120px)] object-contain"
                  />
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isPdf ? 'Archivo PDF' : 'Imagen cargada correctamente'}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = imageUrl
                    link.download = isPdf ? 'boleta.pdf' : 'imagen.jpg'
                    link.target = '_blank'
                    link.click()
                  }}
                >
                  Descargar
                </Button>
                <Button
                  onClick={() => setShowPreviewModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden input for when image exists and user wants to change it */}
      {imageUrl && (
        <input
          ref={fileInputRef}
          type="file"
          accept={type === 'receipt' ? 'image/jpeg,image/jpg,image/png,image/webp,application/pdf' : 'image/jpeg,image/jpg,image/png,image/webp'}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />
      )}
    </div>
  )
}



