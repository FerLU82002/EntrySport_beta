"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Bloqueo } from "@/types"

// Hook para gestionar bloqueos de zonas (mantenimiento, eventos, etc.)

interface BloqueoDb {
  id: string
  zona_id: string
  zona_nombre: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  motivo: string
  descripcion?: string
  created_at?: string
}

export function useBloqueos() {
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Cargar bloqueos por zona
  const fetchBloqueosByZona = useCallback(async (zonaId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('bloqueos')
        .select('*')
        .eq('zona_id', zonaId)
        .order('fecha', { ascending: true })

      if (fetchError) throw fetchError

      const formattedData: Bloqueo[] = (data || []).map((bloqueo: BloqueoDb) => ({
        id: bloqueo.id,
        zonaId: bloqueo.zona_id,
        zonaNombre: bloqueo.zona_nombre,
        fecha: bloqueo.fecha,
        horaInicio: bloqueo.hora_inicio,
        horaFin: bloqueo.hora_fin,
        motivo: bloqueo.motivo as "mantenimiento" | "evento" | "otro",
        descripcion: bloqueo.descripcion || "",
        canchaId: 0,
      }))

      setBloqueos(formattedData)
      return formattedData
    } catch (err) {
      console.error('Error fetching bloqueos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar bloqueos')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Cargar todos los bloqueos de las zonas del dueño
  const fetchMisBloqueos = useCallback(async (ownerId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener establecimientos del dueño
      const { data: establecimientos, error: estError } = await supabase
        .from('establecimientos')
        .select('id')
        .eq('owner_id', ownerId)

      if (estError) throw estError

      if (!establecimientos || establecimientos.length === 0) {
        setBloqueos([])
        return []
      }

      const establecimientoIds = establecimientos.map(e => e.id)

      // Obtener zonas de esos establecimientos
      const { data: zonas, error: zonasError } = await supabase
        .from('zonas')
        .select('id')
        .in('establecimiento_id', establecimientoIds)

      if (zonasError) throw zonasError

      if (!zonas || zonas.length === 0) {
        setBloqueos([])
        return []
      }

      const zonaIds = zonas.map(z => z.id)

      // Obtener bloqueos de esas zonas
      const { data, error: fetchError } = await supabase
        .from('bloqueos')
        .select('*')
        .in('zona_id', zonaIds)
        .order('fecha', { ascending: true })

      if (fetchError) throw fetchError

      const formattedData: Bloqueo[] = (data || []).map((bloqueo: BloqueoDb) => ({
        id: bloqueo.id,
        zonaId: bloqueo.zona_id,
        zonaNombre: bloqueo.zona_nombre,
        fecha: bloqueo.fecha,
        horaInicio: bloqueo.hora_inicio,
        horaFin: bloqueo.hora_fin,
        motivo: bloqueo.motivo as "mantenimiento" | "evento" | "otro",
        descripcion: bloqueo.descripcion || "",
        canchaId: 0,
      }))

      setBloqueos(formattedData)
      return formattedData
    } catch (err) {
      console.error('Error fetching mis bloqueos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar bloqueos')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Crear bloqueo
  const crearBloqueo = useCallback(async (bloqueo: Omit<Bloqueo, 'id'>) => {
    try {
      setError(null)

      const { data, error: insertError } = await supabase
        .from('bloqueos')
        .insert({
          id: `blq-${Date.now()}`,
          zona_id: bloqueo.zonaId,
          zona_nombre: bloqueo.zonaNombre,
          fecha: bloqueo.fecha,
          hora_inicio: bloqueo.horaInicio,
          hora_fin: bloqueo.horaFin,
          motivo: bloqueo.motivo,
          descripcion: bloqueo.descripcion || "",
        })
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (err) {
      console.error('Error creating bloqueo:', err)
      setError(err instanceof Error ? err.message : 'Error al crear bloqueo')
      throw err
    }
  }, [supabase])

  // Actualizar bloqueo
  const actualizarBloqueo = useCallback(async (id: string, bloqueo: Partial<Omit<Bloqueo, 'id'>>) => {
    try {
      setError(null)

      const updateData: Partial<BloqueoDb> = {}
      
      if (bloqueo.zonaId !== undefined) updateData.zona_id = bloqueo.zonaId
      if (bloqueo.zonaNombre !== undefined) updateData.zona_nombre = bloqueo.zonaNombre
      if (bloqueo.fecha !== undefined) updateData.fecha = bloqueo.fecha
      if (bloqueo.horaInicio !== undefined) updateData.hora_inicio = bloqueo.horaInicio
      if (bloqueo.horaFin !== undefined) updateData.hora_fin = bloqueo.horaFin
      if (bloqueo.motivo !== undefined) updateData.motivo = bloqueo.motivo
      if (bloqueo.descripcion !== undefined) updateData.descripcion = bloqueo.descripcion

      const { error: updateError } = await supabase
        .from('bloqueos')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

      // Actualizar lista local
      setBloqueos(prev => prev.map(b => 
        b.id === id ? { ...b, ...bloqueo } : b
      ))
    } catch (err) {
      console.error('Error updating bloqueo:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar bloqueo')
      throw err
    }
  }, [supabase])

  // Eliminar bloqueo
  const eliminarBloqueo = useCallback(async (id: string) => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('bloqueos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Actualizar lista local
      setBloqueos(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      console.error('Error deleting bloqueo:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar bloqueo')
      throw err
    }
  }, [supabase])

  return {
    bloqueos,
    isLoading,
    error,
    fetchBloqueosByZona,
    fetchMisBloqueos,
    crearBloqueo,
    actualizarBloqueo,
    eliminarBloqueo,
  }
}
