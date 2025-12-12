'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { MOCK_MACHINERY, MOCK_WORK_ORDERS, MOCK_MAINTENANCES, MOCK_FUEL_LOADS, MOCK_SPARE_PARTS, MOCK_PART_MOVEMENTS } from '@/data/mockData'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// Tipos de datos
export interface MachineryImage {
  id: string
  url: string
  alt: string
  is_primary: boolean
}

export interface Machinery {
  id: number
  code: string
  patent: string
  type: 'tractor' | 'implemento' | 'camion' | 'cosechadora' | 'pulverizador' | 'sembradora'
  brand: string
  model: string
  year: number
  total_hours: number
  status: 'disponible' | 'en_faena' | 'en_mantencion' | 'fuera_servicio'
  fuel_capacity: number
  hourly_cost: number
  last_location: {
    lat: number
    lng: number
    address: string
  }
  images?: MachineryImage[]
  created_at: string
}

export interface WorkOrder {
  id: string
  client_id: number
  client_name?: string
  field_name: string
  task_type: string
  description: string
  priority: 'baja' | 'media' | 'alta' | 'critica'
  planned_start_date: string
  planned_end_date: string
  actual_start_date: string | null
  actual_end_date: string | null
  status: 'planificada' | 'en_ejecucion' | 'detenida' | 'completada' | 'retrasada' | 'cancelada'
  assigned_operator: string
  assigned_machinery: number[]
  target_hectares: number
  target_hours: number
  actual_hectares: number
  actual_hours: number
  progress_percentage: number
  created_at: string
  updated_at: string
  worker_notes?: string
}

export interface MaintenanceItem {
  id: string
  name: string
  description: string
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
  id: number
  machinery_id: number
  machinery_code: string
  type: 'preventiva' | 'correctiva'
  status: 'programada' | 'en_ejecucion' | 'completada'
  scheduled_date: string
  completion_date: string | null
  description: string
  cost: number // Suma de los costos de los items
  items: MaintenanceItem[] // Items de mantenimiento (cambio de aceite, correas, etc.)
  parts_used: Array<{ part: string; quantity: number }> // Mantener para compatibilidad
  technician: string
  odometer_hours: number
  created_at: string
}

export interface FuelLoad {
  id: number
  machinery_id: number
  machinery_code: string
  operator_id: string
  operator: string
  date: string
  liters: number
  total_cost: number
  cost_per_liter: number
  created_at: string
  fuel_load_image?: string
  receipt_image?: string
  work_order_id?: string | null
  source?: 'bodega' | 'estacion'
  location?: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: 'administrador' | 'operador' | 'cliente'
  is_active: boolean
  created_at: string
  last_login: string
  avatar_url?: string | null
  phone?: string
}


export interface SparePart {
  id: number
  code?: string // Optional to support legacy mock data
  machinery_id: number | null
  machinery_brand: string | null
  machinery_model: string | null
  description: string
  category: string
  current_stock: number
  minimum_stock: number
  unit_cost: number
  supplier: string
  created_at: string
}



export interface PartMovement {
  id: number
  part_id: number
  part_description: string
  movement_type: 'entrada' | 'salida'
  quantity: number
  reason: string
  work_order_id: string | null
  operator: string
  date: string
  created_at: string
}

export interface Incident {
  id: number
  work_order_id?: string
  type: 'mecanica' | 'climatica' | 'operacional' | 'otra'
  title: string
  description: string
  status: 'abierta' | 'en_curso' | 'resuelta'
  reporter_id: string
  assigned_to?: string
  photos?: string[]
  location?: {
    lat: number
    lng: number
    address?: string
  }
  created_at: string
  resolved_at?: string
}

export interface Notification {
  id: string
  type: 'incident' | 'maintenance' | 'fuel'
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
}

// Contexto de la aplicación
interface AppContextType {
  // Estados
  machinery: Machinery[]
  workOrders: WorkOrder[]
  maintenances: Maintenance[]
  fuelLoads: FuelLoad[]
  spareParts: SparePart[]
  partMovements: PartMovement[]
  incidents: Incident[]
  notifications: Notification[]
  users: User[]

  // Funciones de maquinarias
  addMachinery: (machinery: Omit<Machinery, 'id' | 'created_at'>) => void
  updateMachinery: (id: number, machinery: Partial<Machinery>) => void
  deleteMachinery: (id: number) => void
  getMachinery: (id: number) => Machinery | undefined

  // Funciones de órdenes de trabajo
  addWorkOrder: (workOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => void
  updateWorkOrder: (id: string, workOrder: Partial<WorkOrder>) => void
  deleteWorkOrder: (id: string) => void
  getWorkOrder: (id: string) => WorkOrder | undefined

  // Funciones de mantenimientos
  addMaintenance: (maintenance: Omit<Maintenance, 'id' | 'created_at'>) => void
  updateMaintenance: (id: number, maintenance: Partial<Maintenance>) => void
  deleteMaintenance: (id: number) => void
  getMaintenance: (id: number) => Maintenance | undefined

  // Funciones de combustible
  addFuelLoad: (fuelLoad: Omit<FuelLoad, 'id' | 'created_at'>) => void
  updateFuelLoad: (id: number, fuelLoad: Partial<FuelLoad>) => void
  deleteFuelLoad: (id: number) => void
  getFuelLoad: (id: number) => FuelLoad | undefined

  // Funciones de repuestos
  addSparePart: (sparePart: Omit<SparePart, 'id' | 'created_at'>) => void
  updateSparePart: (id: number, sparePart: Partial<SparePart>) => void
  deleteSparePart: (id: number) => void
  getSparePart: (id: number) => SparePart | undefined

  // Funciones de movimientos de repuestos
  addPartMovement: (movement: Omit<PartMovement, 'id' | 'created_at'>) => void
  deletePartMovement: (id: number) => void
  getPartMovement: (id: number) => PartMovement | undefined

  // Funciones de usuarios
  addUser: (user: Omit<User, 'id' | 'created_at'>) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  getUser: (id: string) => User | undefined
  fetchData: () => Promise<void>

  // Funciones de incidentes
  deleteIncident: (id: number) => void

  // Funciones de notificaciones
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Función helper para cargar datos del localStorage
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem(`futamaq_${key}`)
      if (stored) {
        return JSON.parse(stored) as T
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
    }
    return defaultValue
  }

  // Función helper para guardar datos en localStorage
  const saveToStorage = <T,>(key: string, data: T) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`futamaq_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  // Inicializar estados desde localStorage o datos mock
  const [machinery, setMachinery] = useState<Machinery[]>(() =>
    loadFromStorage('machinery', MOCK_MACHINERY)
  )
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() =>
    loadFromStorage('workOrders', MOCK_WORK_ORDERS)
  )
  const [maintenances, setMaintenances] = useState<Maintenance[]>(() =>
    loadFromStorage('maintenances', MOCK_MAINTENANCES)
  )
  const [fuelLoads, setFuelLoads] = useState<FuelLoad[]>(() =>
    loadFromStorage('fuelLoads', MOCK_FUEL_LOADS)
  )
  const [spareParts, setSpareParts] = useState<SparePart[]>(() =>
    loadFromStorage('spareParts', MOCK_SPARE_PARTS)
  )
  const [partMovements, setPartMovements] = useState<PartMovement[]>(() =>
    loadFromStorage('partMovements', MOCK_PART_MOVEMENTS || [])
  )
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Usuarios predefinidos (copiados de AuthContext o mockeados aquí)
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage('users', [
      {
        id: '1',
        email: 'admin@futamaq.cl',
        full_name: 'Administrador FUTAMAQ',
        role: 'administrador',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        last_login: new Date().toISOString()
      },
      {
        id: '2',
        email: 'operador@futamaq.cl',
        full_name: 'Operador de Campo',
        role: 'operador',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        last_login: new Date().toISOString()
      },
      {
        id: '3',
        email: 'cliente@futamaq.cl',
        full_name: 'Cliente Demo',
        role: 'cliente',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        last_login: new Date().toISOString()
      }
    ])
  )

  const fetchData = async () => {
    if (!supabase) return

    try {
      // Fetch users
      const { data: usersData } = await supabase.from('users').select('*')
      if (usersData) {
        setUsers(usersData as User[])

        // --- SYNC AUTH USER TO PUBLIC USERS ---
        // Verificar si el usuario actual autenticado existe en la tabla pública users
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const publicUser = usersData.find((u: any) => u.email === session.user.email)

          if (!publicUser) {
            console.log('🔄 Sincronizando usuario de Auth a tabla pública...')
            // El usuario existe en Auth pero no en public.users, crearlo.
            const newUserPublicData = {
              id: session.user.id, // IMPORTANTE: Usar el mismo ID que Auth
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || 'Nuevo Usuario',
              role: session.user.user_metadata?.role || 'operador',
              is_active: true,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            }

            const { error: insertError } = await supabase
              .from('users')
              .insert([newUserPublicData])

            if (!insertError) {
              console.log('✅ Usuario sincronizado correctamente')
              // Actualizar estado local
              setUsers(prev => [...prev, newUserPublicData as any])
            } else {
              console.error('❌ Error al sincronizar usuario:', insertError)
            }
          }
        }
        // --------------------------------------
      }

      // Fetch machinery
      const { data: machineryData } = await supabase.from('machinery').select('*')
      if (machineryData) setMachinery(machineryData as Machinery[])

      // Fetch work orders
      const { data: workOrdersData } = await supabase.from('work_orders').select('*')
      if (workOrdersData) setWorkOrders(workOrdersData as WorkOrder[])

      // Fetch maintenance
      const { data: maintenancesData } = await supabase.from('maintenances').select('*')
      if (maintenancesData) setMaintenances(maintenancesData as Maintenance[])

      // Fetch Incidents
      const { data: incidentsData } = await supabase.from('incidents').select('*')
      if (incidentsData) setIncidents(incidentsData as Incident[])

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchData()

    if (!supabase) return

    // Suscripción a nuevos incidentes para notificaciones
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incidents'
        },
        (payload) => {
          const newIncident = payload.new as Incident
          const typeLabel = newIncident.type.charAt(0).toUpperCase() + newIncident.type.slice(1)

          const newNotification: Notification = {
            id: Date.now().toString(),
            type: 'incident',
            title: `Nueva Incidencia: ${typeLabel}`,
            message: `${newIncident.title} - Reportado por ${newIncident.reporter_id}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/incidencias'
          }

          setNotifications(prev => [newNotification, ...prev])
          setIncidents(prev => [newIncident, ...prev])

          // Toast removed as per user request
          // Only update state

        }
      )
      .subscribe((status) => {
        console.log('Incidents Subscription Status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscribing to incidents...')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime Channel Error')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Suscripción a cargas de combustible
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('fuel-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fuel_loads'
        },
        async (payload) => {
          const newFuelLoad = payload.new as FuelLoad
          // Obtener nombre de quien reportó (operator_id) si es posible, o usar genérico

          const newNotification: Notification = {
            id: Date.now().toString(),
            type: 'fuel',
            title: 'Nueva Carga de Combustible',
            message: `${newFuelLoad.liters} Lts para ${newFuelLoad.machinery_code || 'Maquinaria'}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/combustible'
          }

          setNotifications(prev => [newNotification, ...prev])
          setFuelLoads(prev => [newFuelLoad, ...prev])
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscribing to fuel_loads...')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])


  useEffect(() => {
    saveToStorage('workOrders', workOrders)
  }, [workOrders])

  useEffect(() => {
    saveToStorage('maintenances', maintenances)
  }, [maintenances])

  useEffect(() => {
    saveToStorage('fuelLoads', fuelLoads)
  }, [fuelLoads])

  useEffect(() => {
    saveToStorage('spareParts', spareParts)
  }, [spareParts])

  useEffect(() => {
    saveToStorage('partMovements', partMovements)
  }, [partMovements])

  useEffect(() => {
    saveToStorage('incidents', incidents)
  }, [incidents])

  useEffect(() => {
    saveToStorage('users', users)
  }, [users])

  // Funciones de maquinarias
  // Helper to upload images
  const uploadImageToSupabase = async (base64Data: string, path: string) => {
    if (!supabase) return null
    try {
      // Decode base64
      const base64Content = base64Data.split(',')[1]
      const mimeType = base64Data.split(';')[0].split(':')[1]

      const byteCharacters = atob(base64Content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })

      const { data, error } = await supabase.storage
        .from('images')
        .upload(path, blob, {
          contentType: mimeType,
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const addMachinery = async (newMachinery: Omit<Machinery, 'id' | 'created_at'>) => {
    try {
      if (supabase) {
        // Process images if they exist
        let processedImages = newMachinery.images || []

        if (processedImages.length > 0) {
          const toastId = toast.loading('Subiendo imágenes...')

          processedImages = await Promise.all(processedImages.map(async (img) => {
            if (img.url.startsWith('data:')) {
              const fileName = `machinery/${Date.now()}_${img.id}.${img.url.split(';')[0].split('/')[1]}`
              const publicUrl = await uploadImageToSupabase(img.url, fileName)
              if (publicUrl) {
                return { ...img, url: publicUrl }
              }
            }
            return img
          }))

          toast.dismiss(toastId)
        }

        const { data, error } = await supabase
          .from('machinery')
          .insert([{
            ...newMachinery,
            code: newMachinery.code || `MQ-${Date.now().toString().slice(-6)}`,
            images: processedImages
          }])
          .select()
          .single()

        if (error) throw error
        setMachinery(prev => [...prev, data as Machinery])
        toast.success('Maquinaria agregada exitosamente')
      } else {
        // Fallback
        const id = Math.max(...machinery.map(m => m.id), 0) + 1
        const machineryWithId: Machinery = {
          ...newMachinery,
          id,
          created_at: new Date().toISOString()
        }
        setMachinery(prev => [...prev, machineryWithId])
        toast.success('Maquinaria agregada (Local)')
      }
    } catch (error: any) {
      console.error('Error adding machinery:', error)
      toast.error('Error al agregar maquinaria: ' + error.message)
    }
  }

  const updateMachinery = (id: number, updatedMachinery: Partial<Machinery>) => {
    setMachinery(prev =>
      prev.map(m => m.id === id ? { ...m, ...updatedMachinery } : m)
    )
    toast.success('Maquinaria actualizada exitosamente')
  }

  const deleteMachinery = async (id: number) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('machinery')
          .delete()
          .eq('id', id)

        if (error) throw error
        setMachinery(prev => prev.filter(m => m.id !== id))
        toast.success('Maquinaria eliminada exitosamente')
      } else {
        setMachinery(prev => prev.filter(m => m.id !== id))
        toast.success('Maquinaria eliminada (Local)')
      }
    } catch (error: any) {
      console.error('Error deleting machinery:', error)
      toast.error('Error al eliminar maquinaria: ' + error.message)
    }
  }

  const getMachinery = (id: number) => {
    return machinery.find(m => m.id === id)
  }

  // Funciones de órdenes de trabajo
  const addWorkOrder = async (newWorkOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (supabase) {
        // ID generation strategy: The Supabase schema expects a string ID.
        // The mock data uses 'OT-...' format. We can let the user provide it or generate it.
        // Implementation: Generate OT-Timestamp if not provided (though Omit says no ID).
        const id = `OT-${Date.now()}`
        const workOrderData = { ...newWorkOrder, id }

        const { data, error } = await supabase
          .from('work_orders')
          .insert([workOrderData])
          .select()
          .single()

        if (error) throw error
        setWorkOrders(prev => [...prev, data as WorkOrder])
        toast.success('Orden de trabajo creada exitosamente')
      } else {
        const id = `OT-${Date.now()}`
        const workOrderWithId: WorkOrder = {
          ...newWorkOrder,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setWorkOrders(prev => [...prev, workOrderWithId])
        toast.success('Orden de trabajo creada (Local)')
      }
    } catch (error: any) {
      console.error('Error adding work order:', error)
      toast.error('Error al crear orden: ' + error.message)
    }
  }

  const updateWorkOrder = (id: string, updatedWorkOrder: Partial<WorkOrder>) => {
    setWorkOrders(prev =>
      prev.map(wo => wo.id === id ? { ...wo, ...updatedWorkOrder, updated_at: new Date().toISOString() } : wo)
    )
    toast.success('Orden de trabajo actualizada exitosamente')
  }

  const deleteWorkOrder = async (id: string) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('work_orders')
          .delete()
          .eq('id', id)

        if (error) throw error
        setWorkOrders(prev => prev.filter(wo => wo.id !== id))
        toast.success('Orden de trabajo eliminada exitosamente')
      } else {
        setWorkOrders(prev => prev.filter(wo => wo.id !== id))
        toast.success('Orden de trabajo eliminada (Local)')
      }
    } catch (error: any) {
      console.error('Error deleting work order:', error)
      toast.error('Error al eliminar orden: ' + error.message)
    }
  }

  const getWorkOrder = (id: string) => {
    return workOrders.find(wo => wo.id === id)
  }

  // Funciones de mantenimientos
  const addMaintenance = async (newMaintenance: Omit<Maintenance, 'id' | 'created_at'>) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('maintenances')
          .insert([newMaintenance])
          .select()
          .single()

        if (error) throw error
        setMaintenances(prev => [...prev, data as Maintenance])
        toast.success('Mantenimiento programado exitosamente')
      } else {
        const id = Math.max(...maintenances.map(m => m.id), 0) + 1
        const maintenanceWithId: Maintenance = {
          ...newMaintenance,
          id,
          created_at: new Date().toISOString()
        }
        setMaintenances(prev => [...prev, maintenanceWithId])
        toast.success('Mantenimiento programado (Local)')
      }
    } catch (error: any) {
      console.error('Error adding maintenance:', error)
      toast.error('Error al programar mantenimiento: ' + error.message)
    }
  }

  const updateMaintenance = (id: number, updatedMaintenance: Partial<Maintenance>) => {
    setMaintenances(prev =>
      prev.map(m => m.id === id ? { ...m, ...updatedMaintenance } : m)
    )
    toast.success('Mantenimiento actualizado exitosamente')
  }

  const deleteMaintenance = async (id: number) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('maintenances')
          .delete()
          .eq('id', id)

        if (error) throw error
        setMaintenances(prev => prev.filter(m => m.id !== id))
        toast.success('Mantenimiento eliminado exitosamente')
      } else {
        setMaintenances(prev => prev.filter(m => m.id !== id))
        toast.success('Mantenimiento eliminado (Local)')
      }
    } catch (error: any) {
      console.error('Error deleting maintenance:', error)
      toast.error('Error al eliminar mantenimiento: ' + error.message)
    }
  }

  const getMaintenance = (id: number) => {
    return maintenances.find(m => m.id === id)
  }

  // Funciones de combustible
  const addFuelLoad = async (newFuelLoad: Omit<FuelLoad, 'id' | 'created_at'>) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('fuel_loads')
          .insert([newFuelLoad])
          .select()
          .single()

        if (error) throw error
        setFuelLoads(prev => [...prev, data as FuelLoad])
        toast.success('Carga de combustible registrada exitosamente')
      } else {
        const id = Math.max(...fuelLoads.map(f => f.id), 0) + 1
        const fuelLoadWithId: FuelLoad = {
          ...newFuelLoad,
          id,
          created_at: new Date().toISOString()
        }
        setFuelLoads(prev => [...prev, fuelLoadWithId])
        toast.success('Carga de combustible registrada (Local)')
      }
    } catch (error: any) {
      console.error('Error adding fuel load:', error)
      toast.error('Error al registrar carga: ' + error.message)
    }
  }

  const updateFuelLoad = (id: number, updatedFuelLoad: Partial<FuelLoad>) => {
    setFuelLoads(prev =>
      prev.map(f => f.id === id ? { ...f, ...updatedFuelLoad } : f)
    )
    toast.success('Carga de combustible actualizada exitosamente')
  }

  const deleteFuelLoad = (id: number) => {
    setFuelLoads(prev => prev.filter(f => f.id !== id))
    toast.success('Carga de combustible eliminada exitosamente')
  }

  const getFuelLoad = (id: number) => {
    return fuelLoads.find(f => f.id === id)
  }

  // Funciones de repuestos
  const addSparePart = async (newSparePart: Omit<SparePart, 'id' | 'created_at'>) => {
    try {
      const toastId = toast.loading('Guardando repuesto...')

      // Generate a code if not provided (UI might not have the field yet)
      // We look for 'code' in newSparePart, but Omit excludes it? No, Omit<SparePart, 'id' | 'created_at'> includes code.
      // But if the interface didn't have it before, the calling code (UI) definitely doesn't pass it.
      // So we strictly generate it if missing.
      const partData = {
        ...newSparePart,
        code: (newSparePart as any).code || `REP-${Date.now().toString().slice(-6)}`
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('spare_parts')
          .insert([partData])
          .select()
          .single()

        if (error) throw error

        setSpareParts(prev => [...prev, data as SparePart])
        toast.success('Repuesto agregado exitosamente', { id: toastId })
      } else {
        // Fallback for demo/offline logic if supabase is null (shouldn't be, but safe)
        const id = Math.max(...spareParts.map(s => s.id), 0) + 1
        const sparePartWithId: SparePart = {
          ...partData,
          id,
          created_at: new Date().toISOString()
        }
        setSpareParts(prev => [...prev, sparePartWithId])
        toast.success('Repuesto agregado (Local)', { id: toastId })
      }
    } catch (error: any) {
      console.error('Error adding spare part:', error)
      toast.error('Error al guardar: ' + error.message)
    }
  }

  const updateSparePart = (id: number, updatedSparePart: Partial<SparePart>) => {
    setSpareParts(prev =>
      prev.map(s => s.id === id ? { ...s, ...updatedSparePart } : s)
    )
    toast.success('Repuesto actualizado exitosamente')
  }

  const deleteSparePart = (id: number) => {
    setSpareParts(prev => prev.filter(s => s.id !== id))
    toast.success('Repuesto eliminado exitosamente')
  }

  const getSparePart = (id: number) => {
    return spareParts.find(s => s.id === id)
  }

  // Funciones de movimientos de repuestos
  const addPartMovement = (newMovement: Omit<PartMovement, 'id' | 'created_at'>) => {
    const id = Math.max(...partMovements.map(m => m.id), 0) + 1
    const movementWithId: PartMovement = {
      ...newMovement,
      id,
      created_at: new Date().toISOString()
    }

    // Actualizar stock del repuesto
    const part = spareParts.find(p => p.id === newMovement.part_id)
    if (part) {
      const newStock = newMovement.movement_type === 'entrada'
        ? part.current_stock + newMovement.quantity
        : part.current_stock - newMovement.quantity

      if (newStock < 0) {
        toast.error('No hay suficiente stock para esta salida')
        return
      }

      updateSparePart(newMovement.part_id, { current_stock: newStock })
    }

    setPartMovements(prev => [...prev, movementWithId])
    toast.success(`Movimiento de ${newMovement.movement_type === 'entrada' ? 'entrada' : 'salida'} registrado exitosamente`)
  }

  const deletePartMovement = (id: number) => {
    const movement = partMovements.find(m => m.id === id)
    if (movement) {
      // Revertir el cambio en el stock
      const part = spareParts.find(p => p.id === movement.part_id)
      if (part) {
        const newStock = movement.movement_type === 'entrada'
          ? part.current_stock - movement.quantity
          : part.current_stock + movement.quantity

        updateSparePart(movement.part_id, { current_stock: newStock })
      }
    }
    setPartMovements(prev => prev.filter(m => m.id !== id))
    toast.success('Movimiento eliminado exitosamente')
  }

  const getPartMovement = (id: number) => {
    return partMovements.find(m => m.id === id)
  }

  // Funciones de usuarios
  const addUser = async (userData: Omit<User, 'id' | 'created_at'>) => {
    try {
      if (supabase) {
        // Supabase Auth handles user creation usually, but we are inserting into 'users' table.
        // Warning: Usually 'users' table is linked to auth.users. 
        // Here we assume we just insert the record.
        const { data, error } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single()

        if (error) throw error
        setUsers(prev => [...prev, data as User])
        toast.success('Usuario creado exitosamente')
      } else {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }
        setUsers(prev => [...prev, newUser])
      }
    } catch (error: any) {
      console.error('Error adding user:', error)
      toast.error('Error al crear usuario: ' + error.message)
    }
  }

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    // Implementación básica, idealmente actualizar Supabase Auth también si es necesario
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedUser } : u))
    toast.success('Usuario actualizado')
  }

  const deleteUser = (id: string) => {
    // Implementación básica
    setUsers(prev => prev.filter(u => u.id !== id))
    toast.success('Usuario eliminado')
  }

  const getUser = (id: string) => {
    return users.find(u => u.id === id)
  }

  // Funciones de incidentes
  const deleteIncident = async (id: number) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('incidents')
          .delete()
          .eq('id', id)

        if (error) throw error
        setIncidents(prev => prev.filter(i => i.id !== id))
        toast.success('Incidencia eliminada exitosamente')
      } else {
        setIncidents(prev => prev.filter(i => i.id !== id))
        toast.success('Incidencia eliminada (Local)')
      }
    } catch (error: any) {
      console.error('Error deleting incident:', error)
      toast.error('Error al eliminar incidencia: ' + error.message)
    }
  }

  // Funciones de notificaciones
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearNotifications = () => {
    setNotifications([])
  }


  const value: AppContextType = {
    machinery,
    workOrders,
    maintenances,
    fuelLoads,
    spareParts,
    partMovements,
    incidents,
    notifications,
    users,
    addMachinery,
    updateMachinery,
    deleteMachinery,
    getMachinery,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    getWorkOrder,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    getMaintenance,
    addFuelLoad,
    updateFuelLoad,
    deleteFuelLoad,
    getFuelLoad,
    addSparePart, updateSparePart, deleteSparePart, getSparePart,
    addPartMovement, deletePartMovement, getPartMovement,
    addUser, updateUser, deleteUser, getUser, fetchData,
    deleteIncident,
    markNotificationAsRead, clearNotifications
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}



