'use client'

import { useState, useEffect } from 'react'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setIsMobile(true)
        setIsTablet(false)
        setScreenSize('mobile')
      } else if (width < 1024) {
        setIsMobile(false)
        setIsTablet(true)
        setScreenSize('tablet')
      } else {
        setIsMobile(false)
        setIsTablet(false)
        setScreenSize('desktop')
      }
    }

    // Verificar tamaño inicial
    checkScreenSize()

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize,
    isSmallScreen: isMobile || isTablet
  }
}

// Hook para detectar orientación
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')

  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait')
      } else {
        setOrientation('landscape')
      }
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)

    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  return orientation
}

// Hook para detectar si el dispositivo tiene touch
export function useTouch() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkTouch()
  }, [])

  return isTouch
}



















































