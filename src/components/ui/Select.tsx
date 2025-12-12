'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within Select')
  }
  return context
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function Select({ value = '', onValueChange, children, className, disabled }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(value)
  const selectRef = useRef<HTMLDivElement>(null)

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  // Cerrar cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      // Usar un pequeño delay para evitar que se cierre inmediatamente
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [open])

  return (
    <SelectContext.Provider value={{ value: internalValue, onValueChange: handleValueChange, open, setOpen, disabled }}>
      <div ref={selectRef} className={cn('relative', className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { open, setOpen, disabled } = useSelectContext()
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setOpen(!open)
      }}
      className={cn(
        'flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg',
        'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500',
        'text-gray-900 dark:text-white',
        'text-gray-900 dark:text-white',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform', open && 'rotate-180')} />
    </button>
  )
}

interface SelectValueProps {
  placeholder?: string
  className?: string
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value } = useSelectContext()
  return (
    <span className={cn('block truncate', !value && 'text-gray-500 dark:text-gray-400', className)}>
      {value || placeholder || 'Seleccionar...'}
    </span>
  )
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open } = useSelectContext()
  const contentRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  return (
    <div
      ref={contentRef}
      onClick={(e) => {
        e.stopPropagation()
      }}
      className={cn(
        'absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg',
        'max-h-60 overflow-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function SelectItem({ value, children, className, disabled }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext()

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onValueChange(value)
      }}
      className={cn(
        'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none',
        'text-gray-900 dark:text-gray-200',
        selectedValue === value && 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
        selectedValue === value && 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
