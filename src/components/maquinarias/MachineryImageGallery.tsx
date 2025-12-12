'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Camera } from 'lucide-react'
import Image from 'next/image'

interface MachineryImage {
  id: string
  url: string
  alt: string
  is_primary: boolean
}

interface MachineryImageGalleryProps {
  images: MachineryImage[]
  machineryName: string
  className?: string
}

export function MachineryImageGallery({ images, machineryName, className = '' }: MachineryImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Sin imágenes</p>
        </div>
      </div>
    )
  }

  const primaryImage = images.find(img => img.is_primary) || images[0]

  return (
    <>
      {/* Galería principal */}
      <div className={`space-y-3 ${className}`}>
        {/* Imagen principal */}
        <div 
          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => setShowModal(true)}
        >
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/images/placeholder-machinery.jpg'
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                <ImageIcon className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </div>
          
          {/* Indicador de múltiples imágenes */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {images.length} imágenes
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative aspect-video w-16 bg-gray-100 rounded cursor-pointer overflow-hidden flex-shrink-0 ${
                  image.is_primary ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/placeholder-machinery.jpg'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de imagen completa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            {/* Botón cerrar */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/20 text-white hover:bg-white/30"
              onClick={() => setShowModal(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Imagen principal */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].alt}
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-machinery.jpg'
                }}
              />
            </div>

            {/* Navegación */}
            {images.length > 1 && (
              <>
                {/* Botón anterior */}
                {selectedImageIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white hover:bg-white/30"
                    onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}

                {/* Botón siguiente */}
                {selectedImageIndex < images.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white hover:bg-white/30"
                    onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>

                {/* Información de la imagen */}
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">{images[selectedImageIndex].alt}</p>
                  <p className="text-xs opacity-75">
                    {selectedImageIndex + 1} de {images.length}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Componente simple para mostrar solo una imagen
interface MachineryImageSimpleProps {
  image: MachineryImage
  machineryName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MachineryImageSimple({ 
  image, 
  machineryName, 
  className = '', 
  size = 'md' 
}: MachineryImageSimpleProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  return (
    <div className={`relative ${sizeClasses[size]} bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 ${className}`}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        className="object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/images/placeholder-machinery.jpg'
        }}
      />
    </div>
  )
}








































