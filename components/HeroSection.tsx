"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFiltros } from "@/hooks/useFiltros"
import { tiposCancha, ubicacionesHuanuco, rangosPrecio } from "@/data/canchas"
import { useState } from "react"

export function HeroSection() {
  const { filtros, canchasFiltradas, setBusqueda, setFiltroTipo, setFiltroUbicacion, setFiltroPrecio, limpiarFiltros } =
    useFiltros()

  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>("Todos")
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>("Todos")

  const handleProvinciaChange = (provincia: string) => {
    setProvinciaSeleccionada(provincia)
    setDistritoSeleccionado("Todos")
    setFiltroUbicacion(provincia)
  }

  const handleDistritoChange = (distrito: string) => {
    setDistritoSeleccionado(distrito)
    setFiltroUbicacion(distrito)
  }

  const handleLimpiarFiltros = () => {
    setProvinciaSeleccionada("Todos")
    setDistritoSeleccionado("Todos")
    limpiarFiltros()
  }

  return (
    <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Reserva Canchas Deportivas en Huánuco</h1>
          <p className="text-sm opacity-90">Encuentra y reserva al instante</p>
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-lg p-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Buscador */}
            <div className="md:col-span-4">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Buscar</label>
              <div className="flex items-center bg-gray-50 rounded-lg p-2">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <Input
                  placeholder="Nombre o establecimiento..."
                  className="border-0 focus-visible:ring-0 text-gray-900 bg-transparent text-sm p-0 h-auto"
                  value={filtros.busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro de Deporte */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Deporte</label>
              <Select value={filtros.tipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {tiposCancha.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Provincia</label>
              <Select value={provinciaSeleccionada} onValueChange={handleProvinciaChange}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {Object.keys(ubicacionesHuanuco.provincias).map((provincia) => (
                    <SelectItem key={provincia} value={provincia}>
                      {provincia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Distrito</label>
              <Select
                value={distritoSeleccionado}
                onValueChange={handleDistritoChange}
                disabled={!provinciaSeleccionada || provinciaSeleccionada === "Todos"}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {provinciaSeleccionada &&
                    provinciaSeleccionada !== "Todos" &&
                    ubicacionesHuanuco.provincias[
                      provinciaSeleccionada as keyof typeof ubicacionesHuanuco.provincias
                    ]?.distritos.map((distrito) => (
                      <SelectItem key={distrito} value={distrito}>
                        {distrito}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Precio */}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Precio</label>
              <Select value={filtros.precio} onValueChange={setFiltroPrecio}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {rangosPrecio.map((rango) => (
                    <SelectItem key={rango} value={rango}>
                      {rango}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones de acción y contador */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="text-sm text-gray-600 font-medium">
              {canchasFiltradas.length} establecimiento{canchasFiltradas.length !== 1 ? "s" : ""} encontrado
              {canchasFiltradas.length !== 1 ? "s" : ""}
            </div>
            <Button variant="outline" onClick={handleLimpiarFiltros} size="sm" className="text-gray-700 bg-transparent">
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
