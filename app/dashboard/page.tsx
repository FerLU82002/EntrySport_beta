"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, Star, Trophy, Gift, CreditCard, Wifi, WifiOff } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useReservas } from "@/hooks/useReservas"
import { formatearPrecio } from "@/utils/formatters"

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { reservas, loading: reservasLoading } = useReservas()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    )
  }

  const proximasReservas = reservas.filter((r) => {
    const hoy = new Date().toISOString().split("T")[0]
    return r.fecha >= hoy && r.estado !== "cancelled"
  })

  const historialReservas = reservas.filter((r) => {
    const hoy = new Date().toISOString().split("T")[0]
    return r.fecha < hoy || r.estado === "completed"
  })

  const getEstadoBadge = (estado: string) => {
    const variants = {
      pending: { variant: "secondary" as const, text: "Pendiente" },
      paid: { variant: "default" as const, text: "Pagado" },
      completed: { variant: "default" as const, text: "Completado" },
      cancelled: { variant: "destructive" as const, text: "Cancelado" },
    }
    return variants[estado as keyof typeof variants] || variants.pending
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
          <p className="text-gray-600">Bienvenido de vuelta, {profile?.full_name || user.email}</p>

          {/* Indicador de conexión */}
          <div className="flex items-center mt-2">
            {reservas.length > 0 ? (
              <div className="flex items-center text-green-600 text-sm">
                <Wifi className="h-4 w-4 mr-1" />
                Conectado a base de datos
              </div>
            ) : (
              <div className="flex items-center text-orange-600 text-sm">
                <WifiOff className="h-4 w-4 mr-1" />
                Modo demostración
              </div>
            )}
          </div>
        </div>

        {/* Alerta si no hay reservas */}
        {reservas.length === 0 && (
          <Alert className="mb-6">
            <AlertDescription>
              No tienes reservas aún. ¡Haz tu primera reserva para empezar a usar todas las funcionalidades!
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proximasReservas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puntos</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Nivel: Bronce</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Descuentos</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Disponible</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="proximas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="proximas">Próximas Reservas</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
            <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
          </TabsList>

          <TabsContent value="proximas" className="space-y-4">
            {proximasReservas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas próximas</h3>
                  <p className="text-gray-600 mb-4">¡Reserva una cancha para empezar a jugar!</p>
                  <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700">
                    Explorar Canchas
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {proximasReservas.map((reserva) => (
                  <Card key={reserva.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {reserva.cancha?.establecimiento?.nombre || "Establecimiento"}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {reserva.cancha?.establecimiento?.ubicacion || "Ubicación"}
                          </CardDescription>
                        </div>
                        <Badge {...getEstadoBadge(reserva.estado)}>{getEstadoBadge(reserva.estado).text}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Cancha</p>
                          <p className="font-medium">{reserva.cancha?.nombre || "Cancha"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fecha</p>
                          <p className="font-medium">{new Date(reserva.fecha).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Horario</p>
                          <p className="font-medium">
                            {reserva.hora_inicio} - {reserva.hora_fin}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-medium text-green-600">{formatearPrecio(reserva.precio_total)}</p>
                        </div>
                      </div>
                      {reserva.estado === "pending" && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pagar Ahora
                          </Button>
                          <Button size="sm" variant="outline">
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historial" className="space-y-4">
            {historialReservas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin historial de reservas</h3>
                  <p className="text-gray-600">Tus reservas pasadas aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {historialReservas.map((reserva) => (
                  <Card key={reserva.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {reserva.cancha?.establecimiento?.nombre || "Establecimiento"}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {reserva.cancha?.establecimiento?.ubicacion || "Ubicación"}
                          </CardDescription>
                        </div>
                        <Badge {...getEstadoBadge(reserva.estado)}>{getEstadoBadge(reserva.estado).text}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Cancha</p>
                          <p className="font-medium">{reserva.cancha?.nombre || "Cancha"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fecha</p>
                          <p className="font-medium">{new Date(reserva.fecha).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Horario</p>
                          <p className="font-medium">
                            {reserva.hora_inicio} - {reserva.hora_fin}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-medium text-green-600">{formatearPrecio(reserva.precio_total)}</p>
                        </div>
                      </div>
                      {reserva.estado === "completed" && (
                        <div className="mt-4">
                          <Button size="sm" variant="outline">
                            <Star className="h-4 w-4 mr-2" />
                            Calificar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recompensas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Recompensas</CardTitle>
                <CardDescription>
                  Gana puntos con cada reserva completada y desbloquea descuentos especiales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Nivel Bronce</h3>
                        <p className="text-sm text-gray-600">{historialReservas.length} reservas completadas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{historialReservas.length * 10}</p>
                      <p className="text-sm text-gray-600">puntos</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Próximos niveles</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Plata (10 reservas)</span>
                        <span className="text-sm text-green-600">5% descuento</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Oro (25 reservas)</span>
                        <span className="text-sm text-green-600">10% descuento</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Platino (50 reservas)</span>
                        <span className="text-sm text-green-600">15% descuento</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
