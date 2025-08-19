"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseReady, type Cancha as SupabaseCancha } from "@/lib/supabase"
import { canchas as canchasEstaticas } from "@/data/canchas"
import type { Cancha } from "@/types"

// Función para convertir datos de Supabase al formato esperado
const convertirCanchaSupabase = (cancha: SupabaseCancha): Cancha => {
  return {
    id: Number.parseInt(cancha.id) || 0,
    nombre: cancha.establecimiento?.nombre || cancha.nombre,
    establecimiento: cancha.establecimiento?.nombre || cancha.nombre,
    tipo: cancha.tipo,
    imagen: cancha.imagen_url || "/placeholder.svg?height=300&width=400",
    ubicacion: cancha.establecimiento?.ubicacion || "",
    direccion: cancha.establecimiento?.direccion || "",
    coordenadas: cancha.establecimiento?.coordenadas || { lat: 0, lng: 0 },
    rating: cancha.establecimiento?.rating || 4.5,
    disponible: cancha.activa,
    telefono: cancha.establecimiento?.telefono || "",
    descripcion: cancha.descripcion || "",
    servicios: cancha.establecimiento?.servicios || [],
    horarioAtencion: cancha.establecimiento?.horario_atencion || "",
    zonas: [
      {
        id: cancha.id,
        nombre: cancha.nombre,
        tipo: cancha.tipo,
        precio: cancha.precio_por_hora,
        capacidad: cancha.capacidad,
        caracteristicas: cancha.caracteristicas,
        descripcion: cancha.descripcion || "",
      },
    ],
  }
}

export function useCanchas() {
  const [canchas, setCanchas] = useState<Cancha[]>(canchasEstaticas) // Usar datos estáticos como fallback
  const [loading, setLoading] = useState(false)
  const [useSupabase, setUseSupabase] = useState(false)

  const fetchCanchas = async () => {
    // Si Supabase no está configurado, usar datos estáticos
    if (!isSupabaseReady || !supabase) {
      setCanchas(canchasEstaticas)
      setUseSupabase(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("canchas")
        .select(`
          *,
          establecimiento:establecimientos (*)
        `)
        .eq("activa", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.warn("Error fetching from Supabase, using static data:", error)
        setCanchas(canchasEstaticas)
        setUseSupabase(false)
      } else if (data && data.length > 0) {
        const canchasConvertidas = data.map(convertirCanchaSupabase)
        setCanchas(canchasConvertidas)
        setUseSupabase(true)
      } else {
        // Si no hay datos en Supabase, usar datos estáticos
        setCanchas(canchasEstaticas)
        setUseSupabase(false)
      }
    } catch (error) {
      console.warn("Error connecting to Supabase, using static data:", error)
      setCanchas(canchasEstaticas)
      setUseSupabase(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCanchas()
  }, [])

  const getHorariosDisponibles = async (canchaId: string, fecha: string) => {
    if (!useSupabase || !supabase) {
      // Usar datos estáticos si no hay conexión a Supabase
      const { horariosReservados } = await import("@/data/canchas")
      const reservados = horariosReservados[Number.parseInt(canchaId)]
      if (reservados) {
        const zonaKeys = Object.keys(reservados)
        if (zonaKeys.length > 0) {
          const horariosZona = reservados[zonaKeys[0]][fecha] || []
          return horariosZona.map((hora) => ({
            inicio: hora,
            fin: `${Number.parseInt(hora.split(":")[0]) + 1}:00`,
          }))
        }
      }
      return []
    }

    try {
      const { data, error } = await supabase
        .from("horarios_bloqueados")
        .select("hora_inicio, hora_fin")
        .eq("cancha_id", canchaId)
        .eq("fecha", fecha)

      if (error) throw error

      const horariosOcupados =
        data?.map((h) => ({
          inicio: h.hora_inicio,
          fin: h.hora_fin,
        })) || []

      return horariosOcupados
    } catch (error) {
      console.error("Error fetching horarios:", error)
      return []
    }
  }

  return {
    canchas,
    loading,
    getHorariosDisponibles,
    refetch: fetchCanchas,
    useSupabase,
    isSupabaseReady,
  }
}
