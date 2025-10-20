"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { AppProvider } from "@/contexts/AppContext"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Clock, MapPin, Phone, CreditCard, Download, Share2, AlertTriangle } from "lucide-react"
import { formatearPrecio } from "@/utils/formatters"
import type { Reserva } from "@/types"
import Link from "next/link"

function ConfirmacionContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const cargarReserva = async () => {
      const reservaId = params.id as string

      if (!user) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        
        // Buscar la reserva en Supabase
        const { data: reservaData, error } = await supabase
          .from('reservas')
          .select('*')
          .eq('id', reservaId)
          .single()

        if (error || !reservaData) {
          console.error('Error al cargar reserva:', error)
          setReserva(null)
          setLoading(false)
          return
        }

        // Verificar que la reserva pertenece al usuario
        if (reservaData.user_id !== user.id) {
          setAccessDenied(true)
          setLoading(false)
          return
        }

        // Formatear la reserva
        const reservaFormateada: Reserva = {
          id: reservaData.id,
          userId: reservaData.user_id,
          usuarioNombre: reservaData.usuario_nombre,
          usuarioEmail: reservaData.usuario_email,
          usuarioTelefono: reservaData.usuario_telefono,
          canchaId: reservaData.cancha_id || 0,
          zonaId: reservaData.zona_id,
          fecha: reservaData.fecha,
          horarios: reservaData.horarios,
          precio: Number(reservaData.precio),
          estado: reservaData.estado,
          fechaCreacion: reservaData.fecha_creacion,
          metodoPago: reservaData.metodo_pago,
          establecimiento: reservaData.establecimiento,
          cancha: reservaData.cancha,
          zona: reservaData.zona,
          direccion: reservaData.direccion,
          telefono: reservaData.telefono,
          codigoVerificacion: reservaData.codigo_verificacion,
        }

        setReserva(reservaFormateada)
      } catch (err) {
        console.error('Error inesperado:', err)
        setReserva(null)
      } finally {
        setLoading(false)
      }
    }

    cargarReserva()
  }, [params.id, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Cargando confirmación...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            {!user ? "Debes iniciar sesión para ver esta reserva" : "No tienes permisos para ver esta reserva"}
          </p>
          <Link href={!user ? "/login" : "/"}>
            <Button className="bg-green-600 hover:bg-green-700">{!user ? "Iniciar Sesión" : "Volver al Inicio"}</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Reserva no encontrada</h1>
          <p className="text-gray-600 mb-4">No se pudo encontrar la reserva solicitada</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">Volver al Inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h1>
            <p className="text-gray-600">Tu reserva ha sido procesada exitosamente</p>
          </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Ticket de Reserva</CardTitle>
                  <CardDescription>ID: {reserva.id}</CardDescription>
                </div>
                {getEstadoBadge(reserva.estado)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Establecimiento</h3>
                  <p className="text-sm text-gray-600">{reserva.establecimiento}</p>
                  <p className="text-sm text-gray-600">
                    {reserva.cancha} - {reserva.zona}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Fecha y Hora</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
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
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ubicación</h3>
                  <div className="flex items-start text-sm text-gray-600 mb-1">
                    <MapPin className="mr-2 h-4 w-4 mt-0.5" />
                    <span>{reserva.direccion}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{reserva.telefono}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Pago</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span className="capitalize">{reserva.metodoPago}</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{formatearPrecio(reserva.precio)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instrucciones Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Llega al establecimiento 10 minutos antes de tu horario reservado
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">Presenta este ticket o tu documento de identidad</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">
                  Para cancelaciones, contacta al establecimiento con al menos 2 horas de anticipación
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Descargar Ticket
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
            <Link href="/mis-reservas" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">Ver Mis Reservas</Button>
            </Link>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <AppProvider>
      <ConfirmacionContent />
    </AppProvider>
  )
}
