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
  photos?: FuelFile[]
}

export interface FuelFile {
  id: string
  url: string
  type: 'image' | 'document'
  name: string
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

export interface Client {
  id: number
  name: string
  rut: string
  contact_person: string
  phone: string
  email: string
  address: string
  created_at: string
  updated_at: string
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
  severity: 'baja' | 'media' | 'alta' | 'critica'
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
  clients: Client[]

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

  // Funciones de clientes
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client | null>
  updateClient: (id: number, client: Partial<Client>) => Promise<void>
  deleteClient: (id: number) => Promise<void>

  // Funciones de notificaciones
  markNotificationAsRead: (id: string) => void
  markAllAsRead: () => void
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
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage('notifications', [])
  )
  const [clients, setClients] = useState<Client[]>(() =>
    loadFromStorage('clients', [])
  )

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
      console.log('🚀 Iniciando carga paralela de datos...')
      const [
        { data: usersData },
        { data: sessionDataRes, error: sessionError },
        { data: machineryData },
        { data: workOrdersData },
        { data: maintenancesData },
        { data: incidentsData, error: incidentsError },
        { data: fuelLoadsData },
        { data: sparePartsData },
        { data: partMovementsData },
        { data: clientsData }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.auth.getSession(),
        supabase.from('machinery').select('*'),
        supabase.from('work_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('maintenances').select('*').order('created_at', { ascending: false }),
        supabase.from('incidents').select('*').order('created_at', { ascending: false }),
        supabase.from('fuel_loads').select('*').order('date', { ascending: false }),
        supabase.from('spare_parts').select('*').order('description', { ascending: true }),
        supabase.from('part_movements').select('*').order('date', { ascending: false }),
        supabase.from('clients').select('*').order('name', { ascending: true })
      ])

      // 1. Procesar Usuarios y Sesión
      if (usersData) {
        setUsers(usersData as User[])

        if (sessionError && sessionError.message.includes('431')) {
          console.warn('431 Error detected, clearing session...')
          await supabase.auth.signOut()
          localStorage.clear()
          window.location.reload()
          return
        }

        const session = sessionDataRes?.session
        if (session?.user) {
          const publicUser = usersData.find((u: any) => u.email === session.user.email)
          if (!publicUser) {
            console.log('🔄 Sincronizando usuario de Auth a tabla pública...')
            const newUserPublicData = {
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || 'Nuevo Usuario',
              role: session.user.user_metadata?.role || 'operador',
              avatar_url: session.user.user_metadata?.avatar_url || null,
              is_active: true,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            }
            const { error: insertError } = await supabase.from('users').insert([newUserPublicData])
            if (!insertError) setUsers(prev => [...prev, newUserPublicData as any])
          } else if (publicUser && (publicUser.avatar_url !== session.user.user_metadata?.avatar_url || publicUser.full_name !== session.user.user_metadata?.full_name)) {
            console.log('🔄 Actualizando datos de usuario en tabla pública...')
            const updatedData = {
              full_name: session.user.user_metadata?.full_name || publicUser.full_name,
              avatar_url: session.user.user_metadata?.avatar_url || publicUser.avatar_url,
              last_login: new Date().toISOString()
            }
            await supabase.from('users').update(updatedData).eq('id', publicUser.id)
            setUsers(prev => prev.map(u => u.id === publicUser.id ? { ...u, ...updatedData } : u))
          }
        }
      }

      // 2. Cargar el resto de los datos
      if (machineryData) setMachinery(machineryData as Machinery[])
      if (workOrdersData) setWorkOrders(workOrdersData as WorkOrder[])
      if (maintenancesData) setMaintenances(maintenancesData as Maintenance[])

      if (incidentsError) {
        console.error('Error fetching incidents:', incidentsError)
      } else if (incidentsData) {
        setIncidents(incidentsData as Incident[])
      }

      if (fuelLoadsData) setFuelLoads(fuelLoadsData as FuelLoad[])
      if (sparePartsData) setSpareParts(sparePartsData as SparePart[])
      if (partMovementsData) setPartMovements(partMovementsData as PartMovement[])
      if (clientsData) setClients(clientsData as Client[])

      console.log('✅ Carga de datos completada')

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


  // Efectos para persistencia con DEBOUNCE para mayor fluidez de la UI
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToStorage('workOrders', workOrders)
      saveToStorage('maintenances', maintenances)
      saveToStorage('fuelLoads', fuelLoads)
      saveToStorage('spareParts', spareParts)
      saveToStorage('partMovements', partMovements)
      saveToStorage('incidents', incidents)
      saveToStorage('users', users)
      saveToStorage('notifications', notifications)
      saveToStorage('machinery', machinery)
      saveToStorage('clients', clients)
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timer)
  }, [workOrders, maintenances, fuelLoads, spareParts, partMovements, incidents, users, notifications, machinery, clients])

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
    // Optimistic update
    const previousMachinery = [...machinery]
    setMachinery(prev => prev.filter(m => m.id !== id))

    try {
      if (supabase) {
        const { error } = await supabase
          .from('machinery')
          .delete()
          .eq('id', id)

        if (error) {
          // Revert on error
          setMachinery(previousMachinery)
          throw error
        }
        toast.success('Maquinaria eliminada exitosamente')
      } else {
        toast.success('Maquinaria eliminada (Local)')
      }
    } catch (error: any) {
      console.error('Error deleting machinery:', error)
      toast.error('Error al eliminar maquinaria: ' + error.message)
      // Note: Machinery is already reverted in the 'if (error)' block for supabase errors
    }
  }

  const getMachinery = (id: number) => {
    return machinery.find(m => m.id === id)
  }

  // Funciones de órdenes de trabajo
  const addWorkOrder = async (newWorkOrder: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => {
    // 1. Generar ID localmente de forma inmediata para optimismo
    const now = new Date()
    const year = now.getFullYear()
    const prefix = `OT-${year}-`

    // Cálculo de secuencia local basado en el estado actual para el año actual
    let maxSeq = 0
    workOrders.forEach(wo => {
      if (wo.id.startsWith(prefix)) {
        const parts = wo.id.split('-')
        const seq = parseInt(parts[parts.length - 1], 10)
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
      }
    })
    const finalId = `${prefix}${String(maxSeq + 1).padStart(3, '0')}`

    const optimisticOrder: WorkOrder = {
      ...newWorkOrder,
      id: finalId,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      progress_percentage: 0,
      actual_hectares: 0,
      actual_hours: 0,
      actual_start_date: null,
      actual_end_date: null
    }

    // 2. Actualización de estado inmediata
    setWorkOrders(prev => [optimisticOrder, ...prev])
    toast.success('Orden de trabajo creada localmente')

    // 3. Sincronización en segundo plano con Supabase
    try {
      if (supabase) {
        // Limpiamos datos para la DB
        const workOrderData = {
          ...optimisticOrder,
          assigned_machinery: optimisticOrder.assigned_machinery || [],
          assigned_operator: optimisticOrder.assigned_operator || null
        }

        const { error } = await supabase.from('work_orders').insert([workOrderData])
        if (error) {
          console.warn('Error sincronizando orden con Supabase, se mantiene local:', error)
          // No revertimos porque ya está en localStorage y el usuario puede seguir trabajando
        } else {
          console.log('✅ Orden sincronizada con éxito')
        }
      }
    } catch (err) {
      console.error('Error background sync:', err)
    }
  }

  const updateWorkOrder = (id: string, updatedWorkOrder: Partial<WorkOrder>) => {
    setWorkOrders(prev =>
      prev.map(wo => wo.id === id ? { ...wo, ...updatedWorkOrder, updated_at: new Date().toISOString() } : wo)
    )
    toast.success('Orden de trabajo actualizada exitosamente')
  }

  const deleteWorkOrder = async (id: string) => {
    // Optimistic update
    const previousWorkOrders = [...workOrders]
    setWorkOrders(prev => prev.filter(wo => wo.id !== id))

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
            !error.code;

          if (isNetworkError) {
            toast('Eliminada localmente (Error de conexión)', { icon: '⚠️' });
          } else {
            // Revert state for non-network errors
            setWorkOrders(previousWorkOrders)
            throw error
          }
        } else {
          toast.success('Orden de trabajo eliminada exitosamente')
        }
      } else {
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

  // Helper para limpiar el payload de combustible
  const sanitizeFuelLoadPayload = (data: Partial<FuelLoad>) => {
    const allowedColumns = [
      'machinery_id', 'operator_id', 'operator', 'date', 'liters',
      'total_cost', 'cost_per_liter', 'work_order_id', 'source',
      'location', 'photos'
    ]

    const cleanPayload: any = {}

    Object.keys(data).forEach(key => {
      if (allowedColumns.includes(key)) {
        cleanPayload[key] = (data as any)[key]
      }
    })

    return cleanPayload
  }

  // Funciones de combustible
  const addFuelLoad = async (newFuelLoad: Omit<FuelLoad, 'id' | 'created_at'>) => {
    try {
      if (supabase) {
        // Process photos/documents if any
        let processedPhotos = newFuelLoad.photos || []

        if (processedPhotos.length > 0) {
          const toastId = toast.loading('Subiendo archivos...')

          processedPhotos = await Promise.all(processedPhotos.map(async (file) => {
            if (file.url.startsWith('data:')) {
              // Extract extension and mime type
              const mimeType = file.url.split(';')[0].split(':')[1]
              const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1]
              // Use timestamp and sanitized filename
              const fileName = `fuel/${Date.now()}_${file.id.replace(/[^a-zA-Z0-9-_]/g, '')}.${extension}`

              const publicUrl = await uploadImageToSupabase(file.url, fileName)
              if (publicUrl) {
                return { ...file, url: publicUrl }
              }
            }
            return file
          }))

          toast.dismiss(toastId)
        }

        // Sanitize payload using whitelist
        const payload = sanitizeFuelLoadPayload(newFuelLoad)

        const { data, error } = await supabase
          .from('fuel_loads')
          .insert([{
            ...payload,
            photos: processedPhotos
          }])
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

  const updateFuelLoad = async (id: number, updatedFuelLoad: Partial<FuelLoad>) => {
    try {
      if (supabase) {
        // Process photos if present
        let processedPhotos = updatedFuelLoad.photos

        if (processedPhotos && processedPhotos.length > 0) {
          // Check if any need upload
          const needsUpload = processedPhotos.some(p => p.url.startsWith('data:'))

          if (needsUpload) {
            const toastId = toast.loading('Subiendo archivos actualizados...')

            processedPhotos = await Promise.all(processedPhotos.map(async (file) => {
              if (file.url.startsWith('data:')) {
                const mimeType = file.url.split(';')[0].split(':')[1]
                const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1]
                const fileName = `fuel/${Date.now()}_${file.id.replace(/[^a-zA-Z0-9-_]/g, '')}.${extension}`

                const publicUrl = await uploadImageToSupabase(file.url, fileName)
                if (publicUrl) {
                  return { ...file, url: publicUrl }
                }
                // If upload fails, filter it out later
                return null as any
              }
              return file
            }))

            // Filter failed uploads
            processedPhotos = processedPhotos.filter(p => p !== null)
            toast.dismiss(toastId)
          }
        }

        // Sanitize payload using whitelist
        const payload = sanitizeFuelLoadPayload(updatedFuelLoad)

        const { data, error } = await supabase
          .from('fuel_loads')
          .update({
            ...payload,
            ...(processedPhotos && { photos: processedPhotos })
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        setFuelLoads(prev =>
          prev.map(f => f.id === id ? (data as FuelLoad) : f)
        )
        toast.success('Carga de combustible actualizada exitosamente')
      } else {
        setFuelLoads(prev =>
          prev.map(f => f.id === id ? { ...f, ...updatedFuelLoad } : f)
        )
        toast.success('Carga de combustible actualizada (Local)')
      }
    } catch (error: any) {
      console.error('Error updating fuel load:', error)
      toast.error('Error al actualizar carga: ' + error.message)
    }
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

  const updateSparePart = async (id: number, updatedSparePart: Partial<SparePart>) => {
    try {
      // Optimistic update
      setSpareParts(prev =>
        prev.map(s => s.id === id ? { ...s, ...updatedSparePart } : s)
      )

      if (supabase) {
        const { error } = await supabase
          .from('spare_parts')
          .update(updatedSparePart)
          .eq('id', id)

        if (error) throw error
        toast.success('Repuesto actualizado exitosamente')
      }
    } catch (error: any) {
      console.error('Error updating spare part:', error)
      toast.error('Error al actualizar: ' + error.message)
      // En una implementación real, aquí deberíamos revertir el estado si falla
    }
  }

  const deleteSparePart = async (id: number) => {
    try {
      // Optimistic update
      setSpareParts(prev => prev.filter(s => s.id !== id))

      if (supabase) {
        const { error } = await supabase
          .from('spare_parts')
          .delete()
          .eq('id', id)

        if (error) throw error
        toast.success('Repuesto eliminado exitosamente')
      }
    } catch (error: any) {
      console.error('Error deleting spare part:', error)
      toast.error('Error al eliminar: ' + error.message)
    }
  }

  const getSparePart = (id: number) => {
    return spareParts.find(s => s.id === id)
  }

  // Funciones de movimientos de repuestos
  const addPartMovement = async (newMovement: Omit<PartMovement, 'id' | 'created_at'>) => {
    try {
      // 1. Actualizar stock del repuesto primero (Optimista)
      const part = spareParts.find(p => p.id === newMovement.part_id)
      if (part) {
        const newStock = newMovement.movement_type === 'entrada'
          ? part.current_stock + newMovement.quantity
          : part.current_stock - newMovement.quantity

        if (newStock < 0) {
          toast.error('No hay suficiente stock para esta salida')
          return
        }

        await updateSparePart(newMovement.part_id, { current_stock: newStock })
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('part_movements')
          .insert([newMovement])
          .select()
          .single()

        if (error) throw error
        setPartMovements(prev => [data as PartMovement, ...prev])
        toast.success(`Movimiento de ${newMovement.movement_type === 'entrada' ? 'entrada' : 'salida'} registrado`)
      } else {
        const id = Math.max(...partMovements.map(m => m.id), 0) + 1
        const movementWithId: PartMovement = {
          ...newMovement,
          id,
          created_at: new Date().toISOString()
        }
        setPartMovements(prev => [movementWithId, ...prev])
        toast.success(`Movimiento registrado (Local)`)
      }
    } catch (error: any) {
      console.error('Error adding part movement:', error)
      toast.error('Error al registrar movimiento: ' + error.message)
    }
  }

  const deletePartMovement = async (id: number) => {
    try {
      const movement = partMovements.find(m => m.id === id)
      if (movement) {
        // Revertir el cambio en el stock
        const part = spareParts.find(p => p.id === movement.part_id)
        if (part) {
          const newStock = movement.movement_type === 'entrada'
            ? part.current_stock - movement.quantity
            : part.current_stock + movement.quantity

          await updateSparePart(movement.part_id, { current_stock: newStock })
        }
      }

      if (supabase) {
        const { error } = await supabase
          .from('part_movements')
          .delete()
          .eq('id', id)

        if (error) throw error
      }

      setPartMovements(prev => prev.filter(m => m.id !== id))
      toast.success('Movimiento eliminado exitosamente')
    } catch (error: any) {
      console.error('Error deleting movement:', error)
      toast.error('Error al eliminar: ' + error.message)
    }
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
    // Optimistic update
    const previousIncidents = [...incidents]
    setIncidents(prev => prev.filter(i => i.id !== id))

    try {
      if (supabase) {
        const { error } = await supabase
          .from('incidents')
          .delete()
          .eq('id', id)

        if (error) {
          // Revert on error
          setIncidents(previousIncidents)
          throw error
        }
        toast.success('Incidencia eliminada exitosamente')
      } else {
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

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('Todas las notificaciones marcadas como leídas')
  }

  const clearNotifications = () => {
    setNotifications([])
  }


  // Funciones de Clientes
  const addClient = async (newClient: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('clients')
          .insert([{ ...newClient }])
          .select()
          .single()

        if (error) throw error
        setClients(prev => [...prev, data as Client])
        toast.success('Cliente agregado exitosamente')
        return data as Client
      } else {
        const id = Math.max(...clients.map(c => c.id), 0) + 1
        const clientWithId = {
          ...newClient,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setClients(prev => [...prev, clientWithId])
        toast.success('Cliente agregado (Local)')
        return clientWithId
      }
    } catch (error: any) {
      console.error('Error adding client:', error)
      toast.error('Error al agregar cliente')
      return null
    }
  }

  const updateClient = async (id: number, updatedClient: Partial<Client>) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('clients')
          .update(updatedClient)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
        toast.success('Cliente actualizado exitosamente')
      } else {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } as Client : c))
        toast.success('Cliente actualizado (Local)')
      }
    } catch (error: any) {
      console.error('Error updating client:', error)
      toast.error('Error al actualizar cliente')
    }
  }

  const deleteClient = async (id: number) => {
    const previousClients = [...clients]
    setClients(prev => prev.filter(c => c.id !== id))
    try {
      if (supabase) {
        const { error } = await supabase.from('clients').delete().eq('id', id)
        if (error) throw error
        toast.success('Cliente eliminado exitosamente')
      } else {
        toast.success('Cliente eliminado (Local)')
      }
    } catch (error: any) {
      console.error('Error deleting client:', error)
      toast.error('Error al eliminar cliente')
      setClients(previousClients)
    }
  }

  const value: AppContextType = React.useMemo(() => ({
    machinery,
    workOrders,
    maintenances,
    fuelLoads,
    spareParts,
    partMovements,
    incidents,
    notifications,
    users,
    clients,
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
    markNotificationAsRead,
    markAllAsRead,
    clearNotifications,
    deleteIncident,
    addClient,
    updateClient,
    deleteClient
  }), [
    machinery, workOrders, maintenances, fuelLoads, spareParts, partMovements,
    incidents, notifications, users, clients,
    addMachinery, updateMachinery, deleteMachinery, getMachinery,
    addWorkOrder, updateWorkOrder, deleteWorkOrder, getWorkOrder,
    addMaintenance, updateMaintenance, deleteMaintenance, getMaintenance,
    addFuelLoad, updateFuelLoad, deleteFuelLoad, getFuelLoad,
    addSparePart, updateSparePart, deleteSparePart, getSparePart,
    addPartMovement, deletePartMovement, getPartMovement,
    addUser, updateUser, deleteUser, getUser, fetchData,
    markNotificationAsRead, markAllAsRead, clearNotifications, deleteIncident,
    addClient, updateClient, deleteClient // Although these are recreated on render, it's fine for now or wrap them in useCallback if needed
  ])

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



