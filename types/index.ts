export interface Coordenadas {
  lat: number
  lng: number
}

export interface Zona {
  id: string
  nombre: string
  tipo: string
  precio: number
  capacidad: number
  caracteristicas: string[]
  descripcion: string
}

export interface Cancha {
  id: number
  nombre: string
  establecimiento: string
  tipo: string
  imagen: string
  ubicacion: string
  direccion: string
  coordenadas: Coordenadas
  rating: number
  disponible: boolean
  telefono: string
  descripcion: string
  servicios: string[]
  horarioAtencion: string
  zonas: Zona[]
}

export interface HorariosReservados {
  [canchaId: number]: {
    [zonaId: string]: {
      [fecha: string]: string[]
    }
  }
}

export interface FiltrosState {
  tipo: string
  ubicacion: string
  precio: string
  busqueda: string
}

export interface ReservaState {
  selectedCancha: Cancha | null
  selectedZona: Zona | null
  selectedDate: Date
  selectedHorarios: string[]
  isDetailsOpen: boolean
  isLoginOpen: boolean
}

export interface AppState {
  filtros: FiltrosState
  reserva: ReservaState
}

export type AppAction =
  | { type: "SET_FILTRO_TIPO"; payload: string }
  | { type: "SET_FILTRO_UBICACION"; payload: string }
  | { type: "SET_FILTRO_PRECIO"; payload: string }
  | { type: "SET_BUSQUEDA"; payload: string }
  | { type: "LIMPIAR_FILTROS" }
  | { type: "ABRIR_DETALLES"; payload: Cancha }
  | { type: "CERRAR_DETALLES" }
  | { type: "SELECCIONAR_ZONA"; payload: Zona }
  | { type: "SET_FECHA"; payload: Date }
  | { type: "TOGGLE_HORARIO"; payload: string }
  | { type: "LIMPIAR_HORARIOS" }
  | { type: "ABRIR_LOGIN" }
  | { type: "CERRAR_LOGIN" }
