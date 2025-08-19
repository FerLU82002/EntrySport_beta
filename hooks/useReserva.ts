"use client"

import { useAppContext } from "@/contexts/AppContext"
import { useAuth } from "@/hooks/useAuth"
import { useReservas } from "@/hooks/useReservas"
import { useCanchas } from "@/hooks/useCanchas"
import type { Cancha, Zona } from "@/types"
import { formatearFecha, formatearPrecio } from "@/utils/formatters"

export function useReserva() {
  const { state, dispatch } = useAppContext()
  const { user, isAuthenticated } = useAuth()
  const { createReserva } = useReservas()
  const { getHorariosDisponibles, useSupabase } = useCanchas()
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

  const toggleHorario = async (horario: string) => {
    if (await esHorarioDisponible(horario)) {
      dispatch({ type: "TOGGLE_HORARIO", payload: horario })
    }
  }

  const abrirLogin = () => {
    dispatch({ type: "ABRIR_LOGIN" })
  }

  const cerrarLogin = () => {
    dispatch({ type: "CERRAR_LOGIN" })
  }

  const esHorarioDisponible = async (horario: string): Promise<boolean> => {
    if (!reserva.selectedCancha || !reserva.selectedZona) return false

    const fechaStr = formatearFecha(reserva.selectedDate)

    try {
      // Obtener horarios ocupados
      const horariosOcupados = await getHorariosDisponibles(reserva.selectedCancha.id.toString(), fechaStr)

      // Verificar si el horario está ocupado
      const horaInicio = horario
      const horaFin = `${Number.parseInt(horario.split(":")[0]) + 1}:00`

      return !horariosOcupados.some(
        (ocupado) =>
          (horaInicio >= ocupado.inicio && horaInicio < ocupado.fin) ||
          (horaFin > ocupado.inicio && horaFin <= ocupado.fin),
      )
    } catch (error) {
      console.error("Error checking horario disponibilidad:", error)
      return true // En caso de error, asumir que está disponible
    }
  }

  const calcularTotal = (): number => {
    if (!reserva.selectedZona || reserva.selectedHorarios.length === 0) return 0
    return reserva.selectedZona.precio * reserva.selectedHorarios.length
  }

  const realizarReserva = async () => {
    if (reserva.selectedHorarios.length === 0) {
      alert("Por favor selecciona al menos un horario")
      return
    }

    if (!reserva.selectedCancha || !reserva.selectedZona) return

    if (!isAuthenticated) {
      abrirLogin()
      return
    }

    // Si no estamos usando Supabase, mostrar mensaje de demo
    if (!useSupabase) {
      alert(
        `DEMO - Reserva simulada:\nEstablecimiento: ${reserva.selectedCancha.establecimiento}\nZona: ${reserva.selectedZona.nombre}\nFecha: ${reserva.selectedDate.toLocaleDateString()}\nHorarios: ${reserva.selectedHorarios.join(", ")}\nTotal: ${formatearPrecio(calcularTotal())}\n\n(Esta es una demostración. En producción se crearía la reserva real.)`,
      )
      cerrarDetalles()
      return
    }

    try {
      // Crear la reserva en Supabase
      const horaInicio = reserva.selectedHorarios[0]
      const horaFin = `${Number.parseInt(reserva.selectedHorarios[reserva.selectedHorarios.length - 1].split(":")[0]) + 1}:00`

      const { data, error } = await createReserva(
        reserva.selectedCancha.id.toString(),
        formatearFecha(reserva.selectedDate),
        horaInicio,
        horaFin,
        calcularTotal(),
        `Horarios: ${reserva.selectedHorarios.join(", ")}`,
      )

      if (error) {
        alert(`Error al crear la reserva: ${error.message}`)
        return
      }

      // Mostrar confirmación y redirigir a pago
      alert(
        `Reserva creada exitosamente!\nEstablecimiento: ${reserva.selectedCancha.establecimiento}\nZona: ${reserva.selectedZona.nombre}\nFecha: ${reserva.selectedDate.toLocaleDateString()}\nHorarios: ${reserva.selectedHorarios.join(", ")}\nTotal: ${formatearPrecio(calcularTotal())}\n\nSerás redirigido al dashboard.`,
      )

      cerrarDetalles()

      // Redirigir al dashboard
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error al realizar reserva:", error)
      alert("Error inesperado al crear la reserva")
    }
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
  }
}
