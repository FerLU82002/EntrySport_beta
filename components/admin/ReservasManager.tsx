"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Phone, User, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { formatearPrecio } from "@/utils/formatters"
import type { Cancha, Reserva } from "@/types"

interface ReservasManagerProps {
  canchas: Cancha[]
}

export function ReservasManager({ canchas }: ReservasManagerProps) {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [filtroCancha, setFiltroCancha] = useState<string>("todas")
  const [filtroEstado, setFiltroEstado] = useState<string>("todas")

  useEffect(() => {
    const todasReservas = JSON.parse(localStorage.getItem("reservas") || "[]")

    const canchasIds = canchas.map((c) => c.id)
    const reservasDelDueno = todasReservas.filter((r: Reserva) => canchasIds.includes(r.canchaId))

    setReservas(reservasDelDueno)
  }, [canchas])

  const reservasFiltradas = reservas.filter((reserva) => {
    const cumpleCancha = filtroCancha === "todas" || reserva.canchaId.toString() === filtroCancha
    const cumpleEstado = filtroEstado === "todas" || reserva.estado === filtroEstado
    return cumpleCancha && cumpleEstado
  })

  const reservasHoy = reservasFiltradas.filter((r) => r.fecha === new Date().toISOString().split("T")[0])

  const reservasProximas = reservasFiltradas.filter((r) => new Date(r.fecha) > new Date())

  const reservasHistorial = reservasFiltradas.filter((r) => new Date(r.fecha) <= new Date())

  const cambiarEstadoReserva = (reservaId: string, nuevoEstado: "confirmada" | "cancelada") => {
    const nuevasReservas = reservas.map((r) => (r.id === reservaId ? { ...r, estado: nuevoEstado } : r))
    setReservas(nuevasReservas)

    const todasReservas = JSON.parse(localStorage.getItem("reservas") || "[]")
    const reservasActualizadas = todasReservas.map((r: Reserva) =>
      r.id === reservaId ? { ...r, estado: nuevoEstado } : r,
    )
    localStorage.setItem("reservas", JSON.stringify(reservasActualizadas))
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      case "completada":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const ReservaCard = ({ reserva }: { reserva: Reserva }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{reserva.establecimiento}</CardTitle>
            <CardDescription>
              {reserva.cancha} - {reserva.zona}
            </CardDescription>
          </div>
          {getEstadoBadge(reserva.estado)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date(reserva.fecha).toLocaleDateString("es-PE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="mr-2 h-4 w-4" />
            {reserva.horarios.join(", ")}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="mr-2 h-4 w-4" />
            Usuario ID: {reserva.userId}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="mr-2 h-4 w-4" />
            {reserva.telefono}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <CreditCard className="mr-2 h-4 w-4" />
            {formatearPrecio(reserva.precio)} - {reserva.metodoPago}
          </div>
          <div className="text-xs text-gray-500">ID: {reserva.id}</div>
        </div>

        {reserva.estado === "pendiente" && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => cambiarEstadoReserva(reserva.id, "confirmada")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cambiarEstadoReserva(reserva.id, "cancelada")}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Reservas</h2>
        <p className="text-gray-600">Administra todas las reservas de tus canchas</p>
      </div>

      <div className="flex gap-4">
        <Select value={filtroCancha} onValueChange={setFiltroCancha}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por cancha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las canchas</SelectItem>
            {canchas.map((cancha) => (
              <SelectItem key={cancha.id} value={cancha.id.toString()}>
                {cancha.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="confirmada">Confirmadas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
            <SelectItem value="completada">Completadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="hoy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hoy">Hoy ({reservasHoy.length})</TabsTrigger>
          <TabsTrigger value="proximas">Próximas ({reservasProximas.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial ({reservasHistorial.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="hoy" className="space-y-4">
          {reservasHoy.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservasHoy.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas para hoy</h3>
                <p className="text-gray-600">Las reservas de hoy aparecerán aquí</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="proximas" className="space-y-4">
          {reservasProximas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservasProximas.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas próximas</h3>
                <p className="text-gray-600">Las próximas reservas aparecerán aquí</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          {reservasHistorial.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservasHistorial.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial de reservas</h3>
                <p className="text-gray-600">El historial de reservas aparecerá aquí</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
