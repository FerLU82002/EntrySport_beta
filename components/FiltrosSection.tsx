"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFiltros } from "@/hooks/useFiltros"
import { tiposCancha, ubicaciones, rangosPrecio } from "@/data/canchas"

export function FiltrosSection() {
  const { filtros, canchasFiltradas, setFiltroTipo, setFiltroUbicacion, setFiltroPrecio, limpiarFiltros } = useFiltros()

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Filtros:</span>
          </div>

          <Select value={filtros.tipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Deporte" />
            </SelectTrigger>
            <SelectContent>
              {tiposCancha.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.ubicacion} onValueChange={setFiltroUbicacion}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              {ubicaciones.map((ubicacion) => (
                <SelectItem key={ubicacion} value={ubicacion}>
                  {ubicacion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.precio} onValueChange={setFiltroPrecio}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rango de precio" />
            </SelectTrigger>
            <SelectContent>
              {rangosPrecio.map((rango) => (
                <SelectItem key={rango} value={rango}>
                  {rango}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Mostrando {canchasFiltradas.length} de {canchasFiltradas.length} establecimientos disponibles
          </p>
        </div>
      </div>
    </section>
  )
}
