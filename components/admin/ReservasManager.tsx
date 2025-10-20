"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Phone, User, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { formatearPrecio, parsearFechaLocal, formatearFechaLocal } from "@/utils/formatters"
import { useReservas } from "@/hooks/useReservas"
import { useZonas } from "@/hooks/useZonas"
import { useAuth } from "@/hooks/useAuth"
import type { Cancha, Reserva, Zona } from "@/types"

interface ReservasManagerProps {
  canchas: Cancha[]
}

export function ReservasManager({ canchas }: ReservasManagerProps) {
  const { user } = useAuth()
  const { reservas, fetchReservasDeZonas, actualizarEstadoReserva, isLoading } = useReservas()
  const { zonas: zonasDelDueno, fetchMisZonas } = useZonas()
  const [filtroZona, setFiltroZona] = useState<string>("todas")
  const [filtroEstado, setFiltroEstado] = useState<string>("todas")

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user) return

      // Cargar zonas del dueño
      await fetchMisZonas(user.id)
      
      // Cargar reservas de las zonas del dueño
      await fetchReservasDeZonas(user.id)
    }

    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]) // Solo depender del user.id

  const reservasFiltradas = reservas.filter((reserva) => {
    const cumpleZona = filtroZona === "todas" || reserva.zonaId === filtroZona
    const cumpleEstado = filtroEstado === "todas" || reserva.estado === filtroEstado
    return cumpleZona && cumpleEstado
  })

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fechaHoyStr = formatearFechaLocal(hoy)

  const reservasHoy = reservasFiltradas.filter((r) => r.fecha === fechaHoyStr)

  const reservasProximas = reservasFiltradas.filter((r) => {
    const fechaReserva = parsearFechaLocal(r.fecha)
    return fechaReserva > hoy
  })

  const reservasHistorial = reservasFiltradas.filter((r) => {
    const fechaReserva = parsearFechaLocal(r.fecha)
    return fechaReserva < hoy
  })

  const cambiarEstadoReserva = async (reservaId: string, nuevoEstado: "confirmada" | "cancelada" | "completada" | "pendiente") => {
    try {
      await actualizarEstadoReserva(reservaId, nuevoEstado)
      
      // Recargar reservas
      if (user) {
        await fetchReservasDeZonas(user.id)
      }
    } catch (error) {
      console.error("Error al cambiar estado de reserva:", error)
      alert("Hubo un error al cambiar el estado. Por favor intenta nuevamente.")
    }
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
        {/* Datos del cliente */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-semibold text-sm text-blue-900 mb-2">Datos del Cliente</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center text-sm">
              <User className="mr-2 h-4 w-4 text-blue-600" />
              <span className="font-medium">{reserva.usuarioNombre}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="mr-2">📧</span>
              <span>{reserva.usuarioEmail}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Phone className="mr-2 h-4 w-4 text-blue-600" />
              <span>{reserva.usuarioTelefono}</span>
            </div>
          </div>
        </div>

        {/* Código de verificación */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-center">
          <p className="text-xs font-medium text-green-800 mb-1">Código de Verificación</p>
          <p className="text-3xl font-bold text-green-700 tracking-wider font-mono">
            {reserva.codigoVerificacion || "------"}
          </p>
          <p className="text-xs text-green-600 mt-1">Solicitar al cliente en la entrada</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            {parsearFechaLocal(reserva.fecha).toLocaleDateString("es-PE", {
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <CreditCard className="mr-2 h-4 w-4" />
            {formatearPrecio(reserva.precio)} - {reserva.metodoPago}
          </div>
          <div className="text-xs text-gray-500">ID: {reserva.id.slice(0, 12)}...</div>
        </div>

        {reserva.estado === "pendiente" && (
          <div className="flex gap-2 pt-2 border-t">
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

        {/* Controles de administrador - siempre visibles */}
        <div className="pt-2 border-t">
          <p className="text-xs font-medium mb-2 text-gray-600">Cambiar Estado:</p>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={reserva.estado === "pendiente" ? "default" : "outline"}
              size="sm"
              onClick={() => cambiarEstadoReserva(reserva.id, "pendiente")}
              className={`text-xs ${reserva.estado === "pendiente" ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
            >
              Pendiente
            </Button>
            <Button
              variant={reserva.estado === "confirmada" ? "default" : "outline"}
              size="sm"
              onClick={() => cambiarEstadoReserva(reserva.id, "confirmada")}
              className={`text-xs ${reserva.estado === "confirmada" ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              Confirmada
            </Button>
            <Button
              variant={reserva.estado === "completada" ? "default" : "outline"}
              size="sm"
              onClick={() => cambiarEstadoReserva(reserva.id, "completada")}
              className={`text-xs ${reserva.estado === "completada" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            >
              Completada
            </Button>
            <Button
              variant={reserva.estado === "cancelada" ? "default" : "outline"}
              size="sm"
              onClick={() => cambiarEstadoReserva(reserva.id, "cancelada")}
              className={`text-xs ${reserva.estado === "cancelada" ? "bg-red-600 hover:bg-red-700" : ""}`}
            >
              Cancelada
            </Button>
          </div>
        </div>
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
        <Select value={filtroZona} onValueChange={setFiltroZona}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por zona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las zonas</SelectItem>
            {zonasDelDueno.map((zona) => (
              <SelectItem key={zona.id} value={zona.id}>
                {zona.nombre} - {zona.tipo}
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
