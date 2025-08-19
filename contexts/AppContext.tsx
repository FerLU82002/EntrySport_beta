"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { AppState, AppAction } from "@/types"

const initialState: AppState = {
  filtros: {
    tipo: "Todos",
    ubicacion: "Todas",
    precio: "Todos",
    busqueda: "",
  },
  reserva: {
    selectedCancha: null,
    selectedZona: null,
    selectedDate: new Date(),
    selectedHorarios: [],
    isDetailsOpen: false,
    isLoginOpen: false,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_FILTRO_TIPO":
      return {
        ...state,
        filtros: { ...state.filtros, tipo: action.payload },
      }
    case "SET_FILTRO_UBICACION":
      return {
        ...state,
        filtros: { ...state.filtros, ubicacion: action.payload },
      }
    case "SET_FILTRO_PRECIO":
      return {
        ...state,
        filtros: { ...state.filtros, precio: action.payload },
      }
    case "SET_BUSQUEDA":
      return {
        ...state,
        filtros: { ...state.filtros, busqueda: action.payload },
      }
    case "LIMPIAR_FILTROS":
      return {
        ...state,
        filtros: {
          tipo: "Todos",
          ubicacion: "Todas",
          precio: "Todos",
          busqueda: "",
        },
      }
    case "ABRIR_DETALLES":
      return {
        ...state,
        reserva: {
          ...state.reserva,
          selectedCancha: action.payload,
          selectedZona: action.payload.zonas[0],
          selectedDate: new Date(),
          selectedHorarios: [],
          isDetailsOpen: true,
        },
      }
    case "CERRAR_DETALLES":
      return {
        ...state,
        reserva: {
          ...state.reserva,
          isDetailsOpen: false,
          selectedCancha: null,
          selectedZona: null,
          selectedHorarios: [],
        },
      }
    case "SELECCIONAR_ZONA":
      return {
        ...state,
        reserva: {
          ...state.reserva,
          selectedZona: action.payload,
          selectedHorarios: [],
        },
      }
    case "SET_FECHA":
      return {
        ...state,
        reserva: {
          ...state.reserva,
          selectedDate: action.payload,
          selectedHorarios: [],
        },
      }
    case "TOGGLE_HORARIO":
      const horarios = state.reserva.selectedHorarios
      const nuevoHorario = action.payload
      const nuevosHorarios = horarios.includes(nuevoHorario)
        ? horarios.filter((h) => h !== nuevoHorario)
        : [...horarios, nuevoHorario]

      return {
        ...state,
        reserva: {
          ...state.reserva,
          selectedHorarios: nuevosHorarios,
        },
      }
    case "LIMPIAR_HORARIOS":
      return {
        ...state,
        reserva: {
          ...state.reserva,
          selectedHorarios: [],
        },
      }
    case "ABRIR_LOGIN":
      return {
        ...state,
        reserva: {
          ...state.reserva,
          isLoginOpen: true,
        },
      }
    case "CERRAR_LOGIN":
      return {
        ...state,
        reserva: {
          ...state.reserva,
          isLoginOpen: false,
        },
      }
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
