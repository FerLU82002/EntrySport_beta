"use client"

import { useMemo, useState, useEffect } from "react"
import { useAppContext } from "@/contexts/AppContext"
import { canchas as canchasEstaticas } from "@/data/canchas"
import { useEstablecimientos } from "@/hooks/useEstablecimientos"
import { useZonas } from "@/hooks/useZonas"
import type { Cancha, Zona, Establecimiento } from "@/types"

const CACHE_KEY = "establecimientos-publicos"
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos para datos públicos

export function useFiltros() {
  const { state, dispatch } = useAppContext()
  const { filtros } = state
  const { establecimientos, fetchEstablecimientos } = useEstablecimientos()
  const { fetchZonasByEstablecimiento } = useZonas()
  const [canchasCombinadas, setCanchasCombinadas] = useState<Cancha[]>(canchasEstaticas)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargarCanchas = async () => {
      try {
        // Intentar cargar desde cache PRIMERO (sincrónicamente)
        const cached = localStorage.getItem(CACHE_KEY)
        let cacheValido = false
        
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached)
            const age = Date.now() - timestamp
            
            if (age < CACHE_TTL) {
              // Cache válido, usar datos cacheados INMEDIATAMENTE
              setCanchasCombinadas(data)
              setIsLoading(false)
              cacheValido = true
              return
            }
          } catch (e) {
            // Cache corrupto, continuar con fetch
            localStorage.removeItem(CACHE_KEY)
          }
        }
        
        // Solo mostrar loading si no hay cache válido
        if (!cacheValido) {
          setIsLoading(true)
        }
        
        // Si no hay cache válido, cargar desde Supabase
        const establecimientosSupabase = await fetchEstablecimientos()

        if (!establecimientosSupabase || establecimientosSupabase.length === 0) {
          // Si no hay establecimientos en Supabase, usar solo las estáticas
          setCanchasCombinadas(canchasEstaticas)
          setIsLoading(false)
          return
        }

        // Convertir establecimientos de Supabase a formato Cancha
        const canchasDeDuenos: Cancha[] = []

        for (const est of establecimientosSupabase) {
          // Cargar zonas de este establecimiento específico
          const zonasDelEstablecimiento = await fetchZonasByEstablecimiento(est.id)

          canchasDeDuenos.push({
            id: Number.parseInt(est.id.replace("est-", "")) || Date.now(),
            nombre: est.nombre,
            establecimiento: est.nombre,
            tipo: zonasDelEstablecimiento.length > 0 ? zonasDelEstablecimiento[0].tipo : "Fútbol 5",
            imagen: est.foto || "/placeholder.svg?height=300&width=400",
            ubicacion: est.ubicacion,
            direccion: est.direccion,
            coordenadas: { lat: -9.9306, lng: -76.2422 },
            rating: 4.5,
            disponible: true,
            telefono: est.telefono,
            descripcion: est.descripcion,
            servicios: est.servicios,
            horarioAtencion: est.horarioAtencion,
            zonas: zonasDelEstablecimiento,
          })
        }

        // Combinar canchas estáticas con las de Supabase
        const canchasCombinadas = [...canchasEstaticas, ...canchasDeDuenos]
        setCanchasCombinadas(canchasCombinadas)
        
        // Guardar en cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: canchasCombinadas,
            timestamp: Date.now()
          }))
        } catch (e) {
          console.error("Error guardando cache:", e)
        }
      } catch (error) {
        console.error("Error al cargar canchas:", error)
        // En caso de error, usar solo las estáticas
        setCanchasCombinadas(canchasEstaticas)
      } finally {
        setIsLoading(false)
      }
    }

    cargarCanchas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar el componente

  const canchasFiltradas = useMemo(() => {
    const resultado = canchasCombinadas.filter((cancha) => {
      const cumpleTipo = filtros.tipo === "Todos" || cancha.tipo === filtros.tipo
      
      // Filtro de ubicación mejorado para soportar formato "Departamento - Distrito"
      const cumpleUbicacion = 
        filtros.ubicacion === "Todas" || 
        cancha.ubicacion.includes(filtros.ubicacion) ||
        cancha.ubicacion.split(" - ")[1]?.includes(filtros.ubicacion) || // Comparar solo el distrito
        cancha.ubicacion.split(" - ")[0]?.includes(filtros.ubicacion) // Comparar solo el departamento

      const precioMinimo = cancha.zonas.length > 0 ? Math.min(...cancha.zonas.map((zona) => zona.precio)) : 0
      const cumplePrecio =
        filtros.precio === "Todos" ||
        (filtros.precio === "Menos de S/80" && precioMinimo < 80) ||
        (filtros.precio === "S/80 - S/150" && precioMinimo >= 80 && precioMinimo <= 150) ||
        (filtros.precio === "Más de S/150" && precioMinimo > 150)

      const cumpleBusqueda =
        filtros.busqueda === "" ||
        cancha.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        cancha.establecimiento.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        cancha.ubicacion.toLowerCase().includes(filtros.busqueda.toLowerCase())

      return cumpleTipo && cumpleUbicacion && cumplePrecio && cumpleBusqueda
    })
    
    return resultado
  }, [filtros, canchasCombinadas])

  const setFiltroTipo = (tipo: string) => {
    dispatch({ type: "SET_FILTRO_TIPO", payload: tipo })
  }

  const setFiltroUbicacion = (ubicacion: string) => {
    dispatch({ type: "SET_FILTRO_UBICACION", payload: ubicacion })
  }

  const setFiltroPrecio = (precio: string) => {
    dispatch({ type: "SET_FILTRO_PRECIO", payload: precio })
  }

  const setBusqueda = (busqueda: string) => {
    dispatch({ type: "SET_BUSQUEDA", payload: busqueda })
  }

  const limpiarFiltros = () => {
    dispatch({ type: "LIMPIAR_FILTROS" })
  }

  return {
    filtros,
    canchasFiltradas,
    isLoading,
    setFiltroTipo,
    setFiltroUbicacion,
    setFiltroPrecio,
    setBusqueda,
    limpiarFiltros,
  }
}
