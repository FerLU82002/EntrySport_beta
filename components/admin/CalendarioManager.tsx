"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react"
import { formatearPrecio, formatearFechaLocal, parsearFechaLocal } from "@/utils/formatters"
import { horariosDisponibles } from "@/data/canchas"
import { useReservas } from "@/hooks/useReservas"
import { useZonas } from "@/hooks/useZonas"
import { useAuth } from "@/hooks/useAuth"
import type { Cancha, Reserva, Zona } from "@/types"

interface CalendarioManagerProps {
  canchas: Cancha[]
}

interface EventoCalendario {
  reserva: Reserva
  zona: Zona
}

export function CalendarioManager({ canchas }: CalendarioManagerProps) {
  const { user } = useAuth()
  const { reservas, fetchReservasDeZonas, actualizarEstadoReserva } = useReservas()
  const { zonas: zonasDelDueno, fetchMisZonas } = useZonas()
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date())
  const [reservaSeleccionada, setReservaSeleccionada] = useState<EventoCalendario | null>(null)
  const [vistaCalendario, setVistaCalendario] = useState<"mes" | "dia">("dia")

  useEffect(() => {
    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]) // Cargar datos solo cuando cambia el user.id

  const cargarDatos = async () => {
    if (!user) return

    await fetchMisZonas(user.id)
    await fetchReservasDeZonas(user.id)
  }

  const cambiarEstadoReserva = async (reservaId: string, nuevoEstado: "confirmada" | "cancelada" | "completada" | "pendiente") => {
    try {
      await actualizarEstadoReserva(reservaId, nuevoEstado)
      await cargarDatos()
      setReservaSeleccionada(null)
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      alert("Hubo un error al cambiar el estado. Por favor intenta nuevamente.")
    }
  }

  const reservasDeLaFecha = reservas.filter((r) => r.fecha === formatearFechaLocal(fechaSeleccionada))

  const obtenerEventosPorHorario = () => {
    const eventosPorHorario: { [key: string]: EventoCalendario[] } = {}
    
    horariosDisponibles.forEach((horario) => {
      eventosPorHorario[horario] = []
    })

    reservasDeLaFecha.forEach((reserva) => {
      const zona = zonasDelDueno.find((z) => z.id === reserva.zonaId)
      if (zona) {
        reserva.horarios.forEach((horario) => {
          if (eventosPorHorario[horario]) {
            eventosPorHorario[horario].push({ reserva, zona })
          }
        })
      }
    })

    return eventosPorHorario
  }

  const eventosPorHorario = obtenerEventosPorHorario()

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return "bg-green-100 text-green-800 border-green-300"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-300"
      case "completada":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const diasConReservas = reservas.map((r) => parsearFechaLocal(r.fecha))

  const navegarFecha = (direccion: "anterior" | "siguiente") => {
    const nuevaFecha = new Date(fechaSeleccionada)
    if (direccion === "anterior") {
      nuevaFecha.setDate(nuevaFecha.getDate() - 1)
    } else {
      nuevaFecha.setDate(nuevaFecha.getDate() + 1)
    }
    setFechaSeleccionada(nuevaFecha)
  }

  const obtenerDiasDelMes = () => {
    const año = fechaSeleccionada.getFullYear()
    const mes = fechaSeleccionada.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    
    // Obtener el día de la semana del primer día (0 = domingo, ajustamos a lunes)
    let diaSemanaInicio = primerDia.getDay() - 1
    if (diaSemanaInicio === -1) diaSemanaInicio = 6 // Si es domingo, va al final
    
    const dias: (Date | null)[] = []
    
    // Agregar días vacíos al inicio
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null)
    }
    
    // Agregar todos los días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(año, mes, dia))
    }
    
    return dias
  }

  const obtenerReservasDelDia = (fecha: Date) => {
    const fechaStr = formatearFechaLocal(fecha)
    return reservas.filter((r) => r.fecha === fechaStr)
  }

  const diasDelMes = obtenerDiasDelMes()
  const nombreMes = fechaSeleccionada.toLocaleDateString("es-PE", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Calendario de Reservas</h2>
          <p className="text-gray-600">Vista diaria de todas las reservas de tus zonas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={vistaCalendario === "dia" ? "default" : "outline"}
            onClick={() => setVistaCalendario("dia")}
          >
            Vista Día
          </Button>
          <Button
            variant={vistaCalendario === "mes" ? "default" : "outline"}
            onClick={() => setVistaCalendario("mes")}
          >
            Vista Mes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario lateral */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Seleccionar Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={fechaSeleccionada}
              onSelect={(date) => date && setFechaSeleccionada(date)}
              className="rounded-md border"
              modifiers={{
                conReservas: diasConReservas,
              }}
              modifiersStyles={{
                conReservas: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  color: "#059669",
                },
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Días con reservas</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Total reservas hoy:</p>
                <p className="text-2xl font-bold text-green-600">{reservasDeLaFecha.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista de calendario por horario */}
        <div className="lg:col-span-3">
          {vistaCalendario === "dia" ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navegarFecha("anterior")}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      <CardTitle className="text-xl">
                        {fechaSeleccionada.toLocaleDateString("es-PE", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => navegarFecha("siguiente")}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setFechaSeleccionada(new Date())}>
                    Hoy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {horariosDisponibles.map((horario) => {
                    const eventos = eventosPorHorario[horario] || []
                    return (
                      <div key={horario} className="flex gap-2 border-b pb-2">
                        <div className="w-24 flex-shrink-0 font-medium text-sm pt-2">{horario}</div>
                        <div className="flex-1 min-h-[60px]">
                          {eventos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {eventos.map((evento, idx) => (
                                <button
                                  key={`${evento.reserva.id}-${idx}`}
                                  onClick={() => setReservaSeleccionada(evento)}
                                  className={`text-left p-2 rounded-lg border-2 transition-all hover:shadow-md ${obtenerColorEstado(
                                    evento.reserva.estado
                                  )}`}
                                >
                                  <div className="font-medium text-sm truncate">{evento.zona.nombre}</div>
                                  <div className="text-xs opacity-75 truncate">
                                    {evento.reserva.zona} - {evento.reserva.cancha}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs mt-1">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">ID: {evento.reserva.userId.slice(0, 8)}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex items-center text-gray-400 text-sm italic">Disponible</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const nuevaFecha = new Date(fechaSeleccionada)
                        nuevaFecha.setMonth(nuevaFecha.getMonth() - 1)
                        setFechaSeleccionada(nuevaFecha)
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      <CardTitle className="text-xl capitalize">{nombreMes}</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const nuevaFecha = new Date(fechaSeleccionada)
                        nuevaFecha.setMonth(nuevaFecha.getMonth() + 1)
                        setFechaSeleccionada(nuevaFecha)
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setFechaSeleccionada(new Date())}>
                    Hoy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Encabezado de días de la semana */}
                  <div className="grid grid-cols-7 gap-2">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dia) => (
                      <div key={dia} className="text-center font-semibold text-sm text-gray-600 py-2">
                        {dia}
                      </div>
                    ))}
                  </div>
                  
                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-2">
                    {diasDelMes.map((dia, index) => {
                      if (!dia) {
                        return <div key={`empty-${index}`} className="aspect-square" />
                      }
                      
                      const reservasDelDia = obtenerReservasDelDia(dia)
                      const esHoy = formatearFechaLocal(dia) === formatearFechaLocal(new Date())
                      const esDiaSeleccionado = formatearFechaLocal(dia) === formatearFechaLocal(fechaSeleccionada)
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setFechaSeleccionada(dia)
                            setVistaCalendario("dia")
                          }}
                          className={`aspect-square border rounded-lg p-2 hover:bg-gray-50 transition-all ${
                            esHoy ? "border-blue-500 bg-blue-50" : ""
                          } ${esDiaSeleccionado ? "ring-2 ring-green-500" : ""}`}
                        >
                          <div className="flex flex-col h-full">
                            <span className={`text-sm font-medium ${esHoy ? "text-blue-600" : ""}`}>
                              {dia.getDate()}
                            </span>
                            {reservasDelDia.length > 0 && (
                              <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                                {reservasDelDia.slice(0, 3).map((reserva, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-xs px-1 rounded truncate ${
                                      reserva.estado === "confirmada"
                                        ? "bg-green-500 text-white"
                                        : reserva.estado === "pendiente"
                                        ? "bg-yellow-500 text-white"
                                        : reserva.estado === "cancelada"
                                        ? "bg-red-500 text-white"
                                        : "bg-blue-500 text-white"
                                    }`}
                                  >
                                    {reserva.zona.slice(0, 8)}
                                  </div>
                                ))}
                                {reservasDelDia.length > 3 && (
                                  <div className="text-xs text-gray-500">+{reservasDelDia.length - 3}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* Leyenda */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span>Confirmada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-500"></div>
                      <span>Pendiente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500"></div>
                      <span>Cancelada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span>Completada</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de detalles de reserva */}
      <Dialog open={!!reservaSeleccionada} onOpenChange={() => setReservaSeleccionada(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
          </DialogHeader>
          {reservaSeleccionada && (
            <div className="space-y-4">
              <div>
                <Badge className={obtenerColorEstado(reservaSeleccionada.reserva.estado)}>
                  {reservaSeleccionada.reserva.estado.toUpperCase()}
                </Badge>
              </div>

              {/* Código de verificación destacado */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-green-800 mb-2">Código de Verificación</p>
                <p className="text-4xl font-bold text-green-700 tracking-widest font-mono">
                  {reservaSeleccionada.reserva.codigoVerificacion || "------"}
                </p>
                <p className="text-xs text-green-600 mt-2">Solicitar al cliente en la entrada</p>
              </div>

              {/* Datos del cliente */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-semibold text-sm text-blue-900 mb-2">Datos del Cliente</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{reservaSeleccionada.reserva.usuarioNombre}</p>
                      <p className="text-xs text-gray-600">{reservaSeleccionada.reserva.usuarioEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <p className="text-sm">{reservaSeleccionada.reserva.usuarioTelefono}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Fecha</p>
                    <p className="text-sm text-gray-600">
                      {parsearFechaLocal(reservaSeleccionada.reserva.fecha).toLocaleDateString("es-PE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Horarios</p>
                    <p className="text-sm text-gray-600">{reservaSeleccionada.reserva.horarios.join(", ")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Precio</p>
                    <p className="text-sm text-gray-600">
                      {formatearPrecio(reservaSeleccionada.reserva.precio)} - {reservaSeleccionada.reserva.metodoPago}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="font-medium">{reservaSeleccionada.reserva.establecimiento}</p>
                  <p className="text-sm text-gray-600">
                    {reservaSeleccionada.zona.nombre} - {reservaSeleccionada.zona.tipo}
                  </p>
                  <p className="text-sm text-gray-600">{reservaSeleccionada.reserva.direccion}</p>
                </div>
              </div>

              {reservaSeleccionada.reserva.estado === "pendiente" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => cambiarEstadoReserva(reservaSeleccionada.reserva.id, "confirmada")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar Pago
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 border-red-300"
                    onClick={() => cambiarEstadoReserva(reservaSeleccionada.reserva.id, "cancelada")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              )}

              {/* Controles de administrador - cambiar estado */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Cambiar Estado (Admin)</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={reservaSeleccionada.reserva.estado === "pendiente" ? "default" : "outline"}
                    size="sm"
                    onClick={() => cambiarEstadoReserva(reservaSeleccionada.reserva.id, "pendiente")}
                    className={reservaSeleccionada.reserva.estado === "pendiente" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                  >
                    Pendiente
                  </Button>
                  <Button
                    variant={reservaSeleccionada.reserva.estado === "confirmada" ? "default" : "outline"}
                    size="sm"
                    onClick={() => cambiarEstadoReserva(reservaSeleccionada.reserva.id, "confirmada")}
                    className={reservaSeleccionada.reserva.estado === "confirmada" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    Confirmada
                  </Button>
                  <Button
                    variant={reservaSeleccionada.reserva.estado === "completada" ? "default" : "outline"}
                    size="sm"
                    onClick={() => cambiarEstadoReserva(reservaSeleccionada.reserva.id, "completada")}
                    className={reservaSeleccionada.reserva.estado === "completada" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Completada
                  </Button>
                  <Button
                    variant={reservaSeleccionada.reserva.estado === "cancelada" ? "default" : "outline"}
                    size="sm"
                    onClick={() => cambiarEstadoReserva(reservaSeleccionada.reserva.id, "cancelada")}
                    className={reservaSeleccionada.reserva.estado === "cancelada" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    Cancelada
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
