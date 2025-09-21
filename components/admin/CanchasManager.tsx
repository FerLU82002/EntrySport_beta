"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Edit, Trash2, MapPin, Phone, Clock, Users } from "lucide-react"
import { formatearPrecio } from "@/utils/formatters"
import type { Cancha } from "@/types"
import { Building2 } from "lucide-react" // Import Building2 component

interface CanchasManagerProps {
  canchas: Cancha[]
  onCanchasChange: (canchas: Cancha[]) => void
}

export function CanchasManager({ canchas, onCanchasChange }: CanchasManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingCancha, setEditingCancha] = useState<Cancha | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    establecimiento: "",
    tipo: "",
    ubicacion: "",
    direccion: "",
    telefono: "",
    descripcion: "",
    servicios: "",
    horarioAtencion: "",
  })

  const tiposCancha = ["Fútbol 11", "Fútbol 7", "Fútbol 5", "Tenis", "Básquetbol", "Vóley"]
  const ubicacionesDisponibles = [
    "San Isidro",
    "Miraflores",
    "Los Olivos",
    "Cercado de Lima",
    "San Martín de Porres",
    "Barranco",
    "Comas",
    "La Molina",
    "Surco",
    "Villa El Salvador",
    "Jesús María",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const nuevaCancha: Cancha = {
      id: editingCancha ? editingCancha.id : Date.now(),
      nombre: formData.nombre,
      establecimiento: formData.establecimiento,
      tipo: formData.tipo,
      imagen: "/placeholder.svg?height=300&width=400",
      ubicacion: formData.ubicacion,
      direccion: formData.direccion,
      coordenadas: { lat: -12.0464, lng: -77.0428 }, // Coordenadas por defecto
      rating: editingCancha ? editingCancha.rating : 4.5,
      disponible: true,
      telefono: formData.telefono,
      descripcion: formData.descripcion,
      servicios: formData.servicios.split(",").map((s) => s.trim()),
      horarioAtencion: formData.horarioAtencion,
      zonas: editingCancha
        ? editingCancha.zonas
        : [
            {
              id: "zona-principal",
              nombre: "Zona Principal",
              tipo: formData.tipo,
              precio: 100,
              capacidad: formData.tipo.includes("Fútbol 11") ? 22 : formData.tipo.includes("Fútbol 7") ? 14 : 10,
              caracteristicas: ["Césped sintético", "Iluminación", "Vestuarios"],
              descripcion: "Zona principal del establecimiento",
            },
          ],
    }

    let nuevasCanchas
    if (editingCancha) {
      nuevasCanchas = canchas.map((c) => (c.id === editingCancha.id ? nuevaCancha : c))
    } else {
      nuevasCanchas = [...canchas, nuevaCancha]
    }

    onCanchasChange(nuevasCanchas)
    localStorage.setItem("canchas-dueno", JSON.stringify(nuevasCanchas))

    // Reset form
    setFormData({
      nombre: "",
      establecimiento: "",
      tipo: "",
      ubicacion: "",
      direccion: "",
      telefono: "",
      descripcion: "",
      servicios: "",
      horarioAtencion: "",
    })
    setIsCreating(false)
    setEditingCancha(null)
  }

  const handleEdit = (cancha: Cancha) => {
    setEditingCancha(cancha)
    setFormData({
      nombre: cancha.nombre,
      establecimiento: cancha.establecimiento,
      tipo: cancha.tipo,
      ubicacion: cancha.ubicacion,
      direccion: cancha.direccion,
      telefono: cancha.telefono,
      descripcion: cancha.descripcion,
      servicios: cancha.servicios.join(", "),
      horarioAtencion: cancha.horarioAtencion,
    })
    setIsCreating(true)
  }

  const handleDelete = (canchaId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta cancha?")) {
      const nuevasCanchas = canchas.filter((c) => c.id !== canchaId)
      onCanchasChange(nuevasCanchas)
      localStorage.setItem("canchas-dueno", JSON.stringify(nuevasCanchas))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Canchas</h2>
          <p className="text-gray-600">Administra tus establecimientos y zonas deportivas</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cancha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCancha ? "Editar Cancha" : "Crear Nueva Cancha"}</DialogTitle>
              <DialogDescription>
                {editingCancha ? "Modifica los datos de tu cancha" : "Registra un nuevo establecimiento deportivo"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Cancha</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Complejo Deportivo Los Campeones"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="establecimiento">Establecimiento</Label>
                  <Input
                    id="establecimiento"
                    value={formData.establecimiento}
                    onChange={(e) => setFormData({ ...formData, establecimiento: e.target.value })}
                    placeholder="Nombre del establecimiento"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Deporte</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposCancha.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Select
                    value={formData.ubicacion}
                    onValueChange={(value) => setFormData({ ...formData, ubicacion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {ubicacionesDisponibles.map((ubicacion) => (
                        <SelectItem key={ubicacion} value={ubicacion}>
                          {ubicacion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Av. Ejemplo 123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+51 987 654 321"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe tu establecimiento deportivo..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="servicios">Servicios (separados por comas)</Label>
                <Input
                  id="servicios"
                  value={formData.servicios}
                  onChange={(e) => setFormData({ ...formData, servicios: e.target.value })}
                  placeholder="Vestuarios, Estacionamiento, Cafetería"
                />
              </div>

              <div>
                <Label htmlFor="horarioAtencion">Horario de Atención</Label>
                <Input
                  id="horarioAtencion"
                  value={formData.horarioAtencion}
                  onChange={(e) => setFormData({ ...formData, horarioAtencion: e.target.value })}
                  placeholder="Lunes a Domingo: 6:00 AM - 11:00 PM"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingCancha(null)
                    setFormData({
                      nombre: "",
                      establecimiento: "",
                      tipo: "",
                      ubicacion: "",
                      direccion: "",
                      telefono: "",
                      descripcion: "",
                      servicios: "",
                      horarioAtencion: "",
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingCancha ? "Actualizar" : "Crear"} Cancha
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {canchas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes canchas registradas</h3>
            <p className="text-gray-600 mb-4">Comienza registrando tu primer establecimiento deportivo</p>
            <Button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Primera Cancha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {canchas.map((cancha) => (
            <Card key={cancha.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cancha.nombre}</CardTitle>
                    <CardDescription>{cancha.establecimiento}</CardDescription>
                  </div>
                  <Badge variant={cancha.disponible ? "default" : "secondary"}>
                    {cancha.disponible ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  {cancha.ubicacion} - {cancha.direccion}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="mr-2 h-4 w-4" />
                  {cancha.telefono}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-2 h-4 w-4" />
                  {cancha.horarioAtencion}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  {cancha.zonas.length} zona{cancha.zonas.length !== 1 ? "s" : ""} - Desde{" "}
                  {formatearPrecio(Math.min(...cancha.zonas.map((z) => z.precio)))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(cancha)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cancha.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
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
