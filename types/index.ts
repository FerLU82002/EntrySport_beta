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
  establecimientoId?: string
  disponible?: boolean
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

export type EstadoHorario = "disponible" | "reservado" | "mantenimiento" | "bloqueado"

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

export interface Reserva {
  id: string
  userId: string
  usuarioNombre: string
  usuarioEmail: string
  usuarioTelefono: string
  canchaId: number
  zonaId: string
  fecha: string
  horarios: string[]
  precio: number
  estado: "pendiente" | "confirmada" | "cancelada" | "completada"
  fechaCreacion: string
  metodoPago: string
  establecimiento: string
  cancha: string
  zona: string
  direccion: string
  telefono: string
  codigoVerificacion: string
}

export interface Bloqueo {
  id: string
  zonaId: string
  zonaNombre: string
  fecha: string
  horaInicio: string
  horaFin: string
  motivo: "mantenimiento" | "evento" | "otro"
  descripcion: string
  canchaId: number
  ownerId?: string
}

export interface Establecimiento {
  id: string
  nombre: string
  descripcion: string
  direccion: string
  telefono: string
  horarioAtencion: string
  servicios: string[]
  ubicacion: string
  foto: string
  ownerId: string
}

export interface CheckoutState {
  isOpen: boolean
  reservaData: {
    cancha: Cancha | null
    zona: Zona | null
    fecha: Date
    horarios: string[]
    total: number
  } | null
}

export interface AppState {
  filtros: FiltrosState
  reserva: ReservaState
  checkout: CheckoutState
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
  | { type: "ABRIR_CHECKOUT"; payload: { cancha: Cancha; zona: Zona; fecha: Date; horarios: string[]; total: number } }
  | { type: "CERRAR_CHECKOUT" }
  | { type: "CONFIRMAR_RESERVA"; payload: Reserva }
