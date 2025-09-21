"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import { formatearPrecio } from "@/utils/formatters"
import type { Cancha, Reserva } from "@/types"

interface EstadisticasPanelProps {
  canchas: Cancha[]
}

export function EstadisticasPanel({ canchas }: EstadisticasPanelProps) {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [periodo, setPeriodo] = useState("mes")

  useEffect(() => {
    const todasReservas = JSON.parse(localStorage.getItem("reservas") || "[]")
    const canchasIds = canchas.map((c) => c.id)
    const reservasDelDueno = todasReservas.filter((r: Reserva) => canchasIds.includes(r.canchaId))
    setReservas(reservasDelDueno)
  }, [canchas])

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
      default:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    }

    const reservasPeriodo = reservas.filter((r) => new Date(r.fechaCreacion) >= fechaInicio)

    const totalReservas = reservasPeriodo.length
    const reservasConfirmadas = reservasPeriodo.filter((r) => r.estado === "confirmada").length
    const ingresosTotales = reservasPeriodo
      .filter((r) => r.estado === "confirmada")
      .reduce((sum, r) => sum + r.precio, 0)

    const tasaConfirmacion = totalReservas > 0 ? (reservasConfirmadas / totalReservas) * 100 : 0

    const estadisticasPorCancha = canchas.map((cancha) => {
      const reservasCancha = reservasPeriodo.filter((r) => r.canchaId === cancha.id)
      const ingresosCancha = reservasCancha
        .filter((r) => r.estado === "confirmada")
        .reduce((sum, r) => sum + r.precio, 0)

      return {
        cancha: cancha.nombre,
        reservas: reservasCancha.length,
        ingresos: ingresosCancha,
      }
    })

    return {
      totalReservas,
      reservasConfirmadas,
      ingresosTotales,
      tasaConfirmacion,
      estadisticasPorCancha,
    }
  }

  const stats = calcularEstadisticas()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas y Reportes</h2>
          <p className="text-gray-600">Analiza el rendimiento de tus canchas</p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Última semana</SelectItem>
            <SelectItem value="mes">Este mes</SelectItem>
            <SelectItem value="trimestre">Último trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservas}</div>
            <p className="text-xs text-muted-foreground">{stats.reservasConfirmadas} confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatearPrecio(stats.ingresosTotales)}</div>
            <p className="text-xs text-muted-foreground">Solo reservas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Confirmación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasaConfirmacion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Reservas confirmadas vs total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canchas Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{canchas.length}</div>
            <p className="text-xs text-muted-foreground">Establecimientos registrados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Rendimiento por Cancha
          </CardTitle>
          <CardDescription>Comparativa de reservas e ingresos por establecimiento</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.estadisticasPorCancha.length > 0 ? (
            <div className="space-y-4">
              {stats.estadisticasPorCancha.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{stat.cancha}</h4>
                    <p className="text-sm text-gray-600">{stat.reservas} reservas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatearPrecio(stat.ingresos)}</p>
                    <p className="text-sm text-gray-600">Ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos suficientes</h3>
              <p className="text-gray-600">Las estadísticas aparecerán cuando tengas reservas en tus canchas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {canchas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes canchas registradas</h3>
            <p className="text-gray-600">Registra tus primeras canchas para comenzar a ver estadísticas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
