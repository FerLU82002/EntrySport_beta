"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLocalCache } from "@/hooks/useLocalCache"
import type { Zona } from "@/types"

interface ZonaDB {
  id: string
  establecimiento_id: string
  nombre: string
  tipo: string
  capacidad: number
  precio: number
  descripcion: string | null
  caracteristicas: string[]
  disponible: boolean
}

export function useZonas() {
  const [zonas, setZonas] = useState<Zona[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Cargar zonas de un establecimiento CON CACHE
  const fetchZonasByEstablecimiento = useCallback(async (establecimientoId: string) => {
    const cacheKey = `zonas-est-${establecimientoId}`
    
    try {
      setIsLoading(true)
      setError(null)

      // Intentar cargar desde cache primero
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          const age = Date.now() - timestamp
          
          // Si el cache tiene menos de 3 minutos, usarlo
          if (age < 3 * 60 * 1000) {
      //             console.log(`📦 Usando cache de zonas (${Math.round(age / 1000)}s de antigüedad)`)
            setZonas(cachedData)
            setIsLoading(false)
            
            // Revalidar en segundo plano si tiene más de 1 minuto
            if (age > 60 * 1000) {
              fetchAndCache()
            }
            return cachedData
          }
        } catch (e) {
          console.warn('Cache corrupto, ignorando...')
        }
      }

      // Fetch desde Supabase
      return await fetchAndCache()

      async function fetchAndCache() {
        const { data, error: fetchError } = await supabase
          .from('zonas')
          .select('*')
          .eq('establecimiento_id', establecimientoId)
          .eq('disponible', true)
          .order('nombre', { ascending: true })

        if (fetchError) throw fetchError

        const formattedData: Zona[] = (data || []).map((zona: ZonaDB) => ({
          id: zona.id,
          nombre: zona.nombre,
          tipo: zona.tipo,
          precio: zona.precio,
          capacidad: zona.capacidad,
          caracteristicas: zona.caracteristicas || [],
          descripcion: zona.descripcion || '',
        }))

        // Guardar en cache
        localStorage.setItem(cacheKey, JSON.stringify({
          data: formattedData,
          timestamp: Date.now()
        }))
        setZonas(formattedData)
        return formattedData
      }
    } catch (err) {
      console.error('Error fetching zonas:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar zonas')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Cargar todas las zonas del dueño (desde sus establecimientos) CON CACHE
  const fetchMisZonas = useCallback(async (ownerId: string) => {
    const cacheKey = `mis-zonas-${ownerId}`
    
    try {
      setIsLoading(true)
      setError(null)

      // Intentar cargar desde cache primero
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          const age = Date.now() - timestamp
          
          // Si el cache tiene menos de 2 minutos, usarlo (admin necesita data fresca)
          if (age < 2 * 60 * 1000) {
      //             console.log(`📦 Usando cache de mis zonas (${Math.round(age / 1000)}s de antigüedad)`)
            setZonas(cachedData)
            setIsLoading(false)
            return cachedData
          }
        } catch (e) {
          console.warn('Cache corrupto, ignorando...')
        }
      }
      // Primero obtener los establecimientos del dueño
      const { data: establecimientos, error: estError } = await supabase
        .from('establecimientos')
        .select('id')
        .eq('owner_id', ownerId)

      if (estError) throw estError

      if (!establecimientos || establecimientos.length === 0) {
        setZonas([])
        localStorage.setItem(cacheKey, JSON.stringify({ data: [], timestamp: Date.now() }))
        return []
      }

      const establecimientoIds = establecimientos.map(e => e.id)

      // Luego obtener todas las zonas de esos establecimientos
      const { data, error: fetchError } = await supabase
        .from('zonas')
        .select('*')
        .in('establecimiento_id', establecimientoIds)
        .order('nombre', { ascending: true })

      if (fetchError) throw fetchError

      const formattedData: Zona[] = (data || []).map((zona: ZonaDB) => ({
        id: zona.id,
        nombre: zona.nombre,
        tipo: zona.tipo,
        precio: zona.precio,
        capacidad: zona.capacidad,
        caracteristicas: zona.caracteristicas || [],
        descripcion: zona.descripcion || '',
      }))

      // Guardar en cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: formattedData,
        timestamp: Date.now()
      }))
      //       console.log(`💾 Cache guardado para mis zonas (${formattedData.length} zonas)`)

      setZonas(formattedData)
      return formattedData
    } catch (err) {
      console.error('Error fetching mis zonas:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar tus zonas')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Crear zona
  const crearZona = useCallback(async (zona: Omit<Zona, 'id'> & { establecimientoId: string }) => {
    try {
      setError(null)
      // Verificar que el usuario está autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('❌ Usuario no autenticado:', userError)
        throw new Error('Debes estar autenticado para crear una zona')
      }
      // Verificar que el establecimiento existe y pertenece al usuario
      const { data: establecimientos, error: estError } = await supabase
        .from('establecimientos')
        .select('id, owner_id')
        .eq('id', zona.establecimientoId)
        .single()

      if (estError || !establecimientos) {
        console.error('❌ Establecimiento no encontrado:', estError)
        throw new Error('Establecimiento no encontrado')
      }
      if (establecimientos.owner_id !== user.id) {
        console.error('❌ El establecimiento no pertenece al usuario')
        throw new Error('No tienes permiso para agregar zonas a este establecimiento')
      }

      const zonaId = `zona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const { data, error: insertError } = await supabase
        .from('zonas')
        .insert({
          id: zonaId,
          establecimiento_id: zona.establecimientoId,
          nombre: zona.nombre,
          tipo: zona.tipo,
          capacidad: zona.capacidad,
          precio: zona.precio,
          descripcion: zona.descripcion,
          caracteristicas: zona.caracteristicas,
          disponible: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error de Supabase al insertar:', insertError)
        throw insertError
      }
      // INVALIDAR CACHE
      localStorage.removeItem(`mis-zonas-${user.id}`)
      localStorage.removeItem(`zonas-est-${zona.establecimientoId}`)
      return data
    } catch (err) {
      console.error('❌ Error creating zona:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al crear zona'
      setError(errorMessage)
      throw err
    }
  }, [supabase])

  // Actualizar zona
  const actualizarZona = useCallback(async (id: string, zona: Partial<Zona>) => {
    try {
      setError(null)

      const updateData: any = {}
      
      if (zona.nombre) updateData.nombre = zona.nombre
      if (zona.tipo) updateData.tipo = zona.tipo
      if (zona.capacidad !== undefined) updateData.capacidad = zona.capacidad
      if (zona.precio !== undefined) updateData.precio = zona.precio
      if (zona.descripcion !== undefined) updateData.descripcion = zona.descripcion
      if (zona.caracteristicas) updateData.caracteristicas = zona.caracteristicas

      const { error: updateError } = await supabase
        .from('zonas')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

      // Actualizar lista local
      setZonas(prev => prev.map(z => z.id === id ? { ...z, ...zona } : z))
      
      // INVALIDAR CACHE (limpia todos los caches de zonas)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        localStorage.removeItem(`mis-zonas-${user.id}`)
      }
    } catch (err) {
      console.error('Error updating zona:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar zona')
      throw err
    }
  }, [supabase])

  // Eliminar zona (marcar como no disponible)
  const eliminarZona = useCallback(async (id: string) => {
    try {
      setError(null)

      const { error: updateError } = await supabase
        .from('zonas')
        .update({ disponible: false })
        .eq('id', id)

      if (updateError) throw updateError

      // Actualizar lista local
      setZonas(prev => prev.filter(z => z.id !== id))
      
      // INVALIDAR CACHE
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        localStorage.removeItem(`mis-zonas-${user.id}`)
      }
    } catch (err) {
      console.error('Error deleting zona:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar zona')
      throw err
    }
  }, [supabase])

  return {
    zonas,
    isLoading,
    error,
    fetchZonasByEstablecimiento,
    fetchMisZonas,
    crearZona,
    actualizarZona,
    eliminarZona,
  }
}
