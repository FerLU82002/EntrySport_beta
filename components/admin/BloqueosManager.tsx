"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { formatearFechaLocal, parsearFechaLocal } from "@/utils/formatters"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, AlertTriangle, Calendar as CalendarIcon, Clock } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useAdminData } from "@/contexts/AdminDataContext"
import { useBloqueos } from "@/hooks/useBloqueos"
import type { Bloqueo, Zona } from "@/types"

export function BloqueosManager() {
  const { user } = useAuth()
  const { zonas: zonasFromContext, bloqueos: bloqueosFromContext, isLoading: contextLoading, refetch } = useAdminData()
  const { crearBloqueo: crearBloqueoHook, actualizarBloqueo: actualizarBloqueoHook, eliminarBloqueo: eliminarBloqueoHook } = useBloqueos()
  const [isCreating, setIsCreating] = useState(false)
  const [editingBloqueo, setEditingBloqueo] = useState<Bloqueo | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    zonaId: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    motivo: "mantenimiento" as "mantenimiento" | "evento" | "otro",
    descripcion: "",
  })

  const zonas = zonasFromContext // Usar datos del context
  const bloqueos = bloqueosFromContext
  const isLoading = contextLoading

  // No necesitamos useEffect porque los datos ya están en el context

  const horarios = Array.from({ length: 24 }, (_, i) => {
    const hora = i.toString().padStart(2, "0")
    return `${hora}:00`
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const zona = zonas.find((z) => z.id === formData.zonaId)
    if (!zona) return

    const bloqueoData: Omit<Bloqueo, "id"> = {
      zonaId: formData.zonaId,
      zonaNombre: zona.nombre,
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      motivo: formData.motivo,
      descripcion: formData.descripcion,
      canchaId: 0,
      ownerId: user.id,
    }

    try {
      if (editingBloqueo) {
        await actualizarBloqueoHook(editingBloqueo.id, bloqueoData)
      } else {
        await crearBloqueoHook(bloqueoData)
      }

      // Refrescar datos del context
      await refetch()

      // Reset form
      setFormData({
        zonaId: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
        motivo: "mantenimiento",
        descripcion: "",
      })
      setSelectedDate(new Date())
      setIsCreating(false)
      setEditingBloqueo(null)
    } catch (error) {
      console.error("Error al guardar bloqueo:", error)
      alert("Hubo un error al guardar el bloqueo. Por favor intenta nuevamente.")
    }
  }

  const handleEdit = (bloqueo: Bloqueo) => {
    setEditingBloqueo(bloqueo)
    setFormData({
      zonaId: bloqueo.zonaId,
      fecha: bloqueo.fecha,
      horaInicio: bloqueo.horaInicio,
      horaFin: bloqueo.horaFin,
      motivo: bloqueo.motivo,
      descripcion: bloqueo.descripcion,
    })
    setSelectedDate(parsearFechaLocal(bloqueo.fecha))
    setIsCreating(true)
  }

  const handleDelete = async (bloqueoId: string) => {
    if (!user) return
    
    if (confirm("¿Estás seguro de que quieres eliminar este bloqueo?")) {
      try {
        await eliminarBloqueoHook(bloqueoId)
        await refetch()
      } catch (error) {
        console.error("Error al eliminar bloqueo:", error)
        alert("Hubo un error al eliminar el bloqueo. Por favor intenta nuevamente.")
      }
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const fechaStr = formatearFechaLocal(date)
      setFormData({ ...formData, fecha: fechaStr })
    }
  }

  const { bloqueosActivos, bloqueosHistorico } = useMemo(() => {
    const ahora = new Date()
    const hoy = formatearFechaLocal(ahora)
    const horaActual = ahora.getHours()

    const activos = bloqueos.filter((b: Bloqueo) => {
      if (b.fecha > hoy) return true
      if (b.fecha === hoy) {
        const horaFin = Number.parseInt(b.horaFin.split(":")[0])
        return horaFin > horaActual
      }
      return false
    })

    const historico = bloqueos.filter((b: Bloqueo) => {
      if (b.fecha < hoy) return true
      if (b.fecha === hoy) {
        const horaFin = Number.parseInt(b.horaFin.split(":")[0])
        return horaFin <= horaActual
      }
      return false
    })

    return {
      bloqueosActivos: activos.sort((a: Bloqueo, b: Bloqueo) => a.fecha.localeCompare(b.fecha)),
      bloqueosHistorico: historico.sort((a: Bloqueo, b: Bloqueo) => b.fecha.localeCompare(a.fecha)),
    }
  }, [bloqueos])

  const getMotivoColor = (motivo: string) => {
    switch (motivo) {
      case "mantenimiento":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "evento":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const BloqueoCard = ({ bloqueo, isHistorico }: { bloqueo: Bloqueo; isHistorico?: boolean }) => (
    <Card className={isHistorico ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{bloqueo.zonaNombre}</CardTitle>
            <CardDescription>
              <CalendarIcon className="inline h-3 w-3 mr-1" />
              {parsearFechaLocal(bloqueo.fecha).toLocaleDateString("es-PE", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </CardDescription>
          </div>
          <Badge className={getMotivoColor(bloqueo.motivo)}>
            {bloqueo.motivo.charAt(0).toUpperCase() + bloqueo.motivo.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-2 h-4 w-4" />
          {bloqueo.horaInicio} - {bloqueo.horaFin}
        </div>
        {bloqueo.descripcion && <p className="text-sm text-gray-600">{bloqueo.descripcion}</p>}

        {!isHistorico && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(bloqueo)} className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(bloqueo.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bloqueos / Disponibilidad</h2>
          <p className="text-gray-600">Gestiona el mantenimiento y disponibilidad de tus canchas</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Bloqueo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingBloqueo ? "Editar Bloqueo" : "Crear Nuevo Bloqueo"}</DialogTitle>
              <DialogDescription>
                {editingBloqueo
                  ? "Modifica el bloqueo de disponibilidad"
                  : "Bloquea una zona por mantenimiento o evento especial"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="zona">Zona Afectada</Label>
                <Select value={formData.zonaId} onValueChange={(value) => setFormData({ ...formData, zonaId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {zonas.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No hay zonas disponibles
                      </SelectItem>
                    ) : (
                      zonas.map((zona) => (
                        <SelectItem key={zona.id} value={zona.id}>
                          {zona.nombre} - {zona.tipo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fecha del Bloqueo</Label>
                <div className="border rounded-md p-3 mt-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horaInicio">Hora Inicio</Label>
                  <Select
                    value={formData.horaInicio}
                    onValueChange={(value) => setFormData({ ...formData, horaInicio: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((hora) => (
                        <SelectItem key={hora} value={hora}>
                          {hora}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="horaFin">Hora Fin</Label>
                  <Select
                    value={formData.horaFin}
                    onValueChange={(value) => setFormData({ ...formData, horaFin: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hora fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((hora) => (
                        <SelectItem key={hora} value={hora}>
                          {hora}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo del Bloqueo</Label>
                <Select
                  value={formData.motivo}
                  onValueChange={(value: "mantenimiento" | "evento" | "otro") =>
                    setFormData({ ...formData, motivo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="evento">Evento Especial</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles del bloqueo (opcional)..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingBloqueo(null)
                    setFormData({
                      zonaId: "",
                      fecha: "",
                      horaInicio: "",
                      horaFin: "",
                      motivo: "mantenimiento",
                      descripcion: "",
                    })
                    setSelectedDate(new Date())
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!formData.zonaId || !formData.fecha || !formData.horaInicio || !formData.horaFin}
                >
                  {editingBloqueo ? "Actualizar" : "Crear"} Bloqueo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {zonas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay zonas disponibles</h3>
            <p className="text-gray-600">Primero debes crear zonas en la sección "Mis Canchas"</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="activos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activos">
              Próximos ({bloqueosActivos.length})
            </TabsTrigger>
            <TabsTrigger value="historico">
              Histórico ({bloqueosHistorico.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activos" className="mt-6">
            {bloqueosActivos.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay bloqueos programados</h3>
                  <p className="text-gray-600 mb-4">Todas tus zonas están disponibles</p>
                  <Button onClick={() => setIsCreating(true)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Bloqueo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bloqueosActivos.map((bloqueo: Bloqueo) => (
                  <BloqueoCard key={bloqueo.id} bloqueo={bloqueo} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="mt-6">
            {bloqueosHistorico.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin historial</h3>
                  <p className="text-gray-600">No hay bloqueos pasados</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bloqueosHistorico.map((bloqueo: Bloqueo) => (
                  <BloqueoCard key={bloqueo.id} bloqueo={bloqueo} isHistorico />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
