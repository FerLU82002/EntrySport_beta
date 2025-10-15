"use client"

import { useCallback } from "react"
import { useAppContext } from "@/contexts/AppContext"
import { useAuth } from "@/hooks/useAuth"
import { horariosReservados } from "@/data/canchas"
import type { Cancha, Zona } from "@/types"
import { formatearFecha } from "@/utils/formatters"

export function useReserva() {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const { reserva } = state

  const abrirDetalles = useCallback(
    (cancha: Cancha) => {
      dispatch({ type: "ABRIR_DETALLES", payload: cancha })
    },
    [dispatch],
  )

  const cerrarDetalles = useCallback(() => {
    dispatch({ type: "CERRAR_DETALLES" })
  }, [dispatch])

  const seleccionarZona = useCallback(
    (zona: Zona) => {
      dispatch({ type: "SELECCIONAR_ZONA", payload: zona })
    },
    [dispatch],
  )

  const setFecha = useCallback(
    (fecha: Date) => {
      dispatch({ type: "SET_FECHA", payload: fecha })
    },
    [dispatch],
  )

  const toggleHorario = useCallback(
    (horario: string) => {
      if (esHorarioDisponible(horario)) {
        dispatch({ type: "TOGGLE_HORARIO", payload: horario })
      }
    },
    [dispatch],
  )

  const abrirLogin = useCallback(() => {
    dispatch({ type: "ABRIR_LOGIN" })
  }, [dispatch])

  const cerrarLogin = useCallback(() => {
    dispatch({ type: "CERRAR_LOGIN" })
  }, [dispatch])

  const esHorarioDisponible = useCallback(
    (horario: string): boolean => {
      if (!reserva.selectedCancha || !reserva.selectedZona) return false

      const fechaStr = formatearFecha(reserva.selectedDate)
      const reservados = horariosReservados[reserva.selectedCancha.id]?.[reserva.selectedZona.id]?.[fechaStr] || []
      return !reservados.includes(horario)
    },
    [reserva.selectedCancha, reserva.selectedZona, reserva.selectedDate],
  )

  const calcularTotal = useCallback((): number => {
    if (!reserva.selectedZona || reserva.selectedHorarios.length === 0) return 0
    return reserva.selectedZona.precio * reserva.selectedHorarios.length
  }, [reserva.selectedZona, reserva.selectedHorarios])

  const realizarReserva = useCallback(() => {
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
  }, [reserva, user, abrirLogin, dispatch, calcularTotal, cerrarDetalles])

  const abrirCheckout = useCallback(() => {
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
  }, [reserva, dispatch, calcularTotal])

  const cerrarCheckout = useCallback(() => {
    dispatch({ type: "CERRAR_CHECKOUT" })
  }, [dispatch])

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
