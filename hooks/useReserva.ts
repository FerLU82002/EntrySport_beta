"use client"

import { useCallback, useState, useEffect } from "react"
import { useAppContext } from "@/contexts/AppContext"
import { useAuth } from "@/hooks/useAuth"
import { horariosReservados } from "@/data/canchas"
import type { Cancha, Zona, Bloqueo } from "@/types"
import { formatearFecha } from "@/utils/formatters"

export function useReserva() {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const { reserva } = state
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([])

  // Cargar bloqueos cuando cambia el modal de detalles
  useEffect(() => {
    if (reserva.isDetailsOpen) {
      const bloqueosGuardados = localStorage.getItem("bloqueos")
      if (bloqueosGuardados) {
        setBloqueos(JSON.parse(bloqueosGuardados))
      }
    }
  }, [reserva.isDetailsOpen])

  // Función auxiliar para convertir hora de 12h a 24h
  const convertirA24Horas = (hora12: string): string => {
    const [tiempo, periodo] = hora12.split(" ")
    let [horas, minutos] = tiempo.split(":")
    let horasNum = Number.parseInt(horas)
    
    if (periodo === "PM" && horasNum !== 12) {
      horasNum += 12
    } else if (periodo === "AM" && horasNum === 12) {
      horasNum = 0
    }
    
    return `${horasNum.toString().padStart(2, "0")}:${minutos}`
  }

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

  const esHorarioDisponible = useCallback(
    (horario: string): boolean => {
      if (!reserva.selectedCancha || !reserva.selectedZona) return false

      const fechaStr = formatearFecha(reserva.selectedDate)
      
      // Verificar bloqueos del localStorage
      const bloqueoEncontrado = bloqueos.find((bloqueo) => {
        if (bloqueo.zonaId !== reserva.selectedZona?.id) return false
        if (bloqueo.fecha !== fechaStr) return false
        
        // Convertir horarios a formato comparable
        const horario24 = convertirA24Horas(horario)
        const bloqInicio = bloqueo.horaInicio.replace(":", "")
        const bloqFin = bloqueo.horaFin.replace(":", "")
        const hora24 = horario24.replace(":", "")
        
        return hora24 >= bloqInicio && hora24 < bloqFin
      })
      
      // Si hay un bloqueo, no está disponible
      if (bloqueoEncontrado) return false
      
      // Verificar horarios reservados estáticos
      const reservados = horariosReservados[reserva.selectedCancha.id]?.[reserva.selectedZona.id]?.[fechaStr] || []
      return !reservados.includes(horario)
    },
    [reserva.selectedCancha, reserva.selectedZona, reserva.selectedDate, bloqueos, convertirA24Horas],
  )

  const toggleHorario = useCallback(
    (horario: string) => {
      if (esHorarioDisponible(horario)) {
        dispatch({ type: "TOGGLE_HORARIO", payload: horario })
      }
    },
    [dispatch, esHorarioDisponible],
  )

  const abrirLogin = useCallback(() => {
    dispatch({ type: "ABRIR_LOGIN" })
  }, [dispatch])

  const cerrarLogin = useCallback(() => {
    dispatch({ type: "CERRAR_LOGIN" })
  }, [dispatch])

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
