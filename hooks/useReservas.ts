"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseReady, type Reserva } from "@/lib/supabase"
import { useAuth } from "./useAuth"

export function useReservas() {
  const { user } = useAuth()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(false)

  const fetchReservas = async () => {
    if (!user || !isSupabaseReady || !supabase) {
      setReservas([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("reservas")
        .select(`
          *,
          cancha:canchas (
            *,
            establecimiento:establecimientos (*)
          )
        `)
        .eq("user_id", user.id)
        .order("fecha", { ascending: true })

      if (error) throw error
      setReservas(data || [])
    } catch (error) {
      console.error("Error fetching reservas:", error)
      setReservas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isSupabaseReady) {
      fetchReservas()
    }
  }, [user])

  const createReserva = async (
    canchaId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    precioTotal: number,
    notas?: string,
  ) => {
    if (!user || !supabase) return { error: new Error("Usuario no autenticado o Supabase no configurado") }

    const { data, error } = await supabase
      .from("reservas")
      .insert({
        user_id: user.id,
        cancha_id: canchaId,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        precio_total: precioTotal,
        notas,
      })
      .select()
      .single()

    if (!error) {
      await fetchReservas()
    }

    return { data, error }
  }

  const updateReservaEstado = async (reservaId: string, estado: Reserva["estado"]) => {
    if (!supabase) return { error: new Error("Supabase no configurado") }

    const { data, error } = await supabase.from("reservas").update({ estado }).eq("id", reservaId).select().single()

    if (!error) {
      await fetchReservas()
    }

    return { data, error }
  }

  const cancelReserva = async (reservaId: string) => {
    return updateReservaEstado(reservaId, "cancelled")
  }

  const getProximasReservas = () => {
    const hoy = new Date().toISOString().split("T")[0]
    return reservas.filter((r) => r.fecha >= hoy && r.estado !== "cancelled")
  }

  const getHistorialReservas = () => {
    const hoy = new Date().toISOString().split("T")[0]
    return reservas.filter((r) => r.fecha < hoy || r.estado === "completed")
  }

  return {
    reservas,
    loading,
    createReserva,
    updateReservaEstado,
    cancelReserva,
    getProximasReservas,
    getHistorialReservas,
    refetch: fetchReservas,
  }
}
