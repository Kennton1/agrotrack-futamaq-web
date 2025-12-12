export const TASK_TYPES = [
  'Preparación de suelo',
  'Siembra',
  'Aplicación fertilizante',
  'Fumigación',
  'Cosecha',
  'Transporte',
  'Rastraje',
  'Arado',
  'Cultivada',
  'Otros'
] as const

export const MACHINERY_TYPES = [
  'Tractor',
  'Implemento',
  'Camión',
  'Cosechadora',
  'Pulverizador',
  'Sembradora'
] as const

export const WORK_ORDER_STATUSES = [
  { value: 'planificada', label: 'Planificada', color: 'gray' },
  { value: 'en_ejecucion', label: 'En Ejecución', color: 'blue' },
  { value: 'detenida', label: 'Detenida', color: 'yellow' },
  { value: 'completada', label: 'Completada', color: 'green' },
  { value: 'retrasada', label: 'Retrasada', color: 'red' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' }
] as const

export const MACHINERY_STATUSES = [
  { value: 'disponible', label: 'Disponible', color: 'green' },
  { value: 'en_faena', label: 'En Faena', color: 'blue' },
  { value: 'en_mantencion', label: 'En Mantención', color: 'yellow' },
  { value: 'fuera_servicio', label: 'Fuera de Servicio', color: 'red' }
] as const

export const PRIORITY_LEVELS = [
  { value: 'baja', label: 'Baja', color: 'gray' },
  { value: 'media', label: 'Media', color: 'yellow' },
  { value: 'alta', label: 'Alta', color: 'orange' },
  { value: 'critica', label: 'Crítica', color: 'red' }
] as const

export const MAINTENANCE_TYPES = [
  'Preventiva',
  'Correctiva'
] as const

export const INCIDENT_TYPES = [
  'Mecánica',
  'Climática',
  'Operacional',
  'Otra'
] as const

export const USER_ROLES = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'operador', label: 'Operador' },
  { value: 'cliente', label: 'Cliente' }
] as const

