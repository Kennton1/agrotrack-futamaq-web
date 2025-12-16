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
  type: 'incident' | 'maintenance' | 'fuel' | 'stock' | 'system' | 'work_order' | 'machinery'
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
  const [incidents, setIncidents] = useState<Incident[]>(() =>
    loadFromStorage('incidents', [])
  )
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'maintenance',
      title: 'Mantenimiento Programado',
      message: 'El tractor T001 requiere mantenimiento preventivo en las próximas 24 horas',
      timestamp: '2024-03-25T07:30:00Z',
      read: false,
      link: '/mantenimientos'
    },
    {
      id: '2',
      type: 'fuel',
      title: 'Consumo Anómalo de Combustible',
      message: 'El tractor T002 ha consumido 50% más combustible de lo normal en las últimas 2 horas',
      timestamp: '2024-03-25T09:15:00Z',
      read: false,
      link: '/combustible'
    },
    {
      id: '3',
      type: 'stock',
      title: 'Stock Bajo de Repuestos',
      message: 'Filtro de aceite motor (FIL-001) está por debajo del stock mínimo',
      timestamp: '2024-03-25T08:45:00Z',
      read: true,
      link: '/repuestos'
    },
    {
      id: '4',
      type: 'work_order',
      title: 'Orden de Trabajo Completada',
      message: 'La orden OT-2024-001 ha sido completada exitosamente',
      timestamp: '2024-03-25T07:20:00Z',
      read: true,
      link: '/ordenes-trabajo'
    },
    {
      id: '5',
      type: 'system',
      title: 'Respaldo Completado',
      message: 'El respaldo automático de la base de datos se completó exitosamente',
      timestamp: '2024-03-25T06:00:00Z',
      read: true
    },
    {
      id: '6',
      type: 'machinery',
      title: 'Maquinaria Fuera de Servicio',
      message: 'El pulverizador PUL001 ha sido marcado como fuera de servicio',
      timestamp: '2024-03-24T16:30:00Z',
      read: false,
      link: '/maquinarias'
    },
    {
      id: '7',
      type: 'fuel',
      title: 'Carga de Combustible Registrada',
      message: 'Se registró una carga de 150L de combustible para el tractor T001',
      timestamp: '2024-03-24T14:15:00Z',
      read: true,
      link: '/combustible'
    },
    {
      id: '8',
      type: 'system',
      title: 'Error de Conexión',
      message: 'Se perdió la conexión con el servidor de ubicación GPS',
      timestamp: '2024-03-24T12:00:00Z',
      read: false
    }
  ])

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
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        // Safety check: If session/token is causing 431 errors, sign out
        if (sessionError && sessionError.message.includes('431')) {
          console.warn('431 Error detected, clearing session...')
          await supabase.auth.signOut()
          localStorage.clear()
          window.location.reload()
          return
        }

        const session = sessionData?.session

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
      const { data: workOrdersData } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (workOrdersData) setWorkOrders(workOrdersData as WorkOrder[])

      // Fetch maintenance
      const { data: maintenancesData } = await supabase
        .from('maintenances')
        .select('*')
        .order('created_at', { ascending: false })
      if (maintenancesData) setMaintenances(maintenancesData as Maintenance[])

      // Fetch Incidents
      console.log('Fetching incidents...')
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (incidentsError) {
        console.error('Error fetching incidents:', incidentsError)
      } else if (incidentsData) {
        console.log(`Fetched ${incidentsData.length} incidents`)
        setIncidents(incidentsData as Incident[])
      }

      // Fetch Fuel Loads
      const { data: fuelLoadsData } = await supabase
        .from('fuel_loads')
        .select('*')
        .order('date', { ascending: false })
      if (fuelLoadsData) setFuelLoads(fuelLoadsData as FuelLoad[])

    } catch (error: any) {
      console.error('Error fetching data:', error)

      // Auto-fix for 431/400 errors (Header too large / Bad Request)
      const errorStr = JSON.stringify(error)
      if (error?.message?.includes('431') || errorStr.includes('431') ||
        error?.message?.includes('400') || errorStr.includes('Bad Request')) {
        console.warn('⚠️ DETECTADO ERROR CRÍTICO DE SESIÓN (431/400) - Limpiando sesión corrupta...')

        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
          // Forzar expiración de cookies
          document.cookie.split(";").forEach(function (c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });

          setTimeout(() => window.location.reload(), 1000)
        }
      }
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
            link: `/incidencias?id=${newIncident.id}`
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
      const parts = base64Data.split(',')
      if (parts.length < 2) throw new Error('Invalid base64 data')

      const base64Content = parts[1]
      const mimeMatch = base64Data.match(/^data:(.*?);base64/)
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'

      const byteCharacters = atob(base64Content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })

      console.log(`Uploading image to ${path}:`, { mimeType, size: blob.size })

      const { data, error } = await supabase.storage
        .from('images')
        .upload(path, blob, {
          contentType: mimeType,
          upsert: true
        })

      if (error) {
        console.warn('Supabase Client Upload failed, attempting fetch fallback...', error)
        // Fallback via simple FETCH
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        const url = `${supabaseUrl}/storage/v1/object/images/${path}`
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'omit', // CRITICAL: Skip corrupt cookies
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey || '',
            'Content-Type': mimeType,
            'x-upsert': 'true'
          },
          body: blob
        })

        if (!response.ok) {
          throw error // Throw original error if fallback also fails
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(path)

      return publicUrl
    } catch (error: any) {
      console.error('Error uploading image to Supabase:', error)
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

          const uploadPromises = processedImages.map(async (img) => {
            if (img.url.startsWith('data:')) {
              const fileName = `machinery/${Date.now()}_${img.id.replace(/[^a-zA-Z0-9-_]/g, '')}.${img.url.split(';')[0].split('/')[1]}`
              const publicUrl = await uploadImageToSupabase(img.url, fileName)
              if (publicUrl) {
                return { ...img, url: publicUrl }
              }
              // Si falla la subida, retornamos null para filtrarlo después
              return null
            }
            return img
          })

          const results = await Promise.all(uploadPromises)
          processedImages = results.filter((img): img is MachineryImage => img !== null)

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

  const updateMachinery = async (id: number, updatedMachinery: Partial<Machinery>) => {
    try {
      if (supabase) {
        // Process images if they exist
        let processedImages = updatedMachinery.images

        if (processedImages && processedImages.length > 0) {
          // Check if there are any new images (base64)
          const hasNewImages = processedImages.some(img => img.url.startsWith('data:'))

          if (hasNewImages) {
            const toastId = toast.loading('Subiendo nuevas imágenes...')

            const uploadPromises = processedImages.map(async (img) => {
              if (img.url.startsWith('data:')) {
                // Generate filename: machinery/TIMESTAMP_ID.EXT
                const match = img.url.match(/^data:(image\/[a-z]+);base64,/)
                const ext = match ? match[1].split('/')[1] : 'jpg'
                const safeId = img.id.replace(/[^a-zA-Z0-9-_]/g, '')
                const fileName = `machinery/${Date.now()}_${safeId}.${ext}`

                const publicUrl = await uploadImageToSupabase(img.url, fileName)
                if (publicUrl) {
                  return { ...img, url: publicUrl }
                }
                return null
              }
              return img
            })

            const results = await Promise.all(uploadPromises)
            processedImages = results.filter((img): img is MachineryImage => img !== null)

            toast.dismiss(toastId)
          }
        }

        // Prepare update data
        const updateData = { ...updatedMachinery }
        if (processedImages) {
          updateData.images = processedImages
        }

        const { data, error } = await supabase
          .from('machinery')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        setMachinery(prev =>
          prev.map(m => m.id === id ? { ...m, ...data } : m)
        )
        toast.success('Maquinaria actualizada exitosamente')
      } else {
        // Fallback Local
        setMachinery(prev =>
          prev.map(m => m.id === id ? { ...m, ...updatedMachinery } : m)
        )
        toast.success('Maquinaria actualizada (Local)')
      }
    } catch (error: any) {
      console.error('Error updating machinery:', error)
      toast.error('Error al actualizar maquinaria: ' + error.message)

      // Fallback local en caso de error
      setMachinery(prev =>
        prev.map(m => m.id === id ? { ...m, ...updatedMachinery } : m)
      )
    }
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
        // Generar ID único usando la base de datos para evitar colisiones
        const now = new Date()
        const year = now.getFullYear()

        // Formato ID: OT-AAAA-SEQ (Ej: OT-2025-003)
        const prefix = `OT-${year}-`
        let nextSeq = 1

        try {
          // Intentar consultar la ÚLTIMA orden creada (globalmente) para mantener la secuencia
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))

          const dbPromise = supabase
            .from('work_orders')
            .select('id')
            .order('created_at', { ascending: false }) // Ordenar por fecha creación descendente
            .limit(1)

          const result: any = await Promise.race([dbPromise, timeoutPromise])
          const { data: lastConfig, error: idError } = result

          if (!idError && lastConfig && lastConfig.length > 0) {
            const lastId = lastConfig[0].id
            const parts = lastId.split('-')
            // Asumimos formato OT-FECHA-SECUENCIA
            if (parts.length >= 3) {
              const lastSeqPart = parts[parts.length - 1] // Última parte es la secuencia
              const currentSeq = parseInt(lastSeqPart, 10)
              if (!isNaN(currentSeq)) {
                nextSeq = currentSeq + 1
              }
            }
          }
        } catch (err) {
          console.warn('Error consultando secuencia global, intentando cálculo local:', err)

          // Fallback Local: Buscar el ID con el número de secuencia más alto en TODAS las órdenes locales
          let maxSeq = 0
          workOrders.forEach(wo => {
            const parts = wo.id.split('-')
            if (parts.length >= 3) {
              const seq = parseInt(parts[parts.length - 1], 10)
              if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
            }
          })
          nextSeq = maxSeq + 1
        }

        // Ensure nextSeq is valid
        if (isNaN(nextSeq) || nextSeq < 1) nextSeq = 1

        const id = `${prefix}${String(nextSeq).padStart(3, '0')}`

        // Check if ID already exists locally (just in case of collision with today's date prefix)
        if (workOrders.some(wo => wo.id === id)) {
          console.warn(`ID conflict detected locally for ${id}, incrementing...`)
          // Si colisiona, simplemente incrementamos hasta encontrar hueco
          let tempSeq = nextSeq
          let tempId = id
          while (workOrders.some(wo => wo.id === tempId)) {
            tempSeq++
            tempId = `${prefix}${String(tempSeq).padStart(3, '0')}`
          }
          nextSeq = tempSeq
        }
        const finalId = `${prefix}${String(nextSeq).padStart(3, '0')}`

        // Limpiar el objeto de valores nulos o indefinidos que podrían causar problemas
        // y asegurar que campos opcionales sean manejados correctamente
        const workOrderData = {
          id: finalId,
          client_id: newWorkOrder.client_id,
          field_name: newWorkOrder.field_name,
          task_type: newWorkOrder.task_type,
          description: newWorkOrder.description,
          priority: newWorkOrder.priority,
          planned_start_date: newWorkOrder.planned_start_date,
          planned_end_date: newWorkOrder.planned_end_date,
          status: newWorkOrder.status,
          assigned_machinery: newWorkOrder.assigned_machinery || [],
          target_hectares: newWorkOrder.target_hectares || 0,
          // Campos opcionales: solo incluirlos si tienen valor
          ...(newWorkOrder.assigned_operator ? { assigned_operator: newWorkOrder.assigned_operator } : { assigned_operator: null }),
          ...(newWorkOrder.actual_start_date ? { actual_start_date: newWorkOrder.actual_start_date } : {}),
          ...(newWorkOrder.actual_end_date ? { actual_end_date: newWorkOrder.actual_end_date } : {}),
          target_hours: newWorkOrder.target_hours || 0,
          actual_hectares: newWorkOrder.actual_hectares || 0,
          actual_hours: newWorkOrder.actual_hours || 0,
          progress_percentage: newWorkOrder.progress_percentage || 0
        }

        console.log('Enviando orden a Supabase:', workOrderData)

        let data: WorkOrder | null = null;
        let error: any = null;
        try {
          const result = await supabase
            .from('work_orders')
            .insert([workOrderData])
            .select()
            .single()

          data = result.data as WorkOrder
          error = result.error
        } catch (fetchError: any) {
          console.error("CRITICAL: Supabase INSERT failed with exception, falling back to local update:", fetchError)
          // Don't throw, just treat as offline/error and save locally
          error = { message: fetchError.message || 'Network error', details: 'Offline fallback triggered', hint: 'Saved locally', code: 'OFFLINE' }
        }

        if (error) {
          console.warn('Supabase insert failed, saving locally:', error)
          // If it was a network error or explicitly handled, we might want to save it locally
          // Construct the object manually since 'data' is undefined
          const offlineOrder: WorkOrder = {
            id: workOrderData.id,
            client_id: workOrderData.client_id,
            field_name: workOrderData.field_name,
            task_type: workOrderData.task_type,
            description: workOrderData.description,
            priority: workOrderData.priority,
            planned_start_date: workOrderData.planned_start_date,
            planned_end_date: workOrderData.planned_end_date,
            status: workOrderData.status,
            assigned_machinery: workOrderData.assigned_machinery,
            target_hectares: workOrderData.target_hectares,
            target_hours: workOrderData.target_hours,
            actual_hectares: workOrderData.actual_hectares,
            actual_hours: workOrderData.actual_hours,
            progress_percentage: workOrderData.progress_percentage,
            actual_start_date: workOrderData.actual_start_date || null,
            actual_end_date: workOrderData.actual_end_date || null,
            assigned_operator: workOrderData.assigned_operator || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setWorkOrders(prev => [offlineOrder, ...prev])
          toast.success(`Orden creada (Modo Offline/Error de Red): ${finalId}`)
          return // Return early so we don't hit the success block below or the outer catch
        }

        setWorkOrders(prev => [data as WorkOrder, ...prev])
        toast.success(`Orden de trabajo creada: ${finalId}`)
      } else {
        // Fallback local sin Supabase
        const now = new Date()
        const year = now.getFullYear()
        const prefix = `OT-${year}-`

        const yearOrders = workOrders.filter(wo => wo.id.startsWith(prefix))
        let maxSeq = 0
        yearOrders.forEach(wo => {
          const parts = wo.id.split('-')
          if (parts.length === 3) {
            const seq = parseInt(parts[2], 10)
            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
          }
        })
        const id = `${prefix}${String(maxSeq + 1).padStart(3, '0')}`

        const workOrderWithId: WorkOrder = {
          ...newWorkOrder,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setWorkOrders(prev => [workOrderWithId, ...prev])
        toast.success(`Orden de trabajo creada (Local): ${id}`)
      }
    } catch (error: any) {
      console.error('Error adding work order:', error)
      // Mostrar mensaje más detallado si está disponible
      const errorMessage = error.details || error.message || 'Error desconocido'
      const errorHint = error.hint ? ` (${error.hint})` : ''
      toast.error(`Error al crear orden: ${errorMessage}${errorHint}`)
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
        let error;
        try {
          const { error: deleteError } = await supabase
            .from('work_orders')
            .delete()
            .eq('id', id)
          error = deleteError
        } catch (fetchError: any) {
          console.error("Supabase DELETE exception:", fetchError)
          error = { message: fetchError.message || 'Network Error', code: 'OFFLINE_EXCEPTION' } as any
        }

        // Si hay error, verificamos si es de red/CORS para hacer fallback local
        if (error) {
          console.warn('Error eliminando en Supabase:', error)
          const isNetworkError = error.message?.includes('fetch') ||
            error.message?.includes('network') ||
            error.message?.includes('connection') ||
            // Supabase-js sometimes returns null code for fetch errors, or specific strings
            !error.code;

          if (isNetworkError) {
            toast('Eliminada localmente (Error de conexión)', { icon: '⚠️' });
            // Continuamos a eliminar localmente abajo
          } else {
            // Si es otro error (ej: permisos), lanzamos la excepción
            throw error
          }
        }

        setWorkOrders(prev => prev.filter(wo => wo.id !== id))
        if (!error) toast.success('Orden de trabajo eliminada exitosamente')
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
      // Intentar guardar en Supabase primero
      if (supabase) {
        let data: Maintenance | null = null
        let error: any = null

        try {
          const result = await supabase
            .from('maintenances')
            .insert([newMaintenance])
            .select()
            .single()

          data = result.data as Maintenance
          error = result.error
        } catch (fetchError: any) {
          console.warn('Supabase fetch/network error:', fetchError)
          // Crear un objeto de error que active el fallback
          error = {
            message: fetchError.message || 'Network error',
            details: 'Offline fallback triggered',
            code: 'OFFLINE'
          } as any
        }

        if (error) {
          console.warn('Supabase insert failed, falling back to local:', error)

          // Fallback Local
          const id = Math.max(...maintenances.map(m => m.id), 0) + 1
          const maintenanceWithId: Maintenance = {
            ...newMaintenance,
            id,
            created_at: new Date().toISOString()
          }
          setMaintenances(prev => [...prev, maintenanceWithId])
          toast.success('Mantenimiento programado (Modo Offline/Local)')
          return
        }

        // Éxito en Supabase
        setMaintenances(prev => [...prev, data as Maintenance])
        toast.success('Mantenimiento programado exitosamente')
      } else {
        // Fallback si no hay cliente Supabase
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
      toast.error('Error crítico al programar mantenimiento: ' + error.message)
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



