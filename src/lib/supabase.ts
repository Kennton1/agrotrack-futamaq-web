import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      // Usuarios del sistema
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'administrador' | 'operador' | 'cliente'
          is_active: boolean
          created_at: string
          last_login: string
        }
      }
      // Clientes de FUTAMAQ
      clients: {
        Row: {
          id: number
          name: string
          rut: string
          contact_person: string
          phone: string
          email: string
          address: string
          created_at: string
        }
      }
      // Maquinarias y equipos
      machinery: {
        Row: {
          id: number
          code: string
          patent: string
          type: 'tractor' | 'implemento' | 'camion' | 'cosechadora'
          brand: string
          model: string
          year: number
          total_hours: number
          status: 'disponible' | 'en_faena' | 'en_mantencion' | 'fuera_servicio'
          fuel_capacity: number
          hourly_cost: number
          last_location: any
          created_at: string
        }
      }
      // Órdenes de trabajo
      work_orders: {
        Row: {
          id: string
          client_id: number
          field_name: string
          task_type: string
          description: string
          priority: 'baja' | 'media' | 'alta' | 'critica'
          planned_start_date: string
          planned_end_date: string
          actual_start_date: string
          actual_end_date: string
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
        }
      }
      // Partes diarios de trabajo
      daily_reports: {
        Row: {
          id: number
          work_order_id: string
          date: string
          operator_id: string
          machinery_id: number
          hectares_worked: number
          hours_worked: number
          fuel_consumed: number
          location_start: any
          location_end: any
          observations: string
          photos: string[]
          created_at: string
        }
      }
      // Mantenimientos
      maintenances: {
        Row: {
          id: number
          machinery_id: number
          type: 'preventiva' | 'correctiva'
          status: 'programada' | 'en_ejecucion' | 'completada' | 'vencida'
          scheduled_date: string
          completion_date: string
          description: string
          cost: number
          parts_used: any
          technician: string
          odometer_hours: number
          created_at: string
        }
      }
      // Control de combustible
      fuel_loads: {
        Row: {
          id: number
          machinery_id: number
          operator_id: string
          date: string
          liters: number
          total_cost: number
          cost_per_liter: number
          work_order_id: string
          source: 'bodega' | 'estacion'
          created_at: string
        }
      }
      // Inventario repuestos
      spare_parts: {
        Row: {
          id: number
          code: string
          description: string
          category: string
          current_stock: number
          minimum_stock: number
          unit_cost: number
          supplier: string
          created_at: string
        }
      }
      // Incidencias reportadas
      incidents: {
        Row: {
          id: number
          work_order_id: string
          type: 'mecanica' | 'climatica' | 'operacional' | 'otra'
          title: string
          description: string
          status: 'abierta' | 'en_curso' | 'resuelta'
          reporter_id: string
          assigned_to: string
          photos: string[]
          location: any
          created_at: string
          resolved_at: string
        }
      }
    }
  }
}
