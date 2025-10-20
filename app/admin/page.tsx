"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { AdminDataProvider, useAdminData } from "@/contexts/AdminDataContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Calendar, BarChart3, TrendingUp } from "lucide-react"
import { CanchasManager } from "@/components/admin/CanchasManager"
import { BloqueosManager } from "@/components/admin/BloqueosManager"
import { CalendarioManager } from "@/components/admin/CalendarioManager"
import { ReservasManager } from "@/components/admin/ReservasManager"
import { EstadisticasPanel } from "@/components/admin/EstadisticasPanel"
import { EstablecimientoManager } from "@/components/admin/EstablecimientoManager"
import { formatearPrecio, formatearFechaLocal, parsearFechaLocal } from "@/utils/formatters"
import type { Cancha, Reserva, Zona } from "@/types"

export default function AdminPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  
  // Detectar si estamos en proceso de logout
  const isLoggingOut = typeof window !== "undefined" && sessionStorage.getItem("logging-out") === "true"

  useEffect(() => {
    // Si estamos cerrando sesión, no hacer nada
    if (isLoggingOut) {
      return
    }
    
    if (!isLoading && user?.tipo !== "dueno") {
      router.push("/")
    }
  }, [user, isLoading, router, isLoggingOut])

  if (isLoading || isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>{isLoggingOut ? "Cerrando sesión..." : "Cargando..."}</p>
        </div>
      </div>
    )
  }

  if (!user || user.tipo !== "dueno") {
    return null
  }

  return (
    <AdminDataProvider>
      <AdminDashboard user={user} logout={logout} />
    </AdminDataProvider>
  )
}

function AdminDashboard({ user, logout }: { user: any; logout: () => void }) {
  // Usar datos del AdminDataContext
  const { zonas: zonasDelDueno, reservas, bloqueos, isLoading: contextLoading, isRefreshing } = useAdminData()
  const [canchasDelDueno, setCanchasDelDueno] = useState<Cancha[]>([])
  const [estadisticas, setEstadisticas] = useState({
    zonasActivas: 0,
    reservasHoy: 0,
    reservasAyer: 0,
    ingresosDelMes: 0,
    ingresosMesAnterior: 0,
    tasaOcupacion: 0,
  })

  // Calcular estadísticas cuando los datos cambien
  useEffect(() => {
    if (!contextLoading && (zonasDelDueno.length > 0 || reservas.length > 0)) {
      calcularEstadisticas()
    }
  }, [contextLoading, zonasDelDueno, reservas])

  const calcularEstadisticas = () => {
    // Zonas activas desde Supabase
    const zonasActivas = zonasDelDueno.length

    // Obtener IDs de zonas del dueño
    const zonasIds = zonasDelDueno.map((z) => z.id)
    const reservasDelDueno = reservas.filter((r) => zonasIds.includes(r.zonaId))

    // Calcular reservas de hoy
    const hoy = new Date()
    const fechaHoy = formatearFechaLocal(hoy)
    const reservasHoy = reservasDelDueno.filter((r) => r.fecha === fechaHoy).length

    // Calcular reservas de ayer
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    const fechaAyer = formatearFechaLocal(ayer)
    const reservasAyer = reservasDelDueno.filter((r) => r.fecha === fechaAyer).length

    // Calcular ingresos del mes actual
    const mesActual = hoy.getMonth()
    const añoActual = hoy.getFullYear()
    const ingresosDelMes = reservasDelDueno
      .filter((r) => {
        const fechaReserva = parsearFechaLocal(r.fecha)
        return (
          fechaReserva.getMonth() === mesActual &&
          fechaReserva.getFullYear() === añoActual &&
          (r.estado === "confirmada" || r.estado === "completada")
        )
      })
      .reduce((sum, r) => sum + r.precio, 0)

    // Calcular ingresos del mes anterior
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
    const añoMesAnterior = mesActual === 0 ? añoActual - 1 : añoActual
    const ingresosMesAnterior = reservasDelDueno
      .filter((r) => {
        const fechaReserva = parsearFechaLocal(r.fecha)
        return (
          fechaReserva.getMonth() === mesAnterior &&
          fechaReserva.getFullYear() === añoMesAnterior &&
          (r.estado === "confirmada" || r.estado === "completada")
        )
      })
      .reduce((sum, r) => sum + r.precio, 0)

    // Calcular tasa de ocupación (reservas de la última semana / espacios disponibles)
    const haceSemana = new Date()
    haceSemana.setDate(haceSemana.getDate() - 7)
    const reservasUltimaSemana = reservasDelDueno.filter((r) => {
      const fechaReserva = parsearFechaLocal(r.fecha)
      return fechaReserva >= haceSemana && fechaReserva <= hoy
    })
    
    // Calcular espacios totales disponibles (7 días * 15 horarios promedio * número de zonas)
    const espaciosTotales = 7 * 15 * zonasActivas
    const espaciosOcupados = reservasUltimaSemana.reduce((sum, r) => sum + r.horarios.length, 0)
    const tasaOcupacion = espaciosTotales > 0 ? (espaciosOcupados / espaciosTotales) * 100 : 0

    setEstadisticas({
      zonasActivas,
      reservasHoy,
      reservasAyer,
      ingresosDelMes,
      ingresosMesAnterior,
      tasaOcupacion,
    })
  }

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Cargando datos...</p>
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
            {isRefreshing && (
              <span className="ml-3 flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                Actualizando...
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.nombre}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Cerrar Sesión
            </Button>
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
              <CardTitle className="text-sm font-medium">Zonas Activas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.zonasActivas}</div>
              <p className="text-xs text-muted-foreground">Zonas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.reservasHoy}</div>
              <p className="text-xs text-muted-foreground">
                {estadisticas.reservasHoy > estadisticas.reservasAyer ? (
                  <span className="text-green-600">
                    +{estadisticas.reservasHoy - estadisticas.reservasAyer} desde ayer
                  </span>
                ) : estadisticas.reservasHoy < estadisticas.reservasAyer ? (
                  <span className="text-red-600">
                    {estadisticas.reservasHoy - estadisticas.reservasAyer} desde ayer
                  </span>
                ) : (
                  <span>Igual que ayer</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatearPrecio(estadisticas.ingresosDelMes)}</div>
              <p className="text-xs text-muted-foreground">
                {estadisticas.ingresosMesAnterior > 0 ? (
                  <>
                    {estadisticas.ingresosDelMes > estadisticas.ingresosMesAnterior ? (
                      <span className="text-green-600">
                        +{(((estadisticas.ingresosDelMes - estadisticas.ingresosMesAnterior) / estadisticas.ingresosMesAnterior) * 100).toFixed(1)}% vs mes anterior
                      </span>
                    ) : estadisticas.ingresosDelMes < estadisticas.ingresosMesAnterior ? (
                      <span className="text-red-600">
                        {(((estadisticas.ingresosDelMes - estadisticas.ingresosMesAnterior) / estadisticas.ingresosMesAnterior) * 100).toFixed(1)}% vs mes anterior
                      </span>
                    ) : (
                      <span>Igual que mes anterior</span>
                    )}
                  </>
                ) : (
                  <span>Primer mes</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocupación</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.tasaOcupacion.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Promedio última semana</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="establecimiento" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="establecimiento">Establecimiento</TabsTrigger>
            <TabsTrigger value="canchas">Mis Canchas</TabsTrigger>
            <TabsTrigger value="bloqueos">Bloqueos</TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="establecimiento" className="space-y-4">
            <EstablecimientoManager userId={user.id} />
          </TabsContent>

          <TabsContent value="canchas" className="space-y-4">
            <CanchasManager />
          </TabsContent>

          <TabsContent value="bloqueos" className="space-y-4">
            <BloqueosManager />
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
