"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, MapPin, Upload, Save } from "lucide-react"

interface Establecimiento {
  id: string
  nombre: string
  descripcion: string
  direccion: string
  ubicacionMaps: string
  foto: string
  ownerId: string
}

interface EstablecimientoManagerProps {
  userId: string
}

export function EstablecimientoManager({ userId }: EstablecimientoManagerProps) {
  const [establecimiento, setEstablecimiento] = useState<Establecimiento>({
    id: "",
    nombre: "",
    descripcion: "",
    direccion: "",
    ubicacionMaps: "",
    foto: "",
    ownerId: userId,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string>("")

  useEffect(() => {
    // Cargar establecimiento del localStorage
    const establecimientos = JSON.parse(localStorage.getItem("establecimientos") || "[]")
    const miEstablecimiento = establecimientos.find((e: Establecimiento) => e.ownerId === userId)

    if (miEstablecimiento) {
      setEstablecimiento(miEstablecimiento)
      setFotoPreview(miEstablecimiento.foto)
    } else {
      setIsEditing(true)
    }
  }, [userId])

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setFotoPreview(result)
        setEstablecimiento({ ...establecimiento, foto: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    const establecimientos = JSON.parse(localStorage.getItem("establecimientos") || "[]")
    const index = establecimientos.findIndex((e: Establecimiento) => e.ownerId === userId)

    const nuevoEstablecimiento = {
      ...establecimiento,
      id: establecimiento.id || `est-${Date.now()}`,
      ownerId: userId,
    }

    if (index >= 0) {
      establecimientos[index] = nuevoEstablecimiento
    } else {
      establecimientos.push(nuevoEstablecimiento)
    }

    localStorage.setItem("establecimientos", JSON.stringify(establecimientos))
    setEstablecimiento(nuevoEstablecimiento)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mi Establecimiento</h2>
        <p className="text-gray-600">Configura la información de tu establecimiento deportivo</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Información del Establecimiento
              </CardTitle>
              <CardDescription>Esta información se mostrará en las cards para los usuarios</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Establecimiento *</Label>
                <Input
                  id="nombre"
                  value={establecimiento.nombre}
                  onChange={(e) => setEstablecimiento({ ...establecimiento, nombre: e.target.value })}
                  placeholder="Ej: Complejo Deportivo Los Campeones"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={establecimiento.descripcion}
                  onChange={(e) => setEstablecimiento({ ...establecimiento, descripcion: e.target.value })}
                  placeholder="Describe tu establecimiento..."
                  rows={4}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  value={establecimiento.direccion}
                  onChange={(e) => setEstablecimiento({ ...establecimiento, direccion: e.target.value })}
                  placeholder="Ej: Av. Principal 123, Huánuco"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="ubicacionMaps">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  URL de Google Maps
                </Label>
                <Input
                  id="ubicacionMaps"
                  value={establecimiento.ubicacionMaps}
                  onChange={(e) => setEstablecimiento({ ...establecimiento, ubicacionMaps: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  disabled={!isEditing}
                />
                <p className="text-xs text-gray-500 mt-1">Copia el enlace de Google Maps de tu establecimiento</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Foto del Establecimiento</Label>
                <div className="mt-2">
                  {fotoPreview ? (
                    <div className="relative">
                      <img
                        src={fotoPreview || "/placeholder.svg"}
                        alt="Foto del establecimiento"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      {isEditing && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-2 right-2"
                          onClick={() => document.getElementById("foto-input")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Cambiar Foto
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div
                      className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
                      onClick={() => isEditing && document.getElementById("foto-input")?.click()}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click para subir una foto</p>
                      <p className="text-xs text-gray-400">PNG, JPG hasta 5MB</p>
                    </div>
                  )}
                  <input
                    id="foto-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Esta foto se mostrará en las cards de tus canchas</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={!establecimiento.nombre || !establecimiento.direccion}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
              {establecimiento.id && (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
