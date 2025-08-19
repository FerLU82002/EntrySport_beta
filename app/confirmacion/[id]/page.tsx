"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Clock, MapPin, CreditCard, ArrowRight } from "lucide-react"
import { supabase, type Reserva } from "@/lib/supabase"
import { formatearPrecio } from "@/utils/formatters"

export default function ConfirmacionPage() {
  const params = useParams()
  const router = useRouter()
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReserva = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from("reservas")
          .select(`
            *,
            cancha:canchas (
              *,
              establecimiento:establecimientos (*)
            )
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error
        setReserva(data)
      } catch (error) {
        console.error("Error fetching reserva:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReserva()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reserva no encontrada</h3>
            <p className="text-gray-600 mb-4">La reserva que buscas no existe o ha sido eliminada.</p>
            <Button onClick={() => router.push("/")}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header de confirmación */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h1>
            <p className="text-gray-600">
              Tu reserva ha sido {reserva.estado === "paid" ? "confirmada y pagada" : "creada exitosamente"}
            </p>
          </div>

          {/* Detalles de la reserva */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{reserva.cancha?.establecimiento?.nombre}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {reserva.cancha?.establecimiento?.ubicacion}
                  </CardDescription>
                </div>
                <Badge
                  variant={reserva.estado === "paid" ? "default" : "secondary"}
                  className={reserva.estado === "paid" ? "bg-green-600" : ""}
                >
                  {reserva.estado === "paid" ? "Pagado" : "Pendiente de Pago"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Detalles de la Reserva</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID de Reserva:</span>
                        <span className="font-mono">{reserva.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cancha:</span>
                        <span>{reserva.cancha?.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span>{reserva.cancha?.tipo}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Fecha y Horario</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {new Date(reserva.fecha).toLocaleDateString("es-PE", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {reserva.hora_inicio} - {reserva.hora_fin}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Información de Contacto</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teléfono:</span>
                        <span>{reserva.cancha?.establecimiento?.telefono}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dirección:</span>
                        <span className="text-right">{reserva.cancha?.establecimiento?.direccion}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Resumen de Pago</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>{formatearPrecio(reserva.precio_total)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-green-600">{formatearPrecio(reserva.precio_total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {reserva.notas && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Notas adicionales</h4>
                  <p className="text-sm text-gray-600">{reserva.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push("/dashboard")} className="flex-1 bg-green-600 hover:bg-green-700">
              Ver Mi Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {reserva.estado === "pending" && (
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  // Aquí se integraría con la pasarela de pagos
                  alert("Redirigiendo a la pasarela de pagos...")
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Completar Pago
              </Button>
            )}

            <Button variant="outline" onClick={() => router.push("/")}>
              Hacer Otra Reserva
            </Button>
          </div>

          {/* Información adicional */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h4 className="font-medium text-gray-900 mb-3">Información Importante</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Llega 10 minutos antes de tu horario reservado</li>
                <li>• Presenta tu ID de reserva en recepción</li>
                <li>• Las cancelaciones deben hacerse con 24 horas de anticipación</li>
                <li>• Revisa las reglas del establecimiento antes de tu visita</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
