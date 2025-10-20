"use client"

import { useAuth } from "@/hooks/useAuth"
import { useReservas } from "@/hooks/useReservas"
import { AppProvider } from "@/contexts/AppContext"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, Phone, CreditCard, AlertTriangle, XCircle } from "lucide-react"
import { parsearFechaLocal } from "@/utils/formatters"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Reserva } from "@/types"

function MisReservasContent() {
  const { user, canAccess, isLoading } = useAuth()
  const { reservas: reservasUsuario, fetchMisReservas, cancelarReserva: cancelarReservaHook, isLoading: loadingReservas } = useReservas()
  const [loading, setLoading] = useState(true)
  
  // Detectar si estamos en proceso de logout
  const isLoggingOut = typeof window !== "undefined" && sessionStorage.getItem("logging-out") === "true"

  useEffect(() => {
    const cargarReservas = async () => {
      // Si estamos cerrando sesión, no hacer nada
      if (isLoggingOut) {
        return
      }
      
      if (!isLoading) {
        if (!user) {
          setLoading(false)
          return
        }

        if (!canAccess("/mis-reservas")) {
          setLoading(false)
          return
        }

        // Cargar reservas desde Supabase
        await fetchMisReservas(user.id)
        setLoading(false)
      }
    }

    cargarReservas()
  }, [user, canAccess, isLoading, fetchMisReservas, isLoggingOut])

  const handleCancelarReserva = async (reservaId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return

    try {
      await cancelarReservaHook(reservaId)
      
      // Recargar las reservas
      if (user) {
        await fetchMisReservas(user.id)
      }
    } catch (error) {
      console.error("Error al cancelar reserva:", error)
      alert("Hubo un error al cancelar la reserva. Por favor intenta nuevamente.")
    }
  }

  if (isLoading || loading || isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>{isLoggingOut ? "Cerrando sesión..." : "Cargando tus reservas..."}</p>
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

  const reservasProximas = reservasUsuario.filter((r) => {
    const fechaReserva = parsearFechaLocal(r.fecha)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return fechaReserva >= hoy && r.estado !== "cancelada"
  })
  
  const reservasHistorial = reservasUsuario.filter((r) => {
    const fechaReserva = parsearFechaLocal(r.fecha)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return fechaReserva < hoy || r.estado === "cancelada"
  })

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
        {/* Código de verificación para reservas activas */}
        {reserva.estado !== "cancelada" && reserva.estado !== "completada" && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-green-800 mb-1">Tu Código de Verificación</p>
            <p className="text-3xl font-bold text-green-700 tracking-wider font-mono">
              {reserva.codigoVerificacion || "------"}
            </p>
            <p className="text-xs text-green-600 mt-1">Presentar en la entrada</p>
          </div>
        )}

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
              onClick={() => handleCancelarReserva(reserva.id)}
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
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
      </main>
      <Footer />
    </div>
  )
}

export default function MisReservasPage() {
  return (
    <AppProvider>
      <MisReservasContent />
    </AppProvider>
  )
}
