// Mock data para mantenimientos con ítems detallados

export interface MaintenanceItem {
  id: string
  name: string
  description: string
  category: 'preventivo' | 'correctivo' | 'predictivo'
  type: 'cambio_aceite' | 'cambio_correas' | 'cambio_filtros' | 'ajuste' | 'limpieza' | 'inspeccion' | 'otro'
  cost: number
  estimated_hours: number
  actual_hours?: number
  status: 'pendiente' | 'en_progreso' | 'completado'
  notes?: string
  parts_required?: string[]
  priority: 'baja' | 'media' | 'alta' | 'critica'
  scheduled_date?: string
  completed_date?: string
  assigned_technician?: string
}

export interface Maintenance {
  id: string
  machinery_id: number
  machinery_code: string
  machinery_name: string
  type: 'preventivo' | 'correctivo' | 'predictivo'
  status: 'planificado' | 'en_progreso' | 'completado' | 'retrasado'
  priority: 'baja' | 'media' | 'alta' | 'critica'
  scheduled_date: string
  start_date?: string
  completion_date?: string
  total_estimated_cost: number
  total_actual_cost?: number
  total_estimated_hours: number
  total_actual_hours?: number
  description: string
  items: MaintenanceItem[]
  assigned_technician: string
  notes?: string
  created_at: string
  updated_at: string
}

export const MOCK_MAINTENANCE_ITEMS: MaintenanceItem[] = [
  // Cambio de aceite
  {
    id: 'MI-001',
    name: 'Cambio de aceite motor',
    description: 'Cambio de aceite del motor principal',
    category: 'preventivo',
    type: 'cambio_aceite',
    cost: 45000,
    estimated_hours: 2,
    actual_hours: 1.5,
    status: 'completado',
    notes: 'Aceite 15W-40 sintético',
    parts_required: ['Aceite motor 15W-40', 'Filtro de aceite'],
    priority: 'alta',
    scheduled_date: '2024-03-10',
    completed_date: '2024-03-10',
    assigned_technician: 'Juan Pérez'
  },
  
  // Cambio de correas
  {
    id: 'MI-002',
    name: 'Cambio de correas de transmisión',
    description: 'Reemplazo de correas de transmisión principal',
    category: 'correctivo',
    type: 'cambio_correas',
    cost: 28000,
    estimated_hours: 3,
    actual_hours: 2.5,
    status: 'completado',
    notes: 'Correas desgastadas por uso intensivo',
    parts_required: ['Correa transmisión A-1234', 'Correa alternador B-5678'],
    priority: 'alta',
    scheduled_date: '2024-03-10',
    completed_date: '2024-03-10',
    assigned_technician: 'Juan Pérez'
  },
  
  // Cambio de filtros
  {
    id: 'MI-003',
    name: 'Cambio de filtros de aire',
    description: 'Reemplazo de filtros de aire del motor',
    category: 'preventivo',
    type: 'cambio_filtros',
    cost: 15000,
    estimated_hours: 1,
    actual_hours: 1,
    status: 'completado',
    notes: 'Filtros muy sucios por polvo',
    parts_required: ['Filtro aire primario', 'Filtro aire secundario'],
    priority: 'media',
    scheduled_date: '2024-03-10',
    completed_date: '2024-03-10',
    assigned_technician: 'Juan Pérez'
  },
  
  // Ajuste
  {
    id: 'MI-004',
    name: 'Ajuste de válvulas',
    description: 'Ajuste de holgura de válvulas del motor',
    category: 'preventivo',
    type: 'ajuste',
    cost: 35000,
    estimated_hours: 4,
    actual_hours: 3.5,
    status: 'completado',
    notes: 'Holgura fuera de especificación',
    parts_required: [],
    priority: 'media',
    scheduled_date: '2024-03-10',
    completed_date: '2024-03-10',
    assigned_technician: 'Juan Pérez'
  },
  
  // Limpieza
  {
    id: 'MI-005',
    name: 'Limpieza del radiador',
    description: 'Limpieza profunda del radiador y sistema de enfriamiento',
    category: 'preventivo',
    type: 'limpieza',
    cost: 12000,
    estimated_hours: 2,
    status: 'completado',
    notes: 'Radiador obstruido por sedimentos',
    parts_required: ['Líquido refrigerante', 'Limpiador radiador'],
    priority: 'media',
    scheduled_date: '2024-03-10',
    completed_date: '2024-03-10',
    assigned_technician: 'Juan Pérez'
  },
  
  // Inspección
  {
    id: 'MI-006',
    name: 'Inspección de frenos',
    description: 'Inspección completa del sistema de frenos',
    category: 'preventivo',
    type: 'inspeccion',
    cost: 8000,
    estimated_hours: 1.5,
    status: 'completado',
    notes: 'Sistema en buen estado',
    parts_required: [],
    priority: 'alta',
    scheduled_date: '2024-03-10',
    completed_date: '2024-03-10',
    assigned_technician: 'Juan Pérez'
  }
]

export const MOCK_MAINTENANCES: Maintenance[] = [
  {
    id: 'MT-2024-001',
    machinery_id: 1,
    machinery_code: 'T001',
    machinery_name: 'John Deere 6120M',
    type: 'preventivo',
    status: 'completado',
    priority: 'alta',
    scheduled_date: '2024-03-10',
    start_date: '2024-03-10T08:00:00Z',
    completion_date: '2024-03-10T16:30:00Z',
    total_estimated_cost: 143000,
    total_actual_cost: 138000,
    total_estimated_hours: 13.5,
    total_actual_hours: 12.5,
    description: 'Mantenimiento preventivo programado cada 500 horas',
    items: MOCK_MAINTENANCE_ITEMS,
    assigned_technician: 'Juan Pérez',
    notes: 'Mantenimiento completado exitosamente. Todos los ítems terminados.',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-10T16:30:00Z'
  },
  {
    id: 'MT-2024-002',
    machinery_id: 2,
    machinery_code: 'T002',
    machinery_name: 'Case IH Puma 165',
    type: 'correctivo',
    status: 'en_progreso',
    priority: 'critica',
    scheduled_date: '2024-03-15',
    start_date: '2024-03-15T09:00:00Z',
    total_estimated_cost: 85000,
    total_actual_cost: 42000,
    total_estimated_hours: 6,
    total_actual_hours: 3,
    description: 'Reparación urgente del sistema hidráulico',
    items: [
      {
        id: 'MI-007',
        name: 'Reparación bomba hidráulica',
        description: 'Desmontaje y reparación de bomba hidráulica principal',
        category: 'correctivo',
        type: 'otro',
        cost: 65000,
        estimated_hours: 4,
        actual_hours: 2,
        status: 'en_progreso',
        notes: 'Bomba con pérdidas internas',
        parts_required: ['Kit reparación bomba', 'Juntas tóricas', 'Aceite hidráulico'],
        priority: 'critica',
        scheduled_date: '2024-03-15',
        assigned_technician: 'Carlos Rodríguez'
      },
      {
        id: 'MI-008',
        name: 'Limpieza sistema hidráulico',
        description: 'Limpieza completa del sistema hidráulico',
        category: 'correctivo',
        type: 'limpieza',
        cost: 20000,
        estimated_hours: 2,
        actual_hours: 1,
        status: 'completado',
        notes: 'Sistema limpio y sin contaminantes',
        parts_required: ['Filtros hidráulicos', 'Aceite hidráulico'],
        priority: 'alta',
        scheduled_date: '2024-03-15',
        completed_date: '2024-03-15T12:00:00Z',
        assigned_technician: 'Carlos Rodríguez'
      }
    ],
    assigned_technician: 'Carlos Rodríguez',
    notes: 'Reparación en curso. Bomba hidráulica en proceso de reparación.',
    created_at: '2024-03-14T15:30:00Z',
    updated_at: '2024-03-15T12:00:00Z'
  },
  {
    id: 'MT-2024-003',
    machinery_id: 3,
    machinery_code: 'C001',
    machinery_name: 'New Holland CR6.80',
    type: 'preventivo',
    status: 'planificado',
    priority: 'media',
    scheduled_date: '2024-03-20',
    total_estimated_cost: 95000,
    total_estimated_hours: 8,
    description: 'Mantenimiento preventivo de cosechadora',
    items: [
      {
        id: 'MI-009',
        name: 'Cambio de aceite motor',
        description: 'Cambio de aceite del motor principal',
        category: 'preventivo',
        type: 'cambio_aceite',
        cost: 55000,
        estimated_hours: 2,
        status: 'pendiente',
        notes: 'Aceite 10W-40 para motor diesel',
        parts_required: ['Aceite motor 10W-40', 'Filtro de aceite'],
        priority: 'alta',
        scheduled_date: '2024-03-20',
        assigned_technician: 'Miguel Torres'
      },
      {
        id: 'MI-010',
        name: 'Cambio de correas',
        description: 'Reemplazo de correas de transmisión',
        category: 'preventivo',
        type: 'cambio_correas',
        cost: 25000,
        estimated_hours: 3,
        status: 'pendiente',
        notes: 'Correas con desgaste normal',
        parts_required: ['Correa transmisión principal', 'Correa alternador'],
        priority: 'media',
        scheduled_date: '2024-03-20',
        assigned_technician: 'Miguel Torres'
      },
      {
        id: 'MI-011',
        name: 'Inspección sistema de corte',
        description: 'Inspección y ajuste del sistema de corte',
        category: 'preventivo',
        type: 'inspeccion',
        cost: 15000,
        estimated_hours: 3,
        status: 'pendiente',
        notes: 'Verificar filo de cuchillas',
        parts_required: [],
        priority: 'alta',
        scheduled_date: '2024-03-20',
        assigned_technician: 'Miguel Torres'
      }
    ],
    assigned_technician: 'Miguel Torres',
    notes: 'Mantenimiento programado para después de la cosecha.',
    created_at: '2024-03-12T09:15:00Z',
    updated_at: '2024-03-12T09:15:00Z'
  }
]

// Función para calcular estadísticas de mantenimiento
export function calculateMaintenanceStats(maintenances: Maintenance[]) {
  const stats = {
    total: maintenances.length,
    completed: maintenances.filter(m => m.status === 'completado').length,
    in_progress: maintenances.filter(m => m.status === 'en_progreso').length,
    planned: maintenances.filter(m => m.status === 'planificado').length,
    delayed: maintenances.filter(m => m.status === 'retrasado').length,
    total_estimated_cost: maintenances.reduce((sum, m) => sum + m.total_estimated_cost, 0),
    total_actual_cost: maintenances
      .filter(m => m.total_actual_cost)
      .reduce((sum, m) => sum + (m.total_actual_cost || 0), 0),
    total_estimated_hours: maintenances.reduce((sum, m) => sum + m.total_estimated_hours, 0),
    total_actual_hours: maintenances
      .filter(m => m.total_actual_hours)
      .reduce((sum, m) => sum + (m.total_actual_hours || 0), 0)
  }

  return stats
}

// Función para obtener mantenimientos por máquina
export function getMaintenancesByMachinery(maintenances: Maintenance[], machineryId: number) {
  return maintenances.filter(m => m.machinery_id === machineryId)
}

// Función para obtener mantenimientos por período
export function getMaintenancesByPeriod(maintenances: Maintenance[], startDate: string, endDate: string) {
  return maintenances.filter(m => {
    const scheduledDate = new Date(m.scheduled_date)
    return scheduledDate >= new Date(startDate) && scheduledDate <= new Date(endDate)
  })
}








































