"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wifi, WifiOff } from "lucide-react"
import { CanchaCard } from "./CanchaCard"
import { useFiltros } from "@/hooks/useFiltros"
import { useCanchas } from "@/hooks/useCanchas"

export function CanchasGrid() {
  const { canchasFiltradas, limpiarFiltros } = useFiltros()
  const { loading, useSupabase } = useCanchas()

  return (
    <section id="canchas" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Establecimientos Disponibles</h2>
          <p className="text-gray-600 text-lg">Encuentra el establecimiento perfecto cerca de ti</p>

          {/* Indicador de estado de conexión */}
          <div className="flex items-center justify-center mt-4">
            {useSupabase ? (
              <div className="flex items-center text-green-600 text-sm">
                <Wifi className="h-4 w-4 mr-1" />
                Datos en tiempo real
              </div>
            ) : (
              <div className="flex items-center text-orange-600 text-sm">
                <WifiOff className="h-4 w-4 mr-1" />
                Modo demostración
              </div>
            )}
          </div>
        </div>

        {/* Mostrar alerta si no está conectado a Supabase */}
        {!useSupabase && (
          <Alert className="mb-6">
            <AlertDescription>
              Mostrando datos de demostración. Para funcionalidad completa, configura la conexión a Supabase.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Cargando establecimientos...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {canchasFiltradas.map((cancha) => (
                <CanchaCard key={cancha.id} cancha={cancha} />
              ))}
            </div>

            {canchasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron establecimientos con los filtros seleccionados.
                </p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
