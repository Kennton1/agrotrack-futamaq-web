import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon: LucideIcon
  iconColor?: string
  className?: string
}

export function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = 'text-primary-500',
  className 
}: KPICardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    {
                      'text-success-600': change.type === 'increase',
                      'text-danger-600': change.type === 'decrease',
                      'text-gray-600': change.type === 'neutral',
                    }
                  )}
                >
                  {change.type === 'increase' && '+'}
                  {change.value}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs semana anterior</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-lg bg-gray-50', iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

