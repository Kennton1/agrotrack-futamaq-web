'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  title: string
  value: string | number
  timeframe?: string
  status?: string
  icon: LucideIcon
  iconColor?: string
  bgColor?: string
}

export function SummaryCard({
  title,
  value,
  timeframe,
  status,
  icon: Icon,
  iconColor = 'text-blue-600',
  bgColor = 'bg-gray-50'
}: SummaryCardProps) {
  // Mapear colores de texto a colores de fondo pastel
  const getIconBgColor = (textColor: string): string => {
    if (textColor.includes('blue')) return 'bg-blue-100 dark:bg-blue-900/30'
    if (textColor.includes('green')) return 'bg-green-100 dark:bg-green-900/30'
    if (textColor.includes('orange')) return 'bg-orange-100 dark:bg-orange-900/30'
    if (textColor.includes('purple')) return 'bg-purple-100 dark:bg-purple-900/30'
    return 'bg-gray-100 dark:bg-gray-800/50'
  }

  const getIconTextColor = (textColor: string): string => {
    if (textColor.includes('blue')) return 'text-blue-600 dark:text-blue-400'
    if (textColor.includes('green')) return 'text-green-600 dark:text-green-400'
    if (textColor.includes('orange')) return 'text-orange-600 dark:text-orange-400'
    if (textColor.includes('purple')) return 'text-purple-600 dark:text-purple-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className={cn(
      'rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300',
      bgColor,
      'dark:bg-gray-800 dark:border dark:border-gray-700'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{title}</p>
          <p className={cn(
            'text-3xl font-bold mb-1',
            typeof value === 'string' && (value.includes('$') || value.includes('CLP')) ? 'text-orange-600 dark:text-orange-400' :
            typeof value === 'string' && value.includes('L') ? 'text-gray-900 dark:text-white' :
            typeof value === 'number' ? 'text-gray-900 dark:text-white' :
            status ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'
          )}>
            {value}
          </p>
          {timeframe && (
            <p className="text-xs text-gray-600 dark:text-gray-400">{timeframe}</p>
          )}
          {status && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{status}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', getIconBgColor(iconColor))}>
          <Icon className={cn('h-6 w-6', getIconTextColor(iconColor))} />
        </div>
      </div>
    </div>
  )
}

