"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, DollarSign, TrendingUp, MapPin, Plus, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function AdminPage() {
  const { user, profile, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/")
    }
  }, [user, isAdmin, authLoading, router])

  if (authLoading || !user || !isAdmin) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona establecimientos, reservas y métricas</p>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">+5% vs ayer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/12,450</div>
              <p className="text-xs text-muted-foreground">+8% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa Ocupación</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">+3% vs semana pasada</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="establecimientos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="establecimientos">Establecimientos</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="establecimientos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Establecimientos</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Establecimiento
              </Button>
            </div>

            <div className="grid gap-4">
              {/* Ejemplo de establecimiento */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Complejo Deportivo Los Campeones</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        San Isidro, Lima
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Activo</Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Canchas</p>
                      <p className="font-medium">1 cancha</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rating</p>
                      <p className="font-medium">4.9 ⭐</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reservas Mes</p>
                      <p className="font-medium">45</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ingresos Mes</p>
                      <p className="font-medium text-green-600">S/8,100</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Centro Deportivo La Cantera</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        Miraflores, Lima
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Activo</Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Canchas</p>
                      <p className="font-medium">2 canchas</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rating</p>
                      <p className="font-medium">4.7 ⭐</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reservas Mes</p>
                      <p className="font-medium">32</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ingresos Mes</p>
                      <p className="font-medium text-green-600">S/3,520</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reservas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Reservas Recientes</h2>
              <Button variant="outline">Ver Todas</Button>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Juan Pérez</CardTitle>
                      <CardDescription>juan@email.com</CardDescription>
                    </div>
                    <Badge variant="default">Pagado</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Establecimiento</p>
                      <p className="font-medium">Los Campeones</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha</p>
                      <p className="font-medium">15/12/2024</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Horario</p>
                      <p className="font-medium">18:00 - 19:00</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-medium text-green-600">S/180</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">María García</CardTitle>
                      <CardDescription>maria@email.com</CardDescription>
                    </div>
                    <Badge variant="secondary">Pendiente</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Establecimiento</p>
                      <p className="font-medium">La Cantera</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha</p>
                      <p className="font-medium">16/12/2024</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Horario</p>
                      <p className="font-medium">20:00 - 21:00</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-medium text-green-600">S/120</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Usuarios</h2>
              <Button variant="outline">Exportar Lista</Button>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Juan Pérez</CardTitle>
                      <CardDescription>juan@email.com</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Usuario</Badge>
                      <Badge variant="secondary">Plata</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Registro</p>
                      <p className="font-medium">01/10/2024</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reservas</p>
                      <p className="font-medium">12</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Puntos</p>
                      <p className="font-medium">120</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Gasto Total</p>
                      <p className="font-medium text-green-600">S/2,160</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metricas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico de reservas mensuales
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico de ingresos mensuales
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Canchas Más Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Cancha Principal - Los Campeones</span>
                      <span className="font-medium">45 reservas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cancha Rápida A - La Cantera</span>
                      <span className="font-medium">32 reservas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Campo VIP - Elite Sports</span>
                      <span className="font-medium">18 reservas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horarios Más Solicitados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>18:00 - 19:00</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>19:00 - 20:00</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>20:00 - 21:00</span>
                      <span className="font-medium">22%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
