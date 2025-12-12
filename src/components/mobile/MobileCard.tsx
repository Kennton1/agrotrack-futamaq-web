'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useMobile } from '@/hooks/useMobile'

interface MobileCardProps {
  title: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  onClick?: () => void
  variant?: 'default' | 'compact' | 'expanded'
}

export default function MobileCard({
  title,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  onClick,
  variant = 'default'
}: MobileCardProps) {
  const { isMobile, isTablet } = useMobile()

  const getVariantClasses = () => {
    if (isMobile) {
      switch (variant) {
        case 'compact':
          return 'p-3'
        case 'expanded':
          return 'p-6'
        default:
          return 'p-4'
      }
    }
    return 'p-6'
  }

  const getHeaderClasses = () => {
    if (isMobile) {
      return `text-lg font-semibold ${headerClassName}`
    }
    return `text-xl font-bold ${headerClassName}`
  }

  return (
    <Card 
      className={`
        ${isMobile ? 'mb-3' : 'mb-6'} 
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <CardHeader className={getVariantClasses()}>
        <CardTitle className={getHeaderClasses()}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`${getVariantClasses()} ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  )
}

// Componente para listas móviles
export function MobileList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const { isMobile } = useMobile()

  return (
    <div className={`
      ${isMobile ? 'space-y-2' : 'space-y-4'} 
      ${className}
    `}>
      {children}
    </div>
  )
}

// Componente para elementos de lista móviles
export function MobileListItem({ 
  children, 
  className = '',
  onClick 
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const { isMobile } = useMobile()

  return (
    <div 
      className={`
        ${isMobile ? 'p-3 rounded-lg border border-gray-200' : 'p-4 rounded-lg border border-gray-200'}
        ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}



















































