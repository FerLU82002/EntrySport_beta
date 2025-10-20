import type { Cancha, HorariosReservados, EstadoHorario } from "@/types"

// Re-export EstadoHorario for convenience
export type { EstadoHorario } from "@/types"

// Datos de prueba eliminados - Todos los establecimientos ahora se cargan desde Supabase
export const horariosReservados: HorariosReservados = {}

// Array vacío - Los establecimientos se cargan dinámicamente desde Supabase
export const canchas: Cancha[] = []

// Configuración de ubicaciones por región - Usado para filtros
export const ubicacionesHuanuco = {
  departamento: "Huánuco",
  provincias: {
    Huánuco: {
      distritos: ["Huánuco", "Amarilis", "Pillco Marca", "Santa María del Valle"],
    },
    "Leoncio Prado": {
      distritos: ["Tingo María", "Rupa Rupa", "José Crespo y Castillo"],
    },
    Pachitea: {
      distritos: ["Panao", "Chaglla", "Molino"],
    },
  },
}

// Tipos de cancha disponibles - Usado para filtros
export const tiposCancha = ["Todos", "Fútbol 11", "Fútbol 7", "Fútbol 5", "Tenis", "Básquetbol", "Vóley"]

// Regiones y distritos - Usado para filtros
export const regiones = {
  Todas: [],
  Lima: [
    "Victoria",
    "San Isidro",
    "Miraflores",
    "Barranco",
    "Surco",
    "La Molina",
    "Jesús María",
    "Cercado de Lima",
    "San Martín de Porres",
    "Los Olivos",
    "Comas",
    "Villa El Salvador",
  ],
  Huánuco: ["Huánuco", "Tingo María", "Amarilis", "Pillco Marca"],
  Arequipa: ["Arequipa", "Cayma", "Cerro Colorado", "Yanahuara"],
  Cusco: ["Cusco", "Wanchaq", "San Sebastián", "San Jerónimo"],
}

// Lista plana de ubicaciones - Usado para filtros
export const ubicaciones = [
  "Todas",
  "Victoria",
  "San Isidro",
  "Miraflores",
  "Los Olivos",
  "Cercado de Lima",
  "San Martín de Porres",
  "Barranco",
  "Comas",
  "La Molina",
  "Surco",
  "Villa El Salvador",
  "Jesús María",
  "Huánuco",
  "Tingo María",
  "Amarilis",
  "Pillco Marca",
]

// Rangos de precio - Usado para filtros
export const rangosPrecio = ["Todos", "Menos de S/80", "S/80 - S/150", "Más de S/150"]

// Horarios disponibles generales - Usado para mostrar opciones
export const horariosDisponibles = [
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
]

// Datos de prueba eliminados - Los estados de horarios se cargan desde Supabase (reservas y bloqueos)
export const horariosConEstado: Record<number, Record<string, Record<string, Record<string, EstadoHorario>>>> = {}
