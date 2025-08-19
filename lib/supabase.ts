import { createClient } from "@supabase/supabase-js"

// Validar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificar si Supabase está configurado correctamente
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your_supabase_project_url" &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseAnonKey !== "your_supabase_anon_key" &&
  supabaseUrl.includes("supabase.co") &&
  supabaseAnonKey.startsWith("eyJ")

// Cliente Supabase (solo si está configurado)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null

// Estado de configuración
export const isSupabaseReady = isSupabaseConfigured

// Función helper para verificar si Supabase está listo
export function checkSupabaseConfig() {
  return {
    isConfigured: isSupabaseConfigured,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isValidUrl: supabaseUrl?.includes("supabase.co") || false,
    isValidKey: supabaseAnonKey?.startsWith("eyJ") || false,
  }
}

// Tipos de la base de datos
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: "user" | "admin"
  phone?: string
  created_at: string
  updated_at: string
}

export interface Establecimiento {
  id: string
  nombre: string
  descripcion?: string
  direccion: string
  ubicacion: string
  coordenadas: { lat: number; lng: number }
  telefono?: string
  email?: string
  rating: number
  servicios: string[]
  horario_atencion?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Cancha {
  id: string
  establecimiento_id: string
  nombre: string
  tipo: string
  precio_por_hora: number
  capacidad: number
  caracteristicas: string[]
  descripcion?: string
  imagen_url?: string
  activa: boolean
  created_at: string
  updated_at: string
  establecimiento?: Establecimiento
}

export interface Reserva {
  id: string
  user_id: string
  cancha_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  precio_total: number
  estado: "pending" | "paid" | "cancelled" | "completed"
  metodo_pago?: string
  transaction_id?: string
  notas?: string
  created_at: string
  updated_at: string
  cancha?: Cancha
  profile?: Profile
}

export interface Recompensa {
  id: string
  user_id: string
  puntos: number
  nivel: "bronce" | "plata" | "oro" | "platino"
  reservas_completadas: number
  descuento_disponible: number
  updated_at: string
}

export interface Metrica {
  id: string
  fecha: string
  visitas_totales: number
  reservas_creadas: number
  reservas_completadas: number
  ingresos_totales: number
  usuarios_nuevos: number
  canchas_mas_populares: Record<string, number>
  created_at: string
}
