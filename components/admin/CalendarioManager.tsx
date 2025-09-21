"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, Ban, Settings } from "lucide-react"
import { formatearFecha } from "@/utils/formatters"
import { horariosDisponibles } from "@/data/canchas"
import type { Cancha } from "@/types"

interface CalendarioManagerProps {
  canchas: Cancha[]
}

export function CalendarioManager({ canchas }: CalendarioManagerProps) {
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null)
  const [selectedZona, setSelectedZona] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isBlocking, setIsBlocking] = useState(false)
  const [blockReason, setBlockReason] = useState("")
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([])

  const getHorariosBloqueados = (canchaId: number, zonaId: string, fecha: string) => {
    const bloqueados = JSON.parse(localStorage.getItem("horarios-bloqueados") || "{}")
    return bloqueados[canchaId]?.[zonaId]?.[fecha] || []
  }

  const bloquearHorarios = () => {
    if (!selectedCancha || !selectedZona || selectedHorarios.length === 0) return

    const fechaStr = formatearFecha(selectedDate)
    const bloqueados = JSON.parse(localStorage.getItem("horarios-bloqueados") || "{}")

    if (!bloqueados[selectedCancha.id]) bloqueados[selectedCancha.id] = {}
    if (!bloqueados[selectedCancha.id][selectedZona]) bloqueados[selectedCancha.id][selectedZona] = {}
    if (!bloqueados[selectedCancha.id][selectedZona][fechaStr])
      bloqueados[selectedCancha.id][selectedZona][fechaStr] = []

    selectedHorarios.forEach((horario) => {
      if (!bloqueados[selectedCancha.id][selectedZona][fechaStr].find((b: any) => b.horario === horario)) {
        bloqueados[selectedCancha.id][selectedZona][fechaStr].push({
          horario,
          razon: blockReason,
          fechaBloqueo: new Date().toISOString(),
        })
      }
    })

    localStorage.setItem("horarios-bloqueados", JSON.stringify(bloqueados))
    setIsBlocking(false)
    setSelectedHorarios([])
    setBlockReason("")
  }

  const desbloquearHorario = (horario: string) => {
    if (!selectedCancha || !selectedZona) return

    const fechaStr = formatearFecha(selectedDate)
    const bloqueados = JSON.parse(localStorage.getItem("horarios-bloqueados") || "{}")

    if (bloqueados[selectedCancha.id]?.[selectedZona]?.[fechaStr]) {
      bloqueados[selectedCancha.id][selectedZona][fechaStr] = bloqueados[selectedCancha.id][selectedZona][
        fechaStr
      ].filter((b: any) => b.horario !== horario)

      localStorage.setItem("horarios-bloqueados", JSON.stringify(bloqueados))
    }
  }

  const zona = selectedCancha?.zonas.find((z) => z.id === selectedZona)
  const fechaStr = formatearFecha(selectedDate)
  const horariosBloqueados =
    selectedCancha && selectedZona ? getHorariosBloqueados(selectedCancha.id, selectedZona, fechaStr) : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Calendario</h2>
        <p className="text-gray-600">Administra la disponibilidad y bloquea horarios para mantenimiento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Seleccionar Cancha</Label>
          <Select
            value={selectedCancha?.id.toString() || ""}
            onValueChange={(value) => {
              const cancha = canchas.find((c) => c.id.toString() === value)
              setSelectedCancha(cancha || null)
              setSelectedZona("")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Elige una cancha" />
            </SelectTrigger>
            <SelectContent>
              {canchas.map((cancha) => (
                <SelectItem key={cancha.id} value={cancha.id.toString()}>
                  {cancha.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCancha && (
          <div>
            <Label>Seleccionar Zona</Label>
            <Select value={selectedZona} onValueChange={setSelectedZona}>
              <SelectTrigger>
                <SelectValue placeholder="Elige una zona" />
              </SelectTrigger>
              <SelectContent>
                {selectedCancha.zonas.map((zona) => (
                  <SelectItem key={zona.id} value={zona.id}>
                    {zona.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedCancha && selectedZona && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Calendario
              </CardTitle>
              <CardDescription>Selecciona una fecha para gestionar</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Horarios - {zona?.nombre}</CardTitle>
                  <CardDescription>
                    {selectedDate.toLocaleDateString("es-PE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                <Dialog open={isBlocking} onOpenChange={setIsBlocking}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Ban className="mr-2 h-4 w-4" />
                      Bloquear Horarios
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bloquear Horarios</DialogTitle>
                      <DialogDescription>
                        Selecciona los horarios que deseas bloquear y especifica la razón
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label>Horarios a bloquear</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {horariosDisponibles.map((horario) => (
                            <Button
                              key={horario}
                              variant={selectedHorarios.includes(horario) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (selectedHorarios.includes(horario)) {
                                  setSelectedHorarios(selectedHorarios.filter((h) => h !== horario))
                                } else {
                                  setSelectedHorarios([...selectedHorarios, horario])
                                }
                              }}
                            >
                              {horario}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="razon">Razón del bloqueo</Label>
                        <Textarea
                          id="razon"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder="Ej: Mantenimiento del césped, evento privado, reparaciones..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setIsBlocking(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={bloquearHorarios}
                          disabled={selectedHorarios.length === 0 || !blockReason.trim()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Bloquear Horarios
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {horariosDisponibles.map((horario) => {
                  const bloqueado = horariosBloqueados.find((b: any) => b.horario === horario)

                  return (
                    <div key={horario} className="relative">
                      <Button
                        variant={bloqueado ? "destructive" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => bloqueado && desbloquearHorario(horario)}
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {horario}
                      </Button>
                      {bloqueado && (
                        <div className="absolute -top-1 -right-1">
                          <Badge variant="destructive" className="text-xs px-1">
                            <Ban className="h-2 w-2" />
                          </Badge>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 border border-gray-300 rounded mr-2"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
                  <span>Bloqueado</span>
                </div>
              </div>

              {horariosBloqueados.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Horarios Bloqueados:</h4>
                  <div className="space-y-1">
                    {horariosBloqueados.map((bloqueo: any, index: number) => (
                      <div key={index} className="text-sm text-red-700">
                        <span className="font-medium">{bloqueo.horario}</span> - {bloqueo.razon}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {canchas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes canchas registradas</h3>
            <p className="text-gray-600">Primero registra una cancha para gestionar su calendario</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
