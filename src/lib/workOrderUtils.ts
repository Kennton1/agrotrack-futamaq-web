// Utilidades para generación de números de órdenes de trabajo

export interface WorkOrderNumber {
  prefix: string
  year: string
  sequence: string
  fullNumber: string
}

/**
 * Genera el siguiente número de orden de trabajo basado en las órdenes existentes
 * @param existingOrders Array de órdenes existentes
 * @returns Objeto con el número generado
 */
export function generateNextWorkOrderNumber(existingOrders: any[]): WorkOrderNumber {
  const currentYear = new Date().getFullYear().toString()
  
  // Filtrar órdenes del año actual
  const currentYearOrders = existingOrders.filter(order => 
    order.id.includes(`-${currentYear}-`)
  )
  
  // Extraer números secuenciales del año actual
  const sequences = currentYearOrders
    .map(order => {
      const match = order.id.match(/-(\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(seq => !isNaN(seq))
    .sort((a, b) => b - a) // Ordenar descendente
  
  // Obtener el siguiente número secuencial
  const nextSequence = sequences.length > 0 ? sequences[0] + 1 : 1
  
  // Formatear el número secuencial con ceros a la izquierda
  const formattedSequence = nextSequence.toString().padStart(3, '0')
  
  return {
    prefix: 'OT',
    year: currentYear,
    sequence: formattedSequence,
    fullNumber: `OT-${currentYear}-${formattedSequence}`
  }
}

/**
 * Genera el siguiente número de tarea para una orden específica
 * @param orderId ID de la orden de trabajo
 * @param existingTasks Array de tareas existentes de la orden
 * @returns Número de tarea generado
 */
export function generateNextTaskNumber(orderId: string, existingTasks: any[]): string {
  const orderPrefix = orderId.replace('OT-', 'T')
  
  // Extraer números secuenciales de tareas existentes
  const sequences = existingTasks
    .map(task => {
      const match = task.id.match(/-(\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(seq => !isNaN(seq))
    .sort((a, b) => b - a)
  
  // Obtener el siguiente número secuencial
  const nextSequence = sequences.length > 0 ? sequences[0] + 1 : 1
  
  // Formatear el número secuencial con ceros a la izquierda
  const formattedSequence = nextSequence.toString().padStart(3, '0')
  
  return `${orderPrefix}-${formattedSequence}`
}

/**
 * Valida que un número de orden de trabajo tenga el formato correcto
 * @param orderId ID de la orden a validar
 * @returns true si el formato es válido
 */
export function validateWorkOrderNumber(orderId: string): boolean {
  const pattern = /^OT-\d{4}-\d{3}$/
  return pattern.test(orderId)
}

/**
 * Extrae información de un número de orden de trabajo
 * @param orderId ID de la orden
 * @returns Objeto con la información extraída o null si es inválido
 */
export function parseWorkOrderNumber(orderId: string): WorkOrderNumber | null {
  if (!validateWorkOrderNumber(orderId)) {
    return null
  }
  
  const match = orderId.match(/^(OT)-(\d{4})-(\d{3})$/)
  if (!match) {
    return null
  }
  
  return {
    prefix: match[1],
    year: match[2],
    sequence: match[3],
    fullNumber: orderId
  }
}

/**
 * Genera números para mantenimientos
 * @param existingMaintenances Array de mantenimientos existentes
 * @returns Número de mantenimiento generado
 */
export function generateNextMaintenanceNumber(existingMaintenances: any[]): string {
  const currentYear = new Date().getFullYear().toString()
  
  // Filtrar mantenimientos del año actual
  const currentYearMaintenances = existingMaintenances.filter(maintenance => 
    maintenance.id.includes(`-${currentYear}-`)
  )
  
  // Extraer números secuenciales del año actual
  const sequences = currentYearMaintenances
    .map(maintenance => {
      const match = maintenance.id.match(/-(\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(seq => !isNaN(seq))
    .sort((a, b) => b - a)
  
  // Obtener el siguiente número secuencial
  const nextSequence = sequences.length > 0 ? sequences[0] + 1 : 1
  
  // Formatear el número secuencial con ceros a la izquierda
  const formattedSequence = nextSequence.toString().padStart(3, '0')
  
  return `MT-${currentYear}-${formattedSequence}`
}

/**
 * Genera números para cargas de combustible
 * @param existingFuelLoads Array de cargas de combustible existentes
 * @returns Número de carga de combustible generado
 */
export function generateNextFuelLoadNumber(existingFuelLoads: any[]): string {
  const currentYear = new Date().getFullYear().toString()
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
  
  // Filtrar cargas del año y mes actual
  const currentMonthLoads = existingFuelLoads.filter(load => 
    load.id.includes(`-${currentYear}-${currentMonth}-`)
  )
  
  // Extraer números secuenciales del mes actual
  const sequences = currentMonthLoads
    .map(load => {
      const match = load.id.match(/-(\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(seq => !isNaN(seq))
    .sort((a, b) => b - a)
  
  // Obtener el siguiente número secuencial
  const nextSequence = sequences.length > 0 ? sequences[0] + 1 : 1
  
  // Formatear el número secuencial con ceros a la izquierda
  const formattedSequence = nextSequence.toString().padStart(3, '0')
  
  return `FL-${currentYear}-${currentMonth}-${formattedSequence}`
}








































