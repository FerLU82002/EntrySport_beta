"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Clock, CreditCard } from "lucide-react"
import { formatearPrecio, parsearFechaLocal } from "@/utils/formatters"
import { useReservas } from "@/hooks/useReservas"
import { useZonas } from "@/hooks/useZonas"
import { useAuth } from "@/hooks/useAuth"
import type { Cancha, Reserva, Zona } from "@/types"

interface EstadisticasPanelProps {
  canchas: Cancha[]
}

export function EstadisticasPanel({ canchas }: EstadisticasPanelProps) {
  const { user } = useAuth()
  const { reservas, fetchReservasDeZonas } = useReservas()
  const { zonas: zonasDelDueno, fetchMisZonas } = useZonas()
  const [periodo, setPeriodo] = useState("mes")

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user) return

      await fetchMisZonas(user.id)
      await fetchReservasDeZonas(user.id)
    }

    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]) // Solo depender del user.id

  const calcularEstadisticas = () => {
    const ahora = new Date()
    let fechaInicio: Date

    switch (periodo) {
      case "semana":
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "mes":
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
        break
      case "trimestre":
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1)
        break
      case "año":
        fechaInicio = new Date(ahora.getFullYear(), 0, 1)
        break
      default:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    }

    const reservasPeriodo = reservas.filter((r) => new Date(r.fechaCreacion) >= fechaInicio)

    const totalReservas = reservasPeriodo.length
    const reservasConfirmadas = reservasPeriodo.filter((r) => r.estado === "confirmada" || r.estado === "completada").length
    const reservasPendientes = reservasPeriodo.filter((r) => r.estado === "pendiente").length
    const reservasCanceladas = reservasPeriodo.filter((r) => r.estado === "cancelada").length
    
    const ingresosTotales = reservasPeriodo
      .filter((r) => r.estado === "confirmada" || r.estado === "completada")
      .reduce((sum, r) => sum + r.precio, 0)

    const ingresosPotenciales = reservasPeriodo
      .filter((r) => r.estado === "pendiente")
      .reduce((sum, r) => sum + r.precio, 0)

    const tasaConfirmacion = totalReservas > 0 ? (reservasConfirmadas / totalReservas) * 100 : 0

    // Estadísticas por zona
    const estadisticasPorZona = zonasDelDueno.map((zona) => {
      const reservasZona = reservasPeriodo.filter((r) => r.zonaId === zona.id)
      const ingresosZona = reservasZona
        .filter((r) => r.estado === "confirmada" || r.estado === "completada")
        .reduce((sum, r) => sum + r.precio, 0)

      return {
        zona: zona.nombre,
        tipo: zona.tipo,
        reservas: reservasZona.length,
        ingresos: ingresosZona,
        tasaOcupacion: reservasZona.length > 0 ? ((reservasZona.length / 30) * 100).toFixed(1) : "0",
      }
    }).sort((a, b) => b.ingresos - a.ingresos)

    // Estadísticas por método de pago
    const metodosPago = reservasPeriodo.reduce((acc: any, r) => {
      if (r.estado === "confirmada" || r.estado === "completada") {
        acc[r.metodoPago] = (acc[r.metodoPago] || 0) + 1
      }
      return acc
    }, {})

    // Horarios más populares
    const horariosPopulares = reservasPeriodo.reduce((acc: any, r) => {
      r.horarios.forEach(horario => {
        acc[horario] = (acc[horario] || 0) + 1
      })
      return acc
    }, {})

    const topHorarios = Object.entries(horariosPopulares)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([horario, cantidad]) => ({ horario, cantidad }))

    return {
      totalReservas,
      reservasConfirmadas,
      reservasPendientes,
      reservasCanceladas,
      ingresosTotales,
      ingresosPotenciales,
      tasaConfirmacion,
      estadisticasPorZona,
      metodosPago,
      topHorarios,
    }
  }

  const stats = calcularEstadisticas()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas y Reportes</h2>
          <p className="text-gray-600">Analiza el rendimiento de tus zonas deportivas</p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Última semana</SelectItem>
            <SelectItem value="mes">Este mes</SelectItem>
            <SelectItem value="trimestre">Último trimestre</SelectItem>
            <SelectItem value="año">Este año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.reservasConfirmadas} confirmadas, {stats.reservasPendientes} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Confirmados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatearPrecio(stats.ingresosTotales)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatearPrecio(stats.ingresosPotenciales)} potenciales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Confirmación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasaConfirmacion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.reservasCanceladas} canceladas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zonas Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{zonasDelDueno.length}</div>
            <p className="text-xs text-muted-foreground">Zonas registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de estadísticas detalladas */}
      <Tabs defaultValue="zonas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zonas">Por Zona</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="pagos">Métodos de Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="zonas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Rendimiento por Zona
              </CardTitle>
              <CardDescription>Comparativa de reservas e ingresos por zona deportiva</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.estadisticasPorZona.length > 0 ? (
                <div className="space-y-4">
                  {stats.estadisticasPorZona.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <h4 className="font-medium">{stat.zona}</h4>
                        <p className="text-sm text-gray-600">{stat.tipo}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm text-gray-600">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {stat.reservas} reservas
                          </span>
                          <span className="text-sm text-gray-600">
                            <TrendingUp className="inline h-3 w-3 mr-1" />
                            {stat.tasaOcupacion}% ocupación
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">{formatearPrecio(stat.ingresos)}</p>
                        <p className="text-sm text-gray-600">Ingresos</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos suficientes</h3>
                  <p className="text-gray-600">Las estadísticas aparecerán cuando tengas reservas en tus zonas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Horarios Más Populares
              </CardTitle>
              <CardDescription>Top 5 horarios con más reservas</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topHorarios.length > 0 ? (
                <div className="space-y-3">
                  {stats.topHorarios.map((item: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.horario}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{item.cantidad}</p>
                        <p className="text-xs text-gray-600">reservas</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay datos de horarios disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Métodos de Pago
              </CardTitle>
              <CardDescription>Distribución de pagos confirmados</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.metodosPago).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.metodosPago).map(([metodo, cantidad]: any, index) => {
                    const porcentaje = (cantidad / stats.reservasConfirmadas * 100).toFixed(1)
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{metodo}</span>
                          <span className="text-sm text-gray-600">{cantidad} ({porcentaje}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No hay datos de métodos de pago disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {zonasDelDueno.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes zonas registradas</h3>
            <p className="text-gray-600">Registra tus primeras zonas para comenzar a ver estadísticas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
