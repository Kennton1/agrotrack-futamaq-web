// Mock data para cargas de combustible con validaciones

export interface FuelLoad {
  id: string
  order_id: string // ID de la orden de trabajo activa
  order_client: string
  order_location: string
  machinery_id: number
  machinery_code: string
  machinery_name: string
  fuel_type: 'diesel' | 'gasolina' | 'aceite'
  quantity_liters: number
  unit_price: number
  total_cost: number
  loading_date: string
  loading_time: string
  operator: string
  validated: boolean
  validation_method: 'manual' | 'automatic' | 'sensor'
  validation_notes?: string
  odometer_hours: number
  previous_odometer?: number
  estimated_consumption?: number
  actual_consumption?: number
  efficiency_rating?: 'excelente' | 'buena' | 'regular' | 'mala'
  location: {
    lat: number
    lng: number
    address: string
  }
  created_at: string
  updated_at: string
}

// Órdenes de trabajo activas para selección en carga de combustible
export const ACTIVE_WORK_ORDERS = [
  {
    id: 'OT-2024-001',
    client: 'Agrícola San José',
    location: 'Potrero Norte, San Antonio',
    status: 'en_ejecucion',
    machinery_assigned: [1, 3]
  },
  {
    id: 'OT-2024-002',
    client: 'Campo Verde Ltda',
    location: 'Parcela 12, Melipilla',
    status: 'en_ejecucion',
    machinery_assigned: [2]
  },
  {
    id: 'OT-2024-004',
    client: 'Fundo Los Robles',
    location: 'Campo Sur, Talagante',
    status: 'en_ejecucion',
    machinery_assigned: [1, 2, 3]
  }
]

export const MOCK_FUEL_LOADS: FuelLoad[] = [
  {
    id: 'FL-2024-03-001',
    order_id: 'OT-2024-001',
    order_client: 'Agrícola San José',
    order_location: 'Potrero Norte, San Antonio',
    machinery_id: 1,
    machinery_code: 'T001',
    machinery_name: 'John Deere 6120M',
    fuel_type: 'diesel',
    quantity_liters: 80,
    unit_price: 850,
    total_cost: 68000,
    loading_date: '2024-03-15',
    loading_time: '08:30',
    operator: 'Carlos Muñoz',
    validated: true,
    validation_method: 'manual',
    validation_notes: 'Validación manual por operador. Cantidad verificada con medidor de combustible.',
    odometer_hours: 3450,
    previous_odometer: 3440,
    estimated_consumption: 75,
    actual_consumption: 80,
    efficiency_rating: 'buena',
    location: {
      lat: -33.4489,
      lng: -70.6693,
      address: 'Estación de Combustible Shell, San Antonio'
    },
    created_at: '2024-03-15T08:30:00Z',
    updated_at: '2024-03-15T08:30:00Z'
  },
  {
    id: 'FL-2024-03-002',
    order_id: 'OT-2024-002',
    order_client: 'Campo Verde Ltda',
    order_location: 'Parcela 12, Melipilla',
    machinery_id: 2,
    machinery_code: 'T002',
    machinery_name: 'Case IH Puma 165',
    fuel_type: 'diesel',
    quantity_liters: 120,
    unit_price: 845,
    total_cost: 101400,
    loading_date: '2024-03-15',
    loading_time: '14:15',
    operator: 'Pedro Silva',
    validated: true,
    validation_method: 'automatic',
    validation_notes: 'Validación automática por sistema de monitoreo. Sensor de combustible calibrado.',
    odometer_hours: 2890,
    previous_odometer: 2880,
    estimated_consumption: 115,
    actual_consumption: 120,
    efficiency_rating: 'regular',
    location: {
      lat: -33.6891,
      lng: -71.2167,
      address: 'Estación de Combustible Copec, Melipilla'
    },
    created_at: '2024-03-15T14:15:00Z',
    updated_at: '2024-03-15T14:15:00Z'
  },
  {
    id: 'FL-2024-03-003',
    order_id: 'OT-2024-004',
    order_client: 'Fundo Los Robles',
    order_location: 'Campo Sur, Talagante',
    machinery_id: 3,
    machinery_code: 'C001',
    machinery_name: 'New Holland CR6.80',
    fuel_type: 'diesel',
    quantity_liters: 150,
    unit_price: 852,
    total_cost: 127800,
    loading_date: '2024-03-16',
    loading_time: '07:45',
    operator: 'Miguel Torres',
    validated: false,
    validation_method: 'sensor',
    validation_notes: 'Pendiente validación. Discrepancia detectada: sistema registra 145L, operador reporta 150L.',
    odometer_hours: 4120,
    previous_odometer: 4110,
    estimated_consumption: 140,
    actual_consumption: 150,
    efficiency_rating: 'mala',
    location: {
      lat: -33.6645,
      lng: -70.9278,
      address: 'Estación de Combustible Petrobras, Talagante'
    },
    created_at: '2024-03-16T07:45:00Z',
    updated_at: '2024-03-16T07:45:00Z'
  }
]

// Función para validar cantidad de combustible
export function validateFuelQuantity(
  reportedQuantity: number,
  systemQuantity?: number,
  tolerance: number = 5 // 5% de tolerancia
): {
  isValid: boolean
  discrepancy: number
  discrepancyPercentage: number
  validationStatus: 'valid' | 'warning' | 'error'
  message: string
} {
  if (!systemQuantity) {
    return {
      isValid: true,
      discrepancy: 0,
      discrepancyPercentage: 0,
      validationStatus: 'valid',
      message: 'Cantidad registrada manualmente'
    }
  }

  const discrepancy = reportedQuantity - systemQuantity
  const discrepancyPercentage = (discrepancy / systemQuantity) * 100

  if (Math.abs(discrepancyPercentage) <= tolerance) {
    return {
      isValid: true,
      discrepancy,
      discrepancyPercentage,
      validationStatus: 'valid',
      message: `Cantidad válida (diferencia: ${discrepancy.toFixed(1)}L, ${discrepancyPercentage.toFixed(1)}%)`
    }
  } else if (Math.abs(discrepancyPercentage) <= tolerance * 2) {
    return {
      isValid: true,
      discrepancy,
      discrepancyPercentage,
      validationStatus: 'warning',
      message: `Advertencia: diferencia significativa (${discrepancy.toFixed(1)}L, ${discrepancyPercentage.toFixed(1)}%)`
    }
  } else {
    return {
      isValid: false,
      discrepancy,
      discrepancyPercentage,
      validationStatus: 'error',
      message: `Error: diferencia crítica (${discrepancy.toFixed(1)}L, ${discrepancyPercentage.toFixed(1)}%)`
    }
  }
}

// Función para calcular eficiencia de combustible
export function calculateFuelEfficiency(
  actualConsumption: number,
  estimatedConsumption: number,
  hoursWorked: number,
  hectaresWorked: number
): {
  efficiencyRating: 'excelente' | 'buena' | 'regular' | 'mala'
  efficiencyPercentage: number
  litersPerHour: number
  litersPerHectare: number
} {
  const efficiencyPercentage = (estimatedConsumption / actualConsumption) * 100
  const litersPerHour = actualConsumption / hoursWorked
  const litersPerHectare = actualConsumption / hectaresWorked

  let efficiencyRating: 'excelente' | 'buena' | 'regular' | 'mala'

  if (efficiencyPercentage >= 95) {
    efficiencyRating = 'excelente'
  } else if (efficiencyPercentage >= 85) {
    efficiencyRating = 'buena'
  } else if (efficiencyPercentage >= 70) {
    efficiencyRating = 'regular'
  } else {
    efficiencyRating = 'mala'
  }

  return {
    efficiencyRating,
    efficiencyPercentage,
    litersPerHour,
    litersPerHectare
  }
}

// Función para obtener estadísticas de combustible
export function getFuelStatistics(fuelLoads: FuelLoad[]) {
  const totalLoads = fuelLoads.length
  const totalLiters = fuelLoads.reduce((sum, load) => sum + load.quantity_liters, 0)
  const totalCost = fuelLoads.reduce((sum, load) => sum + load.total_cost, 0)
  const validatedLoads = fuelLoads.filter(load => load.validated).length
  const pendingValidation = fuelLoads.filter(load => !load.validated).length

  const efficiencyStats = fuelLoads
    .filter(load => load.efficiency_rating)
    .reduce((acc, load) => {
      acc[load.efficiency_rating!] = (acc[load.efficiency_rating!] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  return {
    totalLoads,
    totalLiters,
    totalCost,
    validatedLoads,
    pendingValidation,
    validationRate: totalLoads > 0 ? (validatedLoads / totalLoads) * 100 : 0,
    averageCostPerLiter: totalLiters > 0 ? totalCost / totalLiters : 0,
    efficiencyStats
  }
}

// Función para filtrar cargas por período
export function getFuelLoadsByPeriod(fuelLoads: FuelLoad[], startDate: string, endDate: string) {
  return fuelLoads.filter(load => {
    const loadDate = new Date(load.loading_date)
    return loadDate >= new Date(startDate) && loadDate <= new Date(endDate)
  })
}

// Función para obtener cargas por orden de trabajo
export function getFuelLoadsByOrder(fuelLoads: FuelLoad[], orderId: string) {
  return fuelLoads.filter(load => load.order_id === orderId)
}

// Función para obtener cargas por máquina
export function getFuelLoadsByMachinery(fuelLoads: FuelLoad[], machineryId: number) {
  return fuelLoads.filter(load => load.machinery_id === machineryId)
}








































