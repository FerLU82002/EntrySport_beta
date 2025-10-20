"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Plus, Edit, Trash2, DollarSign, Users, Info } from "lucide-react"
import { formatearPrecio } from "@/utils/formatters"
import { useAdminData } from "@/contexts/AdminDataContext"
import { useZonas } from "@/hooks/useZonas"
import { useEstablecimientos } from "@/hooks/useEstablecimientos"
import { useAuth } from "@/hooks/useAuth"
import type { Zona } from "@/types"

interface CanchasManagerProps {
  establecimientoId?: string
}

export function CanchasManager({ establecimientoId }: CanchasManagerProps) {
  const { user } = useAuth()
  const { zonas: zonasFromContext, establecimientos, isLoading: contextLoading, refetch } = useAdminData()
  const { crearZona: crearZonaHook, actualizarZona: actualizarZonaHook, eliminarZona: eliminarZonaHook } = useZonas()
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingZona, setEditingZona] = useState<Zona | null>(null)
  const [miEstablecimientoId, setMiEstablecimientoId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    precio: "",
    capacidad: "",
    descripcion: "",
  })

  const zonas = zonasFromContext // Usar zonas del context
  const isLoading = contextLoading

  const tiposDeporte = ["Fútbol 11", "Fútbol 7", "Fútbol 5", "Tenis", "Básquetbol", "Vóley", "Pádel"]

  // Obtener establecimiento del dueño desde el context
  useEffect(() => {
    if (establecimientos.length > 0) {
      setMiEstablecimientoId(establecimientos[0].id)
    }
  }, [establecimientos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!miEstablecimientoId) {
      alert("Primero debes crear un establecimiento")
      return
    }

    setIsSaving(true)

    try {
      const zonaData = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        precio: Number.parseFloat(formData.precio),
        capacidad: Number.parseInt(formData.capacidad),
        caracteristicas: ["Césped sintético", "Iluminación"],
        descripcion: formData.descripcion,
        establecimientoId: miEstablecimientoId,
        disponible: true,
      }

      if (editingZona) {
        await actualizarZonaHook(editingZona.id, zonaData)
      } else {
        await crearZonaHook(zonaData)
      }

      // Refrescar datos del context
      await refetch()

      // Reset form
      setFormData({
        nombre: "",
        tipo: "",
        precio: "",
        capacidad: "",
        descripcion: "",
      })
      setIsCreating(false)
      setEditingZona(null)
    } catch (error) {
      console.error("❌ Error completo al guardar zona:", error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al guardar la zona: ${errorMessage}\n\nRevisa la consola del navegador para más detalles.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (zona: Zona) => {
    setEditingZona(zona)
    setFormData({
      nombre: zona.nombre,
      tipo: zona.tipo,
      precio: zona.precio.toString(),
      capacidad: zona.capacidad.toString(),
      descripcion: zona.descripcion || "",
    })
    setIsCreating(true)
  }

  const handleDelete = async (zonaId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta zona?")) {
      try {
        await eliminarZonaHook(zonaId)
        
        // Refrescar datos del context
        await refetch()
      } catch (error) {
        console.error("Error al eliminar zona:", error)
        alert("Hubo un error al eliminar la zona. Por favor intenta nuevamente.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Canchas</h2>
          <p className="text-gray-600">Gestiona las zonas deportivas de tu establecimiento</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Zona
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingZona ? "Editar Zona" : "Crear Nueva Zona"}</DialogTitle>
              <DialogDescription>
                {editingZona ? "Modifica los datos de la zona" : "Agrega una nueva cancha/zona a tu establecimiento"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Zona</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Cancha A, Cancha B, Zona Principal"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Deporte</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el deporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDeporte.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precio">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Precio por Hora (S/)
                  </Label>
                  <Input
                    id="precio"
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="100"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacidad">
                    <Users className="inline h-4 w-4 mr-1" />
                    Capacidad (personas)
                  </Label>
                  <Input
                    id="capacidad"
                    type="number"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                    placeholder="22"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">
                  <Info className="inline h-4 w-4 mr-1" />
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Características adicionales de la zona..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingZona(null)
                    setFormData({
                      nombre: "",
                      tipo: "",
                      precio: "",
                      capacidad: "",
                      descripcion: "",
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? "Guardando..." : editingZona ? "Actualizar" : "Crear"} Zona
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {zonas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes zonas registradas</h3>
            <p className="text-gray-600 mb-4">Comienza agregando las canchas de tu establecimiento</p>
            <Button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Primera Zona
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonas.map((zona) => (
            <Card key={zona.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{zona.nombre}</CardTitle>
                    <CardDescription>{zona.tipo}</CardDescription>
                  </div>
                  <Badge className="bg-green-600">{formatearPrecio(zona.precio)}/hora</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  Capacidad: {zona.capacidad} personas
                </div>
                {zona.descripcion && (
                  <p className="text-sm text-gray-600">{zona.descripcion}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(zona)} className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(zona.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
