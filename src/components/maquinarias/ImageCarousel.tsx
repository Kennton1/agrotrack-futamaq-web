'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'

export interface MachineryImage {
  id: string
  url: string
  alt: string
  is_primary: boolean
}

interface ImageCarouselProps {
  images?: MachineryImage[]
  machineryName: string
  className?: string
  showThumbnails?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function ImageCarousel({ 
  images = [], 
  machineryName, 
  className = '',
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 5000
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const primaryImage = images.find(img => img.is_primary) || images[0]
  const displayImages = images.length > 0 ? images : []

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && displayImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length)
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [autoPlay, autoPlayInterval, displayImages.length])

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '420px' }}>
        <div className="text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Sin imágenes</p>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length)
  }

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const currentImage = displayImages[currentIndex] || primaryImage

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Image Container */}
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden group" style={{ minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <img
          src={currentImage.url}
          alt={currentImage.alt || machineryName}
          className="max-w-full max-h-full object-contain"
          style={{ 
            maxHeight: '400px',
            maxWidth: '100%',
            width: 'auto',
            height: 'auto',
            display: 'block'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='
          }}
        />
        
        {/* Overlay gradient - solo en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
        
        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-lg"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-lg"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium z-10">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}

        {/* Dots indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-8 shadow-md' 
                    : 'bg-white/60 hover:bg-white/80 w-2'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img
                src={image.url}
                alt={image.alt || `${machineryName} - Imagen ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

