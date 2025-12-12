import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gradient' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

export function Badge({ children, variant = 'default', size = 'md', className, animated = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-300 shadow-sm',
        {
          // Size variants
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'px-4 py-1.5 text-base': size === 'lg',
          
          // Color variants - Pastel suave y legible
          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600': variant === 'default',
          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700': variant === 'success',
          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700': variant === 'warning',
          'bg-pink-200 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-700': variant === 'danger',
          'bg-blue-200 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700': variant === 'info',
          'bg-gradient-primary text-white shadow-lg': variant === 'gradient',
          'glass text-gray-800 border border-white/20': variant === 'glass',
        },
        animated && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  )
}

