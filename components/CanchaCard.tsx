"use client"

import Image from "next/image"
import { MapPin, Star, Users, Phone, Info, MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Cancha } from "@/types"
import { useReserva } from "@/hooks/useReserva"
import { formatearPrecio, obtenerRangoPrecio } from "@/utils/formatters"

interface CanchaCardProps {
  cancha: Cancha
}

export function CanchaCard({ cancha }: CanchaCardProps) {
  const { abrirDetalles } = useReserva()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="relative">
        <Image
          src={cancha.imagen || "/placeholder.svg"}
          alt={cancha.nombre}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        <Badge
          className={`absolute top-3 right-3 ${
            cancha.disponible ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {cancha.disponible ? "Disponible" : "Ocupado"}
        </Badge>
        <Badge className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-600">{cancha.tipo}</Badge>
        {cancha.zonas.length > 1 && (
          <Badge className="absolute bottom-3 left-3 bg-purple-500 hover:bg-purple-600">
            {cancha.zonas.length} zonas
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{cancha.establecimiento}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {cancha.ubicacion}
            </CardDescription>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">{cancha.rating}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <MapIcon className="h-4 w-4 mr-1" />
              {cancha.zonas.length} zona{cancha.zonas.length > 1 ? "s" : ""}
            </span>
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              {cancha.telefono}
            </span>
          </div>

          <div className="space-y-2">
            {cancha.zonas.slice(0, 2).map((zona) => (
              <div key={zona.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-medium">{zona.nombre}</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {zona.capacidad} personas
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 text-sm">{formatearPrecio(zona.precio)}</div>
                  <div className="text-xs text-gray-500">/hora</div>
                </div>
              </div>
            ))}
            {cancha.zonas.length > 2 && (
              <div className="text-center text-sm text-gray-500">
                +{cancha.zonas.length - 2} zona{cancha.zonas.length - 2 > 1 ? "s" : ""} más
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-lg font-bold text-green-600">{obtenerRangoPrecio(cancha.zonas)}</span>
              <span className="text-gray-500 text-sm">/hora</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!cancha.disponible}
          onClick={() => abrirDetalles(cancha)}
        >
          {cancha.disponible ? "Ver Zonas" : "No Disponible"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => abrirDetalles(cancha)}>
          <Info className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
