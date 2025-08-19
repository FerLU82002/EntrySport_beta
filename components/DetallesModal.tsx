"use client"

import Image from "next/image"
import { MapPin, Star, Clock, Phone, Users, CheckCircle, XCircle, Info, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useReserva } from "@/hooks/useReserva"
import { horariosDisponibles } from "@/data/canchas"
import { formatearPrecio } from "@/utils/formatters"

export function DetallesModal() {
  const {
    reserva,
    cerrarDetalles,
    seleccionarZona,
    setFecha,
    toggleHorario,
    esHorarioDisponible,
    calcularTotal,
    realizarReserva,
  } = useReserva()

  if (!reserva.selectedCancha) return null

  return (
    <Dialog open={reserva.isDetailsOpen} onOpenChange={cerrarDetalles}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">{reserva.selectedCancha.establecimiento}</DialogTitle>
          <DialogDescription className="text-lg">
            {reserva.selectedCancha.ubicacion} • {reserva.selectedCancha.zonas.length} zona
            {reserva.selectedCancha.zonas.length > 1 ? "s" : ""} disponible
            {reserva.selectedCancha.zonas.length > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <Image
              src={reserva.selectedCancha.imagen || "/placeholder.svg"}
              alt={reserva.selectedCancha.nombre}
              width={400}
              height={300}
              className="w-full h-48 object-cover rounded-lg"
            />

            <div className="flex items-center justify-between">
              <Badge className="bg-blue-500">{reserva.selectedCancha.tipo}</Badge>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium">{reserva.selectedCancha.rating}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-700">{reserva.selectedCancha.descripcion}</p>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {reserva.selectedCancha.direccion}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-1" />
                {reserva.selectedCancha.telefono}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {reserva.selectedCancha.horarioAtencion}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Servicios del establecimiento</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {reserva.selectedCancha.servicios.map((servicio, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    {servicio}
                  </li>
                ))}
              </ul>
            </div>

            {/* Selector de Zonas */}
            <div>
              <h4 className="font-semibold mb-3">Zonas disponibles</h4>
              <div className="space-y-2">
                {reserva.selectedCancha.zonas.map((zona) => (
                  <Card
                    key={zona.id}
                    className={`cursor-pointer transition-all ${
                      reserva.selectedZona?.id === zona.id ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => seleccionarZona(zona)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{zona.nombre}</h5>
                          <p className="text-xs text-gray-600 mt-1">{zona.descripcion}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {zona.capacidad} personas
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatearPrecio(zona.precio)}</div>
                          <div className="text-xs text-gray-500">/hora</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mapa de ubicación */}
            <div>
              <h4 className="font-semibold mb-3">Ubicación</h4>
              <div className="w-full h-64 rounded-lg overflow-hidden border">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.8!2d${reserva.selectedCancha.coordenadas.lng}!3d${reserva.selectedCancha.coordenadas.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA1JzQ3LjAiUyA3N8KwMDInMzQuMCJX!5e0!3m2!1ses!2spe!4v1635959999999!5m2!1ses!2spe`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa de ${reserva.selectedCancha.establecimiento}`}
                ></iframe>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {reserva.selectedCancha.direccion}
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${reserva.selectedCancha.coordenadas.lat},${reserva.selectedCancha.coordenadas.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Cómo llegar →
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Reservar: {reserva.selectedZona?.nombre}</h3>

              {!reserva.selectedCancha.disponible ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">Establecimiento no disponible</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Este establecimiento está temporalmente fuera de servicio
                  </p>
                </div>
              ) : reserva.selectedZona ? (
                <div>
                  <div className="space-y-4">
                    {/* Información de la zona seleccionada */}
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium mb-2">{reserva.selectedZona.nombre}</h4>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {reserva.selectedZona.caracteristicas.map((caracteristica, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {caracteristica}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center text-gray-600">
                          <Users className="h-3 w-3 mr-1" />
                          Hasta {reserva.selectedZona.capacidad} personas
                        </span>
                        <span className="font-semibold text-green-600">
                          {formatearPrecio(reserva.selectedZona.precio)}/hora
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Selecciona la fecha</Label>
                      <Calendar
                        mode="single"
                        selected={reserva.selectedDate}
                        onSelect={(date) => date && setFecha(date)}
                        disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="rounded-md border mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Horarios disponibles - {reserva.selectedDate.toLocaleDateString()}
                      </Label>
                      <ScrollArea className="h-48 border rounded-md p-2">
                        <div className="grid grid-cols-3 gap-2">
                          {horariosDisponibles.map((horario) => {
                            const disponible = esHorarioDisponible(horario)
                            const seleccionado = reserva.selectedHorarios.includes(horario)

                            return (
                              <Button
                                key={horario}
                                variant={seleccionado ? "default" : disponible ? "outline" : "secondary"}
                                size="sm"
                                disabled={!disponible}
                                onClick={() => toggleHorario(horario)}
                                className={`text-xs ${
                                  seleccionado
                                    ? "bg-green-600 hover:bg-green-700"
                                    : disponible
                                      ? "hover:bg-green-50"
                                      : "opacity-50 cursor-not-allowed"
                                }`}
                              >
                                {horario}
                                {!disponible && <XCircle className="h-3 w-3 ml-1" />}
                              </Button>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </div>

                    {reserva.selectedHorarios.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Resumen de reserva</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Establecimiento:</span>
                            <span>{reserva.selectedCancha.establecimiento}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Zona:</span>
                            <span>{reserva.selectedZona.nombre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fecha:</span>
                            <span>{reserva.selectedDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Horarios:</span>
                            <span>{reserva.selectedHorarios.join(", ")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Precio por hora:</span>
                            <span>{formatearPrecio(reserva.selectedZona.precio)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cantidad de horas:</span>
                            <span>{reserva.selectedHorarios.length}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total:</span>
                            <span className="text-green-600">{formatearPrecio(calcularTotal())}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={realizarReserva}
                      disabled={reserva.selectedHorarios.length === 0}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Reservar y Pagar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-600 font-medium">Selecciona una zona</p>
                  <p className="text-sm text-gray-600 mt-1">Elige una zona para ver horarios y hacer tu reserva</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
