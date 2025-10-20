"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Establecimiento } from "@/types"
import { useAuth } from "./useAuth"

const CACHE_KEY_ESTABLECIMIENTOS = "establecimientos-todos"
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export function useEstablecimientos() {
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  // Cargar establecimientos CON CACHE
  const fetchEstablecimientos = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Intentar cargar desde cache primero
      const cached = localStorage.getItem(CACHE_KEY_ESTABLECIMIENTOS)
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          const age = Date.now() - timestamp
          
          // Si el cache tiene menos de 5 minutos, usarlo
          if (age < CACHE_TTL) {
            setEstablecimientos(cachedData)
            setIsLoading(false)
            return cachedData
          }
        } catch (e) {
          // Cache corrupto, continuar con fetch
          localStorage.removeItem(CACHE_KEY_ESTABLECIMIENTOS)
        }
      }

      // Fetch desde Supabase
      const { data, error: fetchError } = await supabase
        .from('establecimientos')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const formattedData: Establecimiento[] = (data || []).map(est => ({
        id: est.id,
        nombre: est.nombre,
        descripcion: est.descripcion || '',
        direccion: est.direccion,
        telefono: est.telefono || '',
        horarioAtencion: est.horario_atencion || '',
        servicios: est.servicios || [],
        ubicacion: est.ubicacion,
        foto: est.foto || '',
        ownerId: est.owner_id,
      }))

      // Guardar en cache
      try {
        localStorage.setItem(CACHE_KEY_ESTABLECIMIENTOS, JSON.stringify({
          data: formattedData,
          timestamp: Date.now()
        }))
      } catch (e) {
        console.error("Error guardando cache de establecimientos:", e)
      }

      setEstablecimientos(formattedData)
      return formattedData
    } catch (err) {
      console.error('Error fetching establecimientos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar establecimientos')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Cargar establecimientos del dueño actual
  const fetchMisEstablecimientos = useCallback(async (ownerId: string) => {
    if (!ownerId) {
      setEstablecimientos([])
      setIsLoading(false)
      return []
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('establecimientos')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const formattedData: Establecimiento[] = (data || []).map(est => ({
        id: est.id,
        nombre: est.nombre,
        descripcion: est.descripcion || '',
        direccion: est.direccion,
        telefono: est.telefono || '',
        horarioAtencion: est.horario_atencion || '',
        servicios: est.servicios || [],
        ubicacion: est.ubicacion,
        foto: est.foto || '',
        ownerId: est.owner_id,
      }))

      setEstablecimientos(formattedData)
      return formattedData
    } catch (err) {
      console.error('Error fetching mis establecimientos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar tus establecimientos')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, supabase])

  // Crear establecimiento
  const crearEstablecimiento = useCallback(async (establecimiento: Omit<Establecimiento, 'id' | 'ownerId'>) => {
    if (!user?.id) {
      throw new Error('Debes iniciar sesión para crear un establecimiento')
    }

    try {
      setError(null)

      // Separar departamento y distrito de ubicacion
      const [departamento, distrito] = establecimiento.ubicacion.split(' - ')

      const { data, error: insertError } = await supabase
        .from('establecimientos')
        .insert({
          id: `est-${Date.now()}`,
          owner_id: user.id,
          nombre: establecimiento.nombre,
          descripcion: establecimiento.descripcion,
          direccion: establecimiento.direccion,
          telefono: establecimiento.telefono,
          horario_atencion: establecimiento.horarioAtencion,
          servicios: establecimiento.servicios,
          ubicacion: establecimiento.ubicacion,
          departamento: departamento || '',
          distrito: distrito || '',
          foto: establecimiento.foto,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Actualizar lista local
      if (user?.id) {
        await fetchMisEstablecimientos(user.id)
      }

      return data
    } catch (err) {
      console.error('Error creating establecimiento:', err)
      setError(err instanceof Error ? err.message : 'Error al crear establecimiento')
      throw err
    }
  }, [user?.id, supabase, fetchMisEstablecimientos])

  // Actualizar establecimiento
  const actualizarEstablecimiento = useCallback(async (id: string, establecimiento: Partial<Establecimiento>) => {
    try {
      setError(null)

      const updateData: any = {}
      
      if (establecimiento.nombre) updateData.nombre = establecimiento.nombre
      if (establecimiento.descripcion) updateData.descripcion = establecimiento.descripcion
      if (establecimiento.direccion) updateData.direccion = establecimiento.direccion
      if (establecimiento.telefono) updateData.telefono = establecimiento.telefono
      if (establecimiento.horarioAtencion) updateData.horario_atencion = establecimiento.horarioAtencion
      if (establecimiento.servicios) updateData.servicios = establecimiento.servicios
      if (establecimiento.foto) updateData.foto = establecimiento.foto
      
      if (establecimiento.ubicacion) {
        updateData.ubicacion = establecimiento.ubicacion
        const [departamento, distrito] = establecimiento.ubicacion.split(' - ')
        updateData.departamento = departamento || ''
        updateData.distrito = distrito || ''
      }

      const { error: updateError } = await supabase
        .from('establecimientos')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

      // Actualizar lista local
      if (user?.id) {
        await fetchMisEstablecimientos(user.id)
      }
    } catch (err) {
      console.error('Error updating establecimiento:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar establecimiento')
      throw err
    }
  }, [supabase, fetchMisEstablecimientos])

  // Eliminar establecimiento
  const eliminarEstablecimiento = useCallback(async (id: string) => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('establecimientos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Actualizar lista local
      setEstablecimientos(prev => prev.filter(est => est.id !== id))
    } catch (err) {
      console.error('Error deleting establecimiento:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar establecimiento')
      throw err
    }
  }, [supabase])

  return {
    establecimientos,
    isLoading,
    error,
    fetchEstablecimientos,
    fetchMisEstablecimientos,
    crearEstablecimiento,
    actualizarEstablecimiento,
    eliminarEstablecimiento,
  }
}
