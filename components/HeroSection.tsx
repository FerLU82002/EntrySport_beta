"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFiltros } from "@/hooks/useFiltros"
import { tiposCancha, rangosPrecio } from "@/data/canchas"
import { useState } from "react"

export function HeroSection() {
  const { filtros, canchasFiltradas, setBusqueda, setFiltroTipo, setFiltroUbicacion, setFiltroPrecio, limpiarFiltros } =
    useFiltros()

  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>("Todos")
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>("Todos")

  // Estructura jerárquica: Departamento → Provincias/Distritos (misma que EstablecimientoManager)
  const ubicacionesPeru = {
    Lima: [
      "Cercado de Lima",
      "San Isidro",
      "Miraflores",
      "San Borja",
      "Surco",
      "La Molina",
      "San Miguel",
      "Jesús María",
      "Lince",
      "Magdalena",
      "Pueblo Libre",
      "Barranco",
      "Chorrillos",
      "San Juan de Miraflores",
      "Villa María del Triunfo",
      "Villa El Salvador",
      "Los Olivos",
      "San Martín de Porres",
      "Independencia",
      "Comas",
      "Carabayllo",
      "Puente Piedra",
      "Ate",
      "Santa Anita",
      "El Agustino",
      "San Luis",
      "La Victoria",
    ],
    Huánuco: [
      "Huánuco",
      "Tingo María",
      "Ambo",
      "La Unión",
      "Dos de Mayo",
      "Huacaybamba",
      "Huamalíes",
      "Leoncio Prado",
      "Marañón",
      "Pachitea",
      "Puerto Inca",
      "Lauricocha",
    ],
    Cusco: [
      "Cusco",
      "Wanchaq",
      "Santiago",
      "San Sebastián",
      "San Jerónimo",
      "Calca",
      "Urubamba",
      "Ollantaytambo",
      "Pisac",
      "Chinchero",
      "Maras",
    ],
    Arequipa: [
      "Cercado de Arequipa",
      "Cayma",
      "Cerro Colorado",
      "Characato",
      "Chiguata",
      "Jacobo Hunter",
      "José Luis Bustamante y Rivero",
      "Mariano Melgar",
      "Miraflores",
      "Paucarpata",
      "Sabandía",
      "Sachaca",
      "Socabaya",
      "Tiabaya",
      "Yanahuara",
      "Yarabamba",
      "Yura",
    ],
    "La Libertad": [
      "Trujillo",
      "El Porvenir",
      "Florencia de Mora",
      "Huanchaco",
      "La Esperanza",
      "Laredo",
      "Moche",
      "Poroto",
      "Salaverry",
      "Simbal",
      "Víctor Larco Herrera",
    ],
    Piura: [
      "Piura",
      "Castilla",
      "Catacaos",
      "Cura Mori",
      "El Tallán",
      "La Arena",
      "La Unión",
      "Las Lomas",
      "Tambo Grande",
      "Sullana",
      "Paita",
      "Talara",
    ],
    Lambayeque: [
      "Chiclayo",
      "José Leonardo Ortiz",
      "La Victoria",
      "Pimentel",
      "Pomalca",
      "Reque",
      "Santa Rosa",
      "Lambayeque",
      "Ferreñafe",
    ],
    Cajamarca: [
      "Cajamarca",
      "Asunción",
      "Chetilla",
      "Cospán",
      "Encañada",
      "Jesús",
      "Llacanora",
      "Los Baños del Inca",
      "Magdalena",
      "Matara",
      "Namora",
    ],
    Puno: ["Puno", "Juliaca", "Ilave", "Yunguyo", "Juli", "Desaguadero", "Azángaro"],
    Ica: ["Ica", "Chincha", "Pisco", "Nazca", "Palpa"],
    Junín: ["Huancayo", "El Tambo", "Chilca", "Concepción", "Jauja", "Tarma", "La Oroya", "Satipo", "Chanchamayo"],
    Ucayali: ["Pucallpa", "Callería", "Yarinacocha", "Manantay", "Campoverde"],
    Loreto: ["Iquitos", "Punchana", "Belén", "San Juan Bautista", "Yurimaguas", "Nauta"],
    Ancash: ["Huaraz", "Chimbote", "Nuevo Chimbote", "Casma", "Huarmey", "Caraz"],
  }

  const handleDepartamentoChange = (departamento: string) => {
    setDepartamentoSeleccionado(departamento)
    setDistritoSeleccionado("Todos")
    // Si selecciona "Todos", limpiar el filtro de ubicación
    if (departamento === "Todos") {
      setFiltroUbicacion("Todas")
    } else {
      // Filtrar por departamento
      setFiltroUbicacion(departamento)
    }
  }

  const handleDistritoChange = (distrito: string) => {
    setDistritoSeleccionado(distrito)
    // Filtrar por distrito específico
    if (distrito === "Todos") {
      setFiltroUbicacion(departamentoSeleccionado)
    } else {
      setFiltroUbicacion(distrito)
    }
  }

  const handleLimpiarFiltros = () => {
    setDepartamentoSeleccionado("Todos")
    setDistritoSeleccionado("Todos")
    limpiarFiltros()
  }

  return (
    <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Encuentra y Reserva Canchas Deportivas en Huánuco</h1>
          <p className="text-sm opacity-90">Reserva al instante tu espacio deportivo favorito</p>
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
                <SelectTrigger className="h-9 text-sm text-gray-900">
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
              <label className="text-xs font-medium text-gray-600 mb-1 block">Departamento</label>
              <Select value={departamentoSeleccionado} onValueChange={handleDepartamentoChange}>
                <SelectTrigger className="h-9 text-sm text-gray-900">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {Object.keys(ubicacionesPeru).map((departamento) => (
                    <SelectItem key={departamento} value={departamento}>
                      {departamento}
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
                disabled={!departamentoSeleccionado || departamentoSeleccionado === "Todos"}
              >
                <SelectTrigger className="h-9 text-sm text-gray-900">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {departamentoSeleccionado &&
                    departamentoSeleccionado !== "Todos" &&
                    ubicacionesPeru[departamentoSeleccionado as keyof typeof ubicacionesPeru]?.map((distrito) => (
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
                <SelectTrigger className="h-9 text-sm text-gray-900">
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
