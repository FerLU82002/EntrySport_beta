"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Reserva } from "@/types"

export function useReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Cargar reservas del usuario CON CACHE
  const fetchMisReservas = useCallback(async (userId: string) => {
    const cacheKey = `mis-reservas-${userId}`
    const CACHE_TTL = 2 * 60 * 1000 // 2 minutos (las reservas cambian con frecuencia)
    
    try {
      setIsLoading(true)
      setError(null)

      // Intentar cargar desde cache primero
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          const age = Date.now() - timestamp
          
          // Si el cache tiene menos de 2 minutos, usarlo
          if (age < CACHE_TTL) {
            setReservas(cachedData)
            setIsLoading(false)
            return cachedData
          }
        } catch (e) {
          console.warn('Cache corrupto, ignorando...')
        }
      }

      // Fetch desde Supabase
      const { data, error: fetchError } = await supabase
        .from('reservas')
        .select('*')
        .eq('user_id', userId)
        .order('fecha', { ascending: false })

      if (fetchError) throw fetchError

      const formattedData: Reserva[] = (data || []).map(reserva => ({
        id: reserva.id,
        userId: reserva.user_id,
        usuarioNombre: reserva.usuario_nombre,
        usuarioEmail: reserva.usuario_email,
        usuarioTelefono: reserva.usuario_telefono,
        canchaId: reserva.cancha_id || 0,
        zonaId: reserva.zona_id,
        fecha: reserva.fecha,
        horarios: reserva.horarios,
        precio: Number(reserva.precio),
        estado: reserva.estado,
        fechaCreacion: reserva.fecha_creacion,
        metodoPago: reserva.metodo_pago,
        establecimiento: reserva.establecimiento,
        cancha: reserva.cancha,
        zona: reserva.zona,
        direccion: reserva.direccion,
        telefono: reserva.telefono,
        codigoVerificacion: reserva.codigo_verificacion,
      }))

      // Guardar en cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: formattedData,
        timestamp: Date.now()
      }))

      setReservas(formattedData)
      return formattedData
    } catch (err) {
      console.error('Error fetching reservas:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar reservas')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Cargar reservas de las zonas del dueño
  const fetchReservasDeZonas = useCallback(async (ownerId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Primero obtener los establecimientos del dueño
      const { data: establecimientos, error: estError } = await supabase
        .from('establecimientos')
        .select('id')
        .eq('owner_id', ownerId)

      if (estError) throw estError

      if (!establecimientos || establecimientos.length === 0) {
        setReservas([])
        return []
      }

      const establecimientoIds = establecimientos.map(e => e.id)

      // Obtener las zonas de esos establecimientos
      const { data: zonas, error: zonasError } = await supabase
        .from('zonas')
        .select('id')
        .in('establecimiento_id', establecimientoIds)

      if (zonasError) throw zonasError

      if (!zonas || zonas.length === 0) {
        setReservas([])
        return []
      }

      const zonaIds = zonas.map(z => z.id)

      // Obtener todas las reservas de esas zonas
      const { data, error: fetchError } = await supabase
        .from('reservas')
        .select('*')
        .in('zona_id', zonaIds)
        .order('fecha', { ascending: false })

      if (fetchError) throw fetchError

      const formattedData: Reserva[] = (data || []).map(reserva => ({
        id: reserva.id,
        userId: reserva.user_id,
        usuarioNombre: reserva.usuario_nombre,
        usuarioEmail: reserva.usuario_email,
        usuarioTelefono: reserva.usuario_telefono,
        canchaId: reserva.cancha_id || 0,
        zonaId: reserva.zona_id,
        fecha: reserva.fecha,
        horarios: reserva.horarios,
        precio: Number(reserva.precio),
        estado: reserva.estado,
        fechaCreacion: reserva.fecha_creacion,
        metodoPago: reserva.metodo_pago,
        establecimiento: reserva.establecimiento,
        cancha: reserva.cancha,
        zona: reserva.zona,
        direccion: reserva.direccion,
        telefono: reserva.telefono,
        codigoVerificacion: reserva.codigo_verificacion,
      }))

      setReservas(formattedData)
      return formattedData
    } catch (err) {
      console.error('Error fetching reservas de zonas:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar reservas')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Crear reserva
  const crearReserva = useCallback(async (reserva: Omit<Reserva, 'id' | 'fechaCreacion'> & { establecimientoId?: string }) => {
    try {
      setError(null)

      // Obtener el establecimiento_id desde la zona si no se proporciona
      let establecimientoId = reserva.establecimientoId
      
      if (!establecimientoId) {
        const { data: zonaData, error: zonaError } = await supabase
          .from('zonas')
          .select('establecimiento_id')
          .eq('id', reserva.zonaId)
          .single()
        
        if (zonaError || !zonaData) {
          throw new Error('No se pudo obtener el establecimiento de la zona')
        }
        
        establecimientoId = zonaData.establecimiento_id
      }

      // Verificar bloqueos en los horarios seleccionados
      const { data: bloqueosData, error: bloqueosError } = await supabase
        .from('bloqueos')
        .select('*')
        .eq('zona_id', reserva.zonaId)
        .eq('fecha', reserva.fecha)

      if (bloqueosError) {
        console.error('Error al verificar bloqueos:', bloqueosError)
        // No bloqueamos la reserva si falla la consulta de bloqueos
      }

      if (bloqueosData && bloqueosData.length > 0) {
        // Verificar si alguno de los horarios seleccionados está bloqueado
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

        for (const horario of reserva.horarios) {
          const horario24 = convertirA24Horas(horario)
          
          for (const bloqueo of bloqueosData) {
            const bloqInicio = bloqueo.hora_inicio.replace(":", "")
            const bloqFin = bloqueo.hora_fin.replace(":", "")
            const hora24 = horario24.replace(":", "")
            
            if (hora24 >= bloqInicio && hora24 < bloqFin) {
              throw new Error(`El horario ${horario} está bloqueado por ${bloqueo.motivo}`)
            }
          }
        }
      }

      // Verificar reservas existentes en los horarios seleccionados
      const { data: reservasExistentes, error: reservasError } = await supabase
        .from('reservas')
        .select('horarios')
        .eq('zona_id', reserva.zonaId)
        .eq('fecha', reserva.fecha)
        .in('estado', ['pendiente', 'confirmada'])

      if (reservasError) {
        console.error('Error al verificar reservas:', reservasError)
        // No bloqueamos la reserva si falla la consulta
      }

      if (reservasExistentes && reservasExistentes.length > 0) {
        const horariosReservados = reservasExistentes.flatMap(r => r.horarios as string[])
        const conflictos = reserva.horarios.filter(h => horariosReservados.includes(h))
        
        if (conflictos.length > 0) {
          throw new Error(`Los siguientes horarios ya están reservados: ${conflictos.join(', ')}`)
        }
      }

      // Generar código de verificación único
      const codigoVerificacion = Math.random().toString().slice(2, 8).padStart(6, '0')

      const { data, error: insertError } = await supabase
        .from('reservas')
        .insert({
          id: `res-${Date.now()}`,
          user_id: reserva.userId,
          usuario_nombre: reserva.usuarioNombre,
          usuario_email: reserva.usuarioEmail,
          usuario_telefono: reserva.usuarioTelefono,
          cancha_id: reserva.canchaId,
          zona_id: reserva.zonaId,
          establecimiento_id: establecimientoId,
          fecha: reserva.fecha,
          horarios: reserva.horarios,
          precio: reserva.precio,
          metodo_pago: reserva.metodoPago,
          estado: reserva.estado || 'pendiente',
          codigo_verificacion: reserva.codigoVerificacion || codigoVerificacion,
          establecimiento: reserva.establecimiento,
          cancha: reserva.cancha,
          zona: reserva.zona,
          direccion: reserva.direccion,
          telefono: reserva.telefono,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Invalidar cache de reservas del usuario
      if (reserva.userId) {
        localStorage.removeItem(`mis-reservas-${reserva.userId}`)
      }

      return data
    } catch (err) {
      console.error('Error creating reserva:', err)
      setError(err instanceof Error ? err.message : 'Error al crear reserva')
      throw err
    }
  }, [supabase])

  // Actualizar estado de reserva
  const actualizarEstadoReserva = useCallback(async (id: string, estado: Reserva['estado']) => {
    try {
      setError(null)

      const { error: updateError } = await supabase
        .from('reservas')
        .update({ estado })
        .eq('id', id)

      if (updateError) throw updateError

      // Actualizar lista local
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado } : r))
      
      // Invalidar cache del usuario (obtenemos el userId de la reserva en la lista local)
      const reserva = reservas.find(r => r.id === id)
      if (reserva?.userId) {
        localStorage.removeItem(`mis-reservas-${reserva.userId}`)
      }
    } catch (err) {
      console.error('Error updating reserva:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar reserva')
      throw err
    }
  }, [supabase, reservas])

  // Cancelar reserva
  const cancelarReserva = useCallback(async (id: string) => {
    return actualizarEstadoReserva(id, 'cancelada')
  }, [actualizarEstadoReserva])

  return {
    reservas,
    isLoading,
    error,
    fetchMisReservas,
    fetchReservasDeZonas,
    crearReserva,
    actualizarEstadoReserva,
    cancelarReserva,
  }
}
