"use client"

import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, Phone, CreditCard, AlertTriangle, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Reserva } from "@/types"

export default function MisReservasPage() {
  const { user, canAccess, isLoading } = useAuth()
  const [reservasUsuario, setReservasUsuario] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLoading(false)
        return
      }

      if (!canAccess("/mis-reservas")) {
        setLoading(false)
        return
      }

      const todasLasReservas = JSON.parse(localStorage.getItem("reservas") || "[]")
      const reservasFiltradas = todasLasReservas.filter((reserva: Reserva) => reserva.userId === user.id)

      setReservasUsuario(reservasFiltradas)
      setLoading(false)
    }
  }, [user, canAccess, isLoading])

  const cancelarReserva = (reservaId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return

    const todasLasReservas = JSON.parse(localStorage.getItem("reservas") || "[]")
    const reservasActualizadas = todasLasReservas.map((r: Reserva) =>
      r.id === reservaId ? { ...r, estado: "cancelada" as const } : r,
    )
    localStorage.setItem("reservas", JSON.stringify(reservasActualizadas))

    // Actualizar estado local
    setReservasUsuario(reservasActualizadas.filter((r: Reserva) => r.userId === user?.id))
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Cargando tus reservas...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tus reservas</p>
          <Link href="/login">
            <Button className="bg-green-600 hover:bg-green-700">Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!canAccess("/mis-reservas")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Acceso No Autorizado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta sección</p>
          <Link href={user.role === "dueno" ? "/admin" : "/"}>
            <Button className="bg-green-600 hover:bg-green-700">
              {user.role === "dueno" ? "Ir al Panel de Dueño" : "Volver al Inicio"}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const reservasProximas = reservasUsuario.filter((r) => new Date(r.fecha) >= new Date() && r.estado !== "cancelada")
  const reservasHistorial = reservasUsuario.filter((r) => new Date(r.fecha) < new Date() || r.estado === "cancelada")

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
          <MapPin className="mr-2 h-4 w-4" />
          {reserva.direccion}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="mr-2 h-4 w-4" />
          {reserva.telefono}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <CreditCard className="mr-2 h-4 w-4" />
            S/ {reserva.precio}
          </div>
          <div className="text-xs text-gray-500">ID: {reserva.id}</div>
        </div>

        {reserva.estado === "confirmada" && new Date(reserva.fecha) >= new Date() && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelarReserva(reserva.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar Reserva
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reservas</h1>
          <p className="text-gray-600">Gestiona todas tus reservas de canchas deportivas</p>
        </div>

        <Tabs defaultValue="proximas" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="proximas">Próximas ({reservasProximas.length})</TabsTrigger>
            <TabsTrigger value="historial">Historial ({reservasHistorial.length})</TabsTrigger>
          </TabsList>

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
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No tienes reservas próximas</p>
                  <Link href="/">
                    <Button className="bg-green-600 hover:bg-green-700">Hacer una Reserva</Button>
                  </Link>
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
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No tienes reservas en el historial</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
