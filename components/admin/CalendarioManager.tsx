"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Calendario</h2>
        <p className="text-gray-600">Administra la disponibilidad y bloquea horarios para mantenimiento</p>
      </div>

      {canchas.length > 0 ? (
        <div className="space-y-6">
          {canchas.map((cancha) => (
            <Card key={cancha.id}>
              <CardHeader>
                <CardTitle>{cancha.nombre}</CardTitle>
                <CardDescription>{cancha.ubicacion}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cancha.zonas.map((zona) => (
                    <div key={zona.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{zona.nombre}</h4>
                      <div className="grid grid-cols-6 gap-2">
                        {horariosDisponibles.map((horario) => {
                          const horariosBloqueados = getHorariosBloqueados(cancha.id, zona.id, fechaStr)
                          const bloqueado = horariosBloqueados.find((b: any) => b.horario === horario)

                          return (
                            <Button
                              key={horario}
                              variant={bloqueado ? "destructive" : "outline"}
                              size="sm"
                              className="text-xs"
                            >
                              {horario}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
