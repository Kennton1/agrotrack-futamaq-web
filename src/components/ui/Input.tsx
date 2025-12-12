import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  variant?: 'default' | 'modern' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    size = 'md',
    ...props
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}

          <input
            className={cn(
              'w-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
              {
                // Variants
                'input-modern': variant === 'modern',
                'glass rounded-xl px-4 py-3 border border-white/20 focus:ring-primary-500/50 focus:border-primary-500': variant === 'glass',
                // Default: adapta al tema - los estilos globales manejan el modo oscuro
                'border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500': variant === 'default',

                // Sizes
                'h-8 px-3 text-sm': size === 'sm',
                'h-10 px-4 text-sm': size === 'md',
                'h-12 px-4 text-base': size === 'lg',

                // Icon padding
                'pl-10': leftIcon,
                'pr-10': rightIcon,
              },
              error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="h-5 w-5 text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-danger-600 flex items-center gap-1">
            <span className="text-danger-500">⚠</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }