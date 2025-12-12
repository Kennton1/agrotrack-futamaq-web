import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'gradient' | 'modern'
  hover?: boolean
}

export function Card({ children, className, variant = 'default', hover = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'transition-all duration-300 group',
        {
          // default, modern y gradient usan la clase .card (variables CSS)
          'card': variant === 'default' || variant === 'modern' || variant === 'gradient',
          // glass mantiene su estilo especial
          'glass rounded-2xl shadow-xl': variant === 'glass',
        },
        // hover && 'hover:shadow-2xl hover:scale-[1.02] hover:shadow-glow', // Deshabilitado temporalmente
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'glass'
}

export function CardHeader({ children, className, variant = 'default' }: CardHeaderProps) {
  return (
    <div className={cn(
      'px-6 py-5 transition-all duration-300',
      {
        'border-b border-gray-200/50 dark:border-gray-700/50': variant === 'default',
        'bg-gradient-primary dark:bg-gray-800 dark:border-gray-700 text-white dark:text-gray-200 rounded-t-2xl border-b-0': variant === 'gradient',
        'glass-dark border-b border-white/10 rounded-t-2xl': variant === 'glass',
      },
      className
    )}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function CardContent({ children, className, padding = 'md' }: CardContentProps) {
  return (
    <div className={cn(
      'transition-all duration-300',
      {
        'px-4 py-3': padding === 'sm',
        'px-6 py-5': padding === 'md',
        'px-8 py-6': padding === 'lg',
      },
      className
    )}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function CardTitle({ children, className, variant = 'default', size = 'md' }: CardTitleProps) {
  return (
    <h3 className={cn(
      'font-bold transition-all duration-300',
      {
        'text-gray-900 dark:text-white': variant === 'default',
        'text-white dark:text-gray-200': variant === 'gradient',
        'text-gradient': variant === 'gradient' && size === 'xl',
      },
      {
        'text-sm': size === 'sm',
        'text-lg': size === 'md',
        'text-xl': size === 'lg',
        'text-2xl': size === 'xl',
      },
      className
    )}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted mt-1', className)}>
      {children}
    </p>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200/50 bg-gray-50/50 rounded-b-2xl', className)}>
      {children}
    </div>
  )
}

interface CardIconProps {
  icon: ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'glow'
}

export function CardIcon({ icon, className, variant = 'default' }: CardIconProps) {
  return (
    <div className={cn(
      'flex items-center justify-center transition-all duration-300',
      {
        'p-3 bg-primary-100 rounded-xl': variant === 'default',
        'p-3 bg-white/20 backdrop-blur-sm rounded-xl': variant === 'gradient',
        'p-3 bg-gradient-primary rounded-xl shadow-lg pulse-glow': variant === 'glow',
      },
      className
    )}>
      {icon}
    </div>
  )
}