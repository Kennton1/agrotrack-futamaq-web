'use client'

import Link from 'next/link'
import { Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'light' | 'dark' | 'default'
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
}

export function Logo({ 
  variant = 'default', 
  showText = true, 
  size = 'md',
  className,
  href
}: LogoProps) {
  const sizes = {
    sm: { icon: 'h-8 w-8', text: 'text-lg', subtext: 'text-xs' },
    md: { icon: 'h-10 w-10', text: 'text-2xl', subtext: 'text-sm' },
    lg: { icon: 'h-12 w-12', text: 'text-3xl', subtext: 'text-base' }
  }

  const currentSize = sizes[size]
  
  const iconColors = {
    light: 'text-white',
    dark: 'text-primary-500',
    default: 'text-primary-500'
  }

  const textColors = {
    light: 'text-white',
    dark: 'text-primary-500',
    default: 'text-primary-500'
  }

  const subtextColors = {
    light: 'text-white/90',
    dark: 'text-gray-600',
    default: 'text-gray-600'
  }

  const logoContent = (
    <div className={cn(
      'flex items-center',
      className
    )}>
      <Truck className={cn(currentSize.icon, iconColors[variant])} />
      {showText && (
        <div className="ml-2 flex flex-col">
          <span className={cn('font-bold uppercase', currentSize.text, textColors[variant])}>
            FUTAMAQ
          </span>
          {size !== 'sm' && (
            <span className={cn('font-semibold uppercase', currentSize.subtext, subtextColors[variant])}>
              Sistema Agrícola
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
