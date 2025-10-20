"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useAppContext } from "@/contexts/AppContext"
import { useAuth } from "@/hooks/useAuth"
import { useReserva } from "@/hooks/useReserva"
import { useReservas } from "@/hooks/useReservas"
import { Calendar, Clock, MapPin, CreditCard, Smartphone, Building2 } from "lucide-react"
import { formatearPrecio, formatearFechaLocal } from "@/utils/formatters"
import { useRouter } from "next/navigation"
import type { Reserva } from "@/types"

export function CheckoutModal() {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const { cerrarCheckout } = useReserva()
  const { crearReserva } = useReservas()
  const router = useRouter()
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [isProcessing, setIsProcessing] = useState(false)

  const { checkout } = state
  const reservaData = checkout.reservaData

  if (!reservaData || !reservaData.cancha || !reservaData.zona) return null

  const handleConfirmarReserva = async () => {
    if (!user) return

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generar código de verificación único (6 dígitos)
      const codigoVerificacion = Math.random().toString().slice(2, 8).padStart(6, '0')

      const reservaData_API = {
        userId: user.id,
        usuarioNombre: user.nombre,
        usuarioEmail: user.email,
        usuarioTelefono: user.telefono || "No proporcionado",
        canchaId: 0, // Campo deprecated, ya no se usa
        zonaId: reservaData.zona!.id,
        fecha: formatearFechaLocal(reservaData.fecha),
        horarios: reservaData.horarios,
        precio: reservaData.total,
        estado: "pendiente" as const,
        metodoPago,
        establecimiento: reservaData.cancha!.establecimiento,
        cancha: reservaData.cancha!.nombre,
        zona: reservaData.zona!.nombre,
        direccion: reservaData.cancha!.direccion,
        telefono: reservaData.cancha!.telefono,
        codigoVerificacion,
      }

      // Guardar en Supabase
      const reservaCreada = await crearReserva(reservaData_API)

      // Crear objeto completo para el dispatch (con id y fechaCreacion)
      const nuevaReserva: Reserva = {
        id: reservaCreada.id,
        ...reservaData_API,
        fechaCreacion: reservaCreada.fecha_creacion || new Date().toISOString(),
      }

      dispatch({ type: "CONFIRMAR_RESERVA", payload: nuevaReserva })

      router.push(`/confirmacion/${nuevaReserva.id}`)
    } catch (error) {
      console.error("Error al crear reserva:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear la reserva"
      alert(`Hubo un error al crear la reserva:\n\n${errorMessage}\n\nPor favor intenta nuevamente.`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={checkout.isOpen} onOpenChange={cerrarCheckout}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar Reserva</DialogTitle>
          <DialogDescription>Revisa los detalles y completa tu reserva</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{reservaData.cancha!.establecimiento}</p>
                  <p className="text-sm text-gray-600">
                    {reservaData.cancha!.nombre} - {reservaData.zona!.nombre}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span>
                  {reservaData.fecha.toLocaleDateString("es-PE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span>{reservaData.horarios.join(", ")}</span>
              </div>

              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{reservaData.cancha!.direccion}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center font-medium text-lg">
                <span>Total:</span>
                <span className="text-green-600">{formatearPrecio(reservaData.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Método de Pago</CardTitle>
              <CardDescription>Selecciona cómo deseas pagar tu reserva</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={metodoPago} onValueChange={setMetodoPago}>
                <div className="flex items-center space-x-2 opacity-50">
                  <RadioGroupItem value="tarjeta" id="tarjeta" disabled />
                  <Label htmlFor="tarjeta" className="flex items-center cursor-not-allowed">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Tarjeta de Crédito/Débito
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                      En desarrollo
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 opacity-50">
                  <RadioGroupItem value="yape" id="yape" disabled />
                  <Label htmlFor="yape" className="flex items-center cursor-not-allowed">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Yape / Plin
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                      En desarrollo
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="efectivo" id="efectivo" />
                  <Label htmlFor="efectivo" className="flex items-center cursor-pointer">
                    <Building2 className="mr-2 h-4 w-4" />
                    Pago en el establecimiento
                  </Label>
                </div>
              </RadioGroup>

              {metodoPago === "efectivo" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Podrás pagar directamente en el establecimiento al momento de tu reserva. Recuerda llevar el
                    comprobante de reserva.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={cerrarCheckout} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarReserva}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Procesando..." : "Confirmar Reserva"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
