"use client"

import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, Phone, CreditCard } from "lucide-react"
import Link from "next/link"

const RESERVAS_DEMO = {
  "user-1": [
    {
      id: "res-1",
      establecimiento: "Complejo Deportivo San Martín",
      cancha: "Cancha de Fútbol 7",
      zona: "Zona A",
      fecha: "2024-01-15",
      horarios: ["18:00", "19:00"],
      precio: 160,
      estado: "confirmada",
      direccion: "Av. San Martín 123, San Miguel",
      telefono: "+51 987 654 321",
    },
  ],
  "admin-1": [
    {
      id: "res-2",
      establecimiento: "Centro Deportivo Los Olivos",
      cancha: "Cancha de Básquet",
      zona: "Zona Premium",
      fecha: "2024-01-20",
      horarios: ["20:00", "21:00"],
      precio: 200,
      estado: "pendiente",
      direccion: "Jr. Los Olivos 456, Los Olivos",
      telefono: "+51 987 654 322",
    },
  ],
}

export default function MisReservasPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tus reservas</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">Volver al Inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  const reservasUsuario = RESERVAS_DEMO[user.id as keyof typeof RESERVAS_DEMO] || []
  const reservasProximas = reservasUsuario.filter((r) => new Date(r.fecha) >= new Date())
  const reservasHistorial = reservasUsuario.filter((r) => new Date(r.fecha) < new Date())

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const ReservaCard = ({ reserva }: { reserva: any }) => (
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
        <div className="flex items-center text-sm font-medium">
          <CreditCard className="mr-2 h-4 w-4" />
          S/ {reserva.precio}
        </div>

        {reserva.estado === "confirmada" && new Date(reserva.fecha) >= new Date() && (
          <div className="pt-2">
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
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
