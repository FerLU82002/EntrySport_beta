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
import { Calendar, Clock, MapPin, CreditCard, Smartphone, Building2 } from "lucide-react"
import { formatearPrecio } from "@/utils/formatters"
import { useRouter } from "next/navigation"
import type { Reserva } from "@/types"

export function CheckoutModal() {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const { cerrarCheckout } = useReserva()
  const router = useRouter()
  const [metodoPago, setMetodoPago] = useState("tarjeta")
  const [isProcessing, setIsProcessing] = useState(false)

  const { checkout } = state
  const reservaData = checkout.reservaData

  if (!reservaData) return null

  const handleConfirmarReserva = async () => {
    if (!user) return

    setIsProcessing(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const nuevaReserva: Reserva = {
      id: `res-${Date.now()}`,
      userId: user.id,
      canchaId: reservaData.cancha.id,
      zonaId: reservaData.zona.id,
      fecha: reservaData.fecha.toISOString().split("T")[0],
      horarios: reservaData.horarios,
      precio: reservaData.total,
      estado: "confirmada",
      fechaCreacion: new Date().toISOString(),
      metodoPago,
      establecimiento: reservaData.cancha.establecimiento,
      cancha: reservaData.cancha.nombre,
      zona: reservaData.zona.nombre,
      direccion: reservaData.cancha.direccion,
      telefono: reservaData.cancha.telefono,
    }

    const reservasExistentes = JSON.parse(localStorage.getItem("reservas") || "[]")
    reservasExistentes.push(nuevaReserva)
    localStorage.setItem("reservas", JSON.stringify(reservasExistentes))

    dispatch({ type: "CONFIRMAR_RESERVA", payload: nuevaReserva })
    setIsProcessing(false)

    router.push(`/confirmacion/${nuevaReserva.id}`)
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
                  <p className="font-medium">{reservaData.cancha.establecimiento}</p>
                  <p className="text-sm text-gray-600">
                    {reservaData.cancha.nombre} - {reservaData.zona.nombre}
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
                <span className="text-sm">{reservaData.cancha.direccion}</span>
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tarjeta" id="tarjeta" />
                  <Label htmlFor="tarjeta" className="flex items-center cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Tarjeta de Crédito/Débito
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yape" id="yape" />
                  <Label htmlFor="yape" className="flex items-center cursor-pointer">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Yape / Plin
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

              {metodoPago === "tarjeta" && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="numero-tarjeta">Número de tarjeta</Label>
                      <Input id="numero-tarjeta" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div>
                      <Label htmlFor="nombre-tarjeta">Nombre en la tarjeta</Label>
                      <Input id="nombre-tarjeta" placeholder="Juan Pérez" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiracion">Fecha de expiración</Label>
                      <Input id="expiracion" placeholder="MM/AA" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                </div>
              )}

              {metodoPago === "yape" && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-sm text-purple-800">
                    Después de confirmar, recibirás las instrucciones para completar el pago por Yape o Plin
                  </p>
                </div>
              )}

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
