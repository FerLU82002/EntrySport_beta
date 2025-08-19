"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFiltros } from "@/hooks/useFiltros"

export function HeroSection() {
  const { filtros, setBusqueda } = useFiltros()

  return (
    <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Encuentra y reserva canchas sintéticas</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Más de 50 establecimientos deportivos en Lima. Compara precios, ubicaciones y reserva al instante.
        </p>

        <div className="max-w-2xl mx-auto bg-white rounded-lg p-2 flex items-center shadow-lg">
          <Search className="h-5 w-5 text-gray-400 ml-3" />
          <Input
            placeholder="Buscar por nombre, establecimiento o ubicación..."
            className="border-0 focus-visible:ring-0 text-gray-900"
            value={filtros.busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Button className="bg-green-600 hover:bg-green-700 ml-2">Buscar</Button>
        </div>
      </div>
    </section>
  )
}
