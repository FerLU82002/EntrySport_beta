"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import type { Zona, Establecimiento, Reserva, Bloqueo } from "@/types"

interface AdminData {
  establecimientos: Establecimiento[]
  zonas: Zona[]
  reservas: Reserva[]
  bloqueos: Bloqueo[]
  isLoading: boolean
  isRefreshing: boolean // Nuevo: para distinguir primera carga de refetch
  lastUpdate: number | null
}

interface AdminDataContextValue extends AdminData {
  refetch: () => Promise<void>
  updateZona: (zona: Zona) => void
  updateEstablecimiento: (est: Establecimiento) => void
  updateBloqueo: (bloqueo: Bloqueo) => void
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null)

const CACHE_KEY_PREFIX = "admin-data"
const CACHE_TTL = 3 * 60 * 1000 // 3 minutos

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const supabase = createClient()
  const [data, setData] = useState<AdminData>({
    establecimientos: [],
    zonas: [],
    reservas: [],
    bloqueos: [],
    isLoading: true,
    isRefreshing: false,
    lastUpdate: null,
  })

  // Cargar desde cache al montar
  useEffect(() => {
    if (!user?.id) {
      return
    }

    const cacheKey = `${CACHE_KEY_PREFIX}-${user.id}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        const age = Date.now() - parsed.timestamp

        if (age < CACHE_TTL) {
          setData({
            ...parsed.data,
            isLoading: false,
            isRefreshing: false,
            lastUpdate: parsed.timestamp,
          })
          return
        }
      } catch (e) {
        // Cache corrupto, ignorar
      }
    }

    // Si no hay cache o está expirado, cargar datos
    fetchAllData()
  }, [user?.id])
  const fetchAllData = useCallback(async () => {
    if (!user?.id) {
      return
    }

    try {
      // Si ya hay datos, usar isRefreshing en lugar de isLoading
      setData(prev => ({
        ...prev,
        isLoading: prev.establecimientos.length === 0, // Solo isLoading en primera carga
        isRefreshing: prev.establecimientos.length > 0, // isRefreshing en recargas
      }))

      // 1. Obtener establecimientos
      const { data: estData, error: estError } = await supabase
        .from("establecimientos")
        .select("*")
        .eq("owner_id", user.id)

      if (estError) throw estError

      const establecimientos: Establecimiento[] = (estData || []).map((e: any) => ({
        id: e.id,
        nombre: e.nombre,
        descripcion: e.descripcion || "",
        direccion: e.direccion,
        telefono: e.telefono || "",
        horarioAtencion: e.horario_atencion || "",
        servicios: e.servicios || [],
        ubicacion: e.ubicacion,
        foto: e.foto || "",
        ownerId: e.owner_id,
      }))

      if (establecimientos.length === 0) {
        const emptyData = {
          establecimientos: [],
          zonas: [],
          reservas: [],
          bloqueos: [],
          isLoading: false,
          isRefreshing: false,
          lastUpdate: Date.now(),
        }
        setData(emptyData)
        saveToCache(emptyData)
        return
      }

      const establecimientoIds = establecimientos.map(e => e.id)

      // 2. Obtener zonas
      const { data: zonasData, error: zonasError } = await supabase
        .from("zonas")
        .select("*")
        .in("establecimiento_id", establecimientoIds)

      if (zonasError) throw zonasError

      const zonas: Zona[] = (zonasData || []).map((z: any) => ({
        id: z.id,
        nombre: z.nombre,
        tipo: z.tipo,
        precio: z.precio,
        capacidad: z.capacidad,
        caracteristicas: z.caracteristicas || [],
        descripcion: z.descripcion || "",
        establecimientoId: z.establecimiento_id,
      }))

      const zonaIds = zonas.map(z => z.id)

      // 3. Obtener reservas
      let reservas: Reserva[] = []
      if (zonaIds.length > 0) {
        const { data: reservasData, error: reservasError } = await supabase
          .from("reservas")
          .select("*")
          .in("zona_id", zonaIds)

        if (!reservasError && reservasData) {
          reservas = (reservasData || []).map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            usuarioNombre: r.usuario_nombre,
            usuarioEmail: r.usuario_email,
            usuarioTelefono: r.usuario_telefono,
            canchaId: r.cancha_id || 0,
            zonaId: r.zona_id,
            fecha: r.fecha,
            horarios: r.horarios,
            precio: r.precio,
            estado: r.estado,
            fechaCreacion: r.fecha_creacion,
            metodoPago: r.metodo_pago,
            establecimiento: r.establecimiento,
            cancha: r.cancha,
            zona: r.zona,
            direccion: r.direccion,
            telefono: r.telefono,
            codigoVerificacion: r.codigo_verificacion,
          }))
        }
      }

      // 4. Obtener bloqueos
      let bloqueos: Bloqueo[] = []
      if (zonaIds.length > 0) {
        const { data: bloqueosData, error: bloqueosError } = await supabase
          .from("bloqueos")
          .select("*")
          .in("zona_id", zonaIds)

        if (!bloqueosError && bloqueosData) {
          bloqueos = (bloqueosData || []).map((b: any) => ({
            id: b.id,
            zonaId: b.zona_id,
            zonaNombre: b.zona_nombre,
            fecha: b.fecha,
            horaInicio: b.hora_inicio,
            horaFin: b.hora_fin,
            motivo: b.motivo,
            descripcion: b.descripcion || "",
            canchaId: 0,
          }))
        }
      }

      const newData = {
        establecimientos,
        zonas,
        reservas,
        bloqueos,
        isLoading: false,
        isRefreshing: false,
        lastUpdate: Date.now(),
      }

      setData(newData)
      saveToCache(newData)
    } catch (error) {
      console.error("Error al cargar datos del admin:", error)
      setData(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
      }))
    }
  }, [user?.id, supabase])

  const saveToCache = (dataToSave: Omit<AdminData, "isLoading" | "isRefreshing">) => {
    if (!user?.id) return

    try {
      const cacheKey = `${CACHE_KEY_PREFIX}-${user.id}`
      const cacheData = {
        data: {
          establecimientos: dataToSave.establecimientos,
          zonas: dataToSave.zonas,
          reservas: dataToSave.reservas,
          bloqueos: dataToSave.bloqueos,
        },
        timestamp: Date.now(),
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error("Error guardando cache:", error)
    }
  }

  const refetch = useCallback(async () => {
    await fetchAllData()
  }, [fetchAllData])

  const updateZona = useCallback((zona: Zona) => {
    setData(prev => {
      const newData = {
        ...prev,
        zonas: prev.zonas.some(z => z.id === zona.id)
          ? prev.zonas.map(z => (z.id === zona.id ? zona : z))
          : [...prev.zonas, zona],
        lastUpdate: Date.now(),
      }
      saveToCache(newData)
      return newData
    })
  }, [])

  const updateEstablecimiento = useCallback((est: Establecimiento) => {
    setData(prev => {
      const newData = {
        ...prev,
        establecimientos: prev.establecimientos.some(e => e.id === est.id)
          ? prev.establecimientos.map(e => (e.id === est.id ? est : e))
          : [...prev.establecimientos, est],
        lastUpdate: Date.now(),
      }
      saveToCache(newData)
      return newData
    })
  }, [])

  const updateBloqueo = useCallback((bloqueo: Bloqueo) => {
    setData(prev => {
      const newData = {
        ...prev,
        bloqueos: prev.bloqueos.some(b => b.id === bloqueo.id)
          ? prev.bloqueos.map(b => (b.id === bloqueo.id ? bloqueo : b))
          : [...prev.bloqueos, bloqueo],
        lastUpdate: Date.now(),
      }
      saveToCache(newData)
      return newData
    })
  }, [])

  return (
    <AdminDataContext.Provider
      value={{
        ...data,
        refetch,
        updateZona,
        updateEstablecimiento,
        updateBloqueo,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  )
}

export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (!context) {
    throw new Error("useAdminData debe usarse dentro de AdminDataProvider")
  }
  return context
}
