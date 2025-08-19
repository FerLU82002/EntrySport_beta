"use client"

import { useMemo } from "react"
import { useAppContext } from "@/contexts/AppContext"
import { useCanchas } from "@/hooks/useCanchas"

export function useFiltros() {
  const { state, dispatch } = useAppContext()
  const { canchas } = useCanchas()
  const { filtros } = state

  const canchasFiltradas = useMemo(() => {
    return canchas.filter((cancha) => {
      const cumpleTipo = filtros.tipo === "Todos" || cancha.tipo === filtros.tipo
      const cumpleUbicacion = filtros.ubicacion === "Todas" || cancha.ubicacion.includes(filtros.ubicacion)

      const precioMinimo = Math.min(...cancha.zonas.map((zona) => zona.precio))
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
  }, [filtros, canchas])

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
    setFiltroTipo,
    setFiltroUbicacion,
    setFiltroPrecio,
    setBusqueda,
    limpiarFiltros,
  }
}
