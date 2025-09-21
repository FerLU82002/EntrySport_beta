"use client"

import { useAppContext } from "@/contexts/AppContext"
import { useAuth } from "@/hooks/useAuth"
import { horariosReservados } from "@/data/canchas"
import type { Cancha, Zona } from "@/types"
import { formatearFecha } from "@/utils/formatters"

export function useReserva() {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const { reserva } = state

  const abrirDetalles = (cancha: Cancha) => {
    dispatch({ type: "ABRIR_DETALLES", payload: cancha })
  }

  const cerrarDetalles = () => {
    dispatch({ type: "CERRAR_DETALLES" })
  }

  const seleccionarZona = (zona: Zona) => {
    dispatch({ type: "SELECCIONAR_ZONA", payload: zona })
  }

  const setFecha = (fecha: Date) => {
    dispatch({ type: "SET_FECHA", payload: fecha })
  }

  const toggleHorario = (horario: string) => {
    if (esHorarioDisponible(horario)) {
      dispatch({ type: "TOGGLE_HORARIO", payload: horario })
    }
  }

  const abrirLogin = () => {
    dispatch({ type: "ABRIR_LOGIN" })
  }

  const cerrarLogin = () => {
    dispatch({ type: "CERRAR_LOGIN" })
  }

  const esHorarioDisponible = (horario: string): boolean => {
    if (!reserva.selectedCancha || !reserva.selectedZona) return false

    const fechaStr = formatearFecha(reserva.selectedDate)
    const reservados = horariosReservados[reserva.selectedCancha.id]?.[reserva.selectedZona.id]?.[fechaStr] || []
    return !reservados.includes(horario)
  }

  const calcularTotal = (): number => {
    if (!reserva.selectedZona || reserva.selectedHorarios.length === 0) return 0
    return reserva.selectedZona.precio * reserva.selectedHorarios.length
  }

  const realizarReserva = () => {
    if (reserva.selectedHorarios.length === 0) {
      alert("Por favor selecciona al menos un horario")
      return
    }

    if (!reserva.selectedCancha || !reserva.selectedZona) return

    if (!user) {
      abrirLogin()
      return
    }

    dispatch({
      type: "ABRIR_CHECKOUT",
      payload: {
        cancha: reserva.selectedCancha,
        zona: reserva.selectedZona,
        fecha: reserva.selectedDate,
        horarios: [...reserva.selectedHorarios],
        total: calcularTotal(),
      },
    })
    cerrarDetalles()
  }

  const abrirCheckout = () => {
    if (!reserva.selectedCancha || !reserva.selectedZona || reserva.selectedHorarios.length === 0) return

    dispatch({
      type: "ABRIR_CHECKOUT",
      payload: {
        cancha: reserva.selectedCancha,
        zona: reserva.selectedZona,
        fecha: reserva.selectedDate,
        horarios: [...reserva.selectedHorarios],
        total: calcularTotal(),
      },
    })
  }

  const cerrarCheckout = () => {
    dispatch({ type: "CERRAR_CHECKOUT" })
  }

  return {
    reserva,
    abrirDetalles,
    cerrarDetalles,
    seleccionarZona,
    setFecha,
    toggleHorario,
    abrirLogin,
    cerrarLogin,
    esHorarioDisponible,
    calcularTotal,
    realizarReserva,
    abrirCheckout,
    cerrarCheckout,
  }
}
