"use client"

import { Button } from "@/components/ui/button"
import { CanchaCard } from "./CanchaCard"
import { useFiltros } from "@/hooks/useFiltros"

export function CanchasGrid() {
  const { canchasFiltradas, limpiarFiltros } = useFiltros()

  return (
    <section id="canchas" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Establecimientos Disponibles</h2>
          <p className="text-gray-600 text-lg">Encuentra el establecimiento perfecto cerca de ti</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {canchasFiltradas.map((cancha) => (
            <CanchaCard key={cancha.id} cancha={cancha} />
          ))}
        </div>

        {canchasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron establecimientos con los filtros seleccionados.</p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
