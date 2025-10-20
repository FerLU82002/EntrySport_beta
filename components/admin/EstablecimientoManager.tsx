"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MapPin, Upload, Save, Phone, Clock } from "lucide-react"
import { useAdminData } from "@/contexts/AdminDataContext"
import { useEstablecimientos } from "@/hooks/useEstablecimientos"
import { useImageUpload } from "@/hooks/useImageUpload"
import type { Establecimiento } from "@/types"

interface EstablecimientoManagerProps {
  userId: string
}

export function EstablecimientoManager({ userId }: EstablecimientoManagerProps) {
  const { establecimientos: establecimientosFromContext, refetch } = useAdminData()
  const { crearEstablecimiento, actualizarEstablecimiento } = useEstablecimientos()
  const { uploadImage, deleteImage, uploading: uploadingImage, error: uploadError } = useImageUpload()
  const [isLoading, setIsLoading] = useState(false)
  const [establecimiento, setEstablecimiento] = useState<Establecimiento>({
    id: "",
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    horarioAtencion: "",
    servicios: [],
    ubicacion: "",
    foto: "",
    ownerId: userId,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string>("")
  const [serviciosText, setServiciosText] = useState("")
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>("")
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>("")

  // Estructura jerárquica: Departamento -> Provincias/Distritos
  const ubicacionesPeru = {
    Lima: [
      "Cercado de Lima",
      "San Isidro",
      "Miraflores",
      "San Borja",
      "Surco",
      "La Molina",
      "San Miguel",
      "Jesús María",
      "Lince",
      "Magdalena",
      "Pueblo Libre",
      "Barranco",
      "Chorrillos",
      "San Juan de Miraflores",
      "Villa María del Triunfo",
      "Villa El Salvador",
      "Los Olivos",
      "San Martín de Porres",
      "Independencia",
      "Comas",
      "Carabayllo",
      "Puente Piedra",
      "Ate",
      "Santa Anita",
      "El Agustino",
      "San Luis",
      "La Victoria",
    ],
    Huánuco: [
      "Huánuco",
      "Tingo María",
      "Ambo",
      "La Unión",
      "Dos de Mayo",
      "Huacaybamba",
      "Huamalíes",
      "Leoncio Prado",
      "Marañón",
      "Pachitea",
      "Puerto Inca",
      "Lauricocha",
    ],
    Cusco: [
      "Cusco",
      "Wanchaq",
      "Santiago",
      "San Sebastián",
      "San Jerónimo",
      "Calca",
      "Urubamba",
      "Ollantaytambo",
      "Pisac",
      "Chinchero",
      "Maras",
    ],
    Arequipa: [
      "Cercado de Arequipa",
      "Cayma",
      "Cerro Colorado",
      "Characato",
      "Chiguata",
      "Jacobo Hunter",
      "José Luis Bustamante y Rivero",
      "Mariano Melgar",
      "Miraflores",
      "Paucarpata",
      "Sabandía",
      "Sachaca",
      "Socabaya",
      "Tiabaya",
      "Yanahuara",
      "Yarabamba",
      "Yura",
    ],
    "La Libertad": [
      "Trujillo",
      "El Porvenir",
      "Florencia de Mora",
      "Huanchaco",
      "La Esperanza",
      "Laredo",
      "Moche",
      "Poroto",
      "Salaverry",
      "Simbal",
      "Víctor Larco Herrera",
    ],
    Piura: [
      "Piura",
      "Castilla",
      "Catacaos",
      "Cura Mori",
      "El Tallán",
      "La Arena",
      "La Unión",
      "Las Lomas",
      "Tambo Grande",
      "Sullana",
      "Paita",
      "Talara",
    ],
    Lambayeque: [
      "Chiclayo",
      "José Leonardo Ortiz",
      "La Victoria",
      "Pimentel",
      "Pomalca",
      "Reque",
      "Santa Rosa",
      "Lambayeque",
      "Ferreñafe",
    ],
    Cajamarca: [
      "Cajamarca",
      "Asunción",
      "Chetilla",
      "Cospán",
      "Encañada",
      "Jesús",
      "Llacanora",
      "Los Baños del Inca",
      "Magdalena",
      "Matara",
      "Namora",
    ],
    Puno: ["Puno", "Juliaca", "Ilave", "Yunguyo", "Juli", "Desaguadero", "Azángaro"],
    Ica: ["Ica", "Chincha", "Pisco", "Nazca", "Palpa"],
    Junín: ["Huancayo", "El Tambo", "Chilca", "Concepción", "Jauja", "Tarma", "La Oroya", "Satipo", "Chanchamayo"],
    Ucayali: ["Pucallpa", "Callería", "Yarinacocha", "Manantay", "Campoverde"],
    Loreto: ["Iquitos", "Punchana", "Belén", "San Juan Bautista", "Yurimaguas", "Nauta"],
    Ancash: ["Huaraz", "Chimbote", "Nuevo Chimbote", "Casma", "Huarmey", "Caraz"],
  }

  // Cargar establecimiento desde el context
  useEffect(() => {
    if (establecimientosFromContext.length > 0) {
      const miEstablecimiento = establecimientosFromContext[0]
      setEstablecimiento(miEstablecimiento)
      setFotoPreview(miEstablecimiento.foto)
      setServiciosText(miEstablecimiento.servicios.join(", "))
      
      // Extraer departamento y distrito de la ubicación guardada (formato: "Departamento - Distrito")
      if (miEstablecimiento.ubicacion) {
        const [dept, dist] = miEstablecimiento.ubicacion.split(" - ")
        setDepartamentoSeleccionado(dept || "")
        setDistritoSeleccionado(dist || "")
      }
    } else {
      setIsEditing(true)
    }
  }, [establecimientosFromContext])

  const handleDepartamentoChange = (dept: string) => {
    setDepartamentoSeleccionado(dept)
    setDistritoSeleccionado("") // Reset distrito cuando cambia departamento
    setEstablecimiento({ ...establecimiento, ubicacion: "" })
  }

  const handleDistritoChange = (dist: string) => {
    setDistritoSeleccionado(dist)
    // Guardar en formato: "Departamento - Distrito"
    const ubicacionCompleta = `${departamentoSeleccionado} - ${dist}`
    setEstablecimiento({ ...establecimiento, ubicacion: ubicacionCompleta })
  }

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    // Preview temporal mientras sube
    const tempPreview = URL.createObjectURL(file)
    setFotoPreview(tempPreview)

    try {
      // Subir a Supabase Storage
      const imageUrl = await uploadImage(file, userId)
      
      if (imageUrl) {
        setFotoPreview(imageUrl)
        setEstablecimiento({ ...establecimiento, foto: imageUrl })
      } else {
        setFotoPreview(establecimiento.foto)
        alert('Error al subir la imagen. Intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      setFotoPreview(establecimiento.foto)
      alert('Error al subir la imagen.')
    } finally {
      URL.revokeObjectURL(tempPreview)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const nuevoEstablecimiento: Establecimiento = {
        ...establecimiento,
        id: establecimiento.id || `est-${Date.now()}`,
        ownerId: userId,
        servicios: serviciosText.split(",").map((s) => s.trim()).filter(s => s),
      }

      if (establecimiento.id) {
        // Actualizar existente
        await actualizarEstablecimiento(establecimiento.id, nuevoEstablecimiento)
      } else {
        // Crear nuevo
        await crearEstablecimiento(nuevoEstablecimiento)
      }

      setEstablecimiento(nuevoEstablecimiento)
      setIsEditing(false)
      
      // Refrescar datos del context
      await refetch()
    } catch (error) {
      console.error("Error al guardar establecimiento:", error)
      alert("Hubo un error al guardar el establecimiento. Por favor intenta nuevamente.")
    } finally {
      setIsSaving(false)
    }
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
                  placeholder="Ej: Av. Principal 123"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="departamento">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Departamento *
                </Label>
                <Select
                  value={departamentoSeleccionado}
                  onValueChange={handleDepartamentoChange}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ubicacionesPeru).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="distrito">Distrito / Provincia *</Label>
                <Select
                  value={distritoSeleccionado}
                  onValueChange={handleDistritoChange}
                  disabled={!isEditing || !departamentoSeleccionado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={departamentoSeleccionado ? "Selecciona el distrito" : "Primero selecciona departamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentoSeleccionado && ubicacionesPeru[departamentoSeleccionado as keyof typeof ubicacionesPeru]?.map((distrito) => (
                      <SelectItem key={distrito} value={distrito}>
                        {distrito}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {establecimiento.ubicacion && (
                  <p className="text-xs text-gray-500 mt-1">📍 {establecimiento.ubicacion}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefono">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Teléfono *
                </Label>
                <Input
                  id="telefono"
                  value={establecimiento.telefono}
                  onChange={(e) => setEstablecimiento({ ...establecimiento, telefono: e.target.value })}
                  placeholder="+51 987 654 321"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="horarioAtencion">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Horario de Atención *
                </Label>
                <Input
                  id="horarioAtencion"
                  value={establecimiento.horarioAtencion}
                  onChange={(e) => setEstablecimiento({ ...establecimiento, horarioAtencion: e.target.value })}
                  placeholder="Lun-Dom: 6:00 AM - 11:00 PM"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="servicios">Servicios (separados por comas)</Label>
                <Input
                  id="servicios"
                  value={serviciosText}
                  onChange={(e) => setServiciosText(e.target.value)}
                  placeholder="Vestuarios, Estacionamiento, Cafetería"
                  disabled={!isEditing}
                />
                <p className="text-xs text-gray-500 mt-1">Ej: Vestuarios, Estacionamiento, Ducha caliente</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Foto del Establecimiento</Label>
                <div className="mt-2 relative">
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Subiendo imagen...</p>
                      </div>
                    </div>
                  )}
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
                {uploadError && (
                  <p className="text-sm text-red-600 mt-2">⚠️ {uploadError}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">Esta foto se mostrará en las cards de tus canchas</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={handleSave} 
                disabled={!establecimiento.nombre || !establecimiento.direccion || !establecimiento.ubicacion || !establecimiento.telefono || !establecimiento.horarioAtencion || isSaving || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar Cambios"}
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
