import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funciones específicas FUTAMAQ
export function getWorkOrderStatusColor(status: string): string {
  switch (status) {
    case 'completada':
      return 'bg-success-100 text-success-700 border-success-200'
    case 'en_ejecucion':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'planificada':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'retrasada':
    case 'atrasada':
      return 'bg-danger-100 text-danger-700 border-danger-200'
    case 'detenida':
      return 'bg-warning-100 text-warning-700 border-warning-200'
    case 'cancelada':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function getMachineryStatusColor(status: string): string {
  switch (status) {
    case 'disponible':
      return 'bg-success-100 text-success-700'
    case 'en_faena':
      return 'bg-blue-100 text-blue-700'
    case 'en_mantencion':
      return 'bg-warning-100 text-warning-700'
    case 'fuera_servicio':
      return 'bg-danger-100 text-danger-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount)
}

export function formatHectares(hectares: number): string {
  return `${hectares.toLocaleString('es-CL', { maximumFractionDigits: 1 })} ha`
}

export function formatLiters(liters: number): string {
  return `${liters.toLocaleString('es-CL', { maximumFractionDigits: 1 })} L`
}

export function formatHours(hours: number): string {
  return `${hours.toLocaleString('es-CL', { maximumFractionDigits: 1 })} hr`
}

export function calculateEfficiency(hectares: number, liters: number): string {
  if (liters === 0) return '0 ha/L'
  return `${(hectares / liters).toFixed(2)} ha/L`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
