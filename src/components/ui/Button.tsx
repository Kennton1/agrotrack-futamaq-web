import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group',
          {
            // Primary variant - Enhanced with gradient and effects
            'bg-gradient-primary text-white shadow-lg hover:shadow-xl': variant === 'primary', /* hover:scale-105 active:scale-95 removido */
            
            // Secondary variant - Modern gray with subtle effects
            'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-md hover:shadow-lg border border-gray-200': variant === 'secondary', /* hover:scale-105 active:scale-95 removido */
            
            // Outline variant - Glass-like border with hover effects
            'border-2 border-primary-300 bg-white/80 backdrop-blur-sm text-primary-700 hover:bg-primary-50 hover:border-primary-400 shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:hover:text-white': variant === 'outline', /* hover:scale-105 active:scale-95 removido */
            
            // Ghost variant - Minimal with subtle hover
            'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 rounded-lg': variant === 'ghost',
            
            // Danger variant - Red gradient with effects
            'bg-gradient-danger text-white shadow-lg hover:shadow-xl': variant === 'danger', /* hover:scale-105 active:scale-95 removido */
            
            // Gradient variant - Colorful gradient
            'bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 text-white shadow-lg hover:shadow-xl': variant === 'gradient', /* hover:scale-105 active:scale-95 removido */
            
            // Glass variant - Glassmorphism effect
            'glass text-gray-800 hover:bg-white/20 shadow-lg': variant === 'glass', /* hover:scale-105 active:scale-95 removido */
          },
          {
            'h-8 px-4 text-sm': size === 'sm',
            'h-10 px-6 text-sm': size === 'md',
            'h-12 px-8 text-base': size === 'lg',
            'h-14 px-10 text-lg': size === 'xl',
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect for gradient variants */}
        {(variant === 'primary' || variant === 'gradient' || variant === 'danger') && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          </div>
        )}
        
        {/* Button content */}
        <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {children}
        </span>
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }

