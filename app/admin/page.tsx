"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Calendar, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { CanchasManager } from "@/components/admin/CanchasManager"
import { CalendarioManager } from "@/components/admin/CalendarioManager"
import { ReservasManager } from "@/components/admin/ReservasManager"
import { EstadisticasPanel } from "@/components/admin/EstadisticasPanel"
import { EstablecimientoManager } from "@/components/admin/EstablecimientoManager"
import type { Cancha } from "@/types"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [canchasDelDueno, setCanchasDelDueno] = useState<Cancha[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && user?.tipo !== "dueno") {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!isLoading) {
      if (user?.tipo === "dueno") {
        const canchasGuardadas = JSON.parse(localStorage.getItem("canchas-dueno") || "[]")
        setCanchasDelDueno(canchasGuardadas)
      }
      setLoading(false)
    }
  }, [user, isLoading])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!user || user.tipo !== "dueno") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <span className="text-xl font-bold">Panel de Dueño</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.nombre}</span>
            <Link href="/">
              <Button variant="outline" size="sm">
                Cerrar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona tu establecimiento, canchas, reservas y horarios</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canchas Activas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{canchasDelDueno.length}</div>
              <p className="text-xs text-muted-foreground">Canchas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 desde ayer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ 4,250</div>
              <p className="text-xs text-muted-foreground">+15% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocupación</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">Promedio semanal</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="establecimiento" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="establecimiento">Establecimiento</TabsTrigger>
            <TabsTrigger value="canchas">Mis Canchas</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="establecimiento" className="space-y-4">
            <EstablecimientoManager userId={user.id} />
          </TabsContent>

          <TabsContent value="canchas" className="space-y-4">
            <CanchasManager canchas={canchasDelDueno} onCanchasChange={setCanchasDelDueno} />
          </TabsContent>

          <TabsContent value="calendario" className="space-y-4">
            <CalendarioManager canchas={canchasDelDueno} />
          </TabsContent>

          <TabsContent value="reservas" className="space-y-4">
            <ReservasManager canchas={canchasDelDueno} />
          </TabsContent>

          <TabsContent value="estadisticas" className="space-y-4">
            <EstadisticasPanel canchas={canchasDelDueno} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
