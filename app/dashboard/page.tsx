"use client"

import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a tu dashboard</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">Volver al Inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido, {user.nombre}</h1>
          <p className="text-gray-600">Gestiona tu perfil y reservas desde tu dashboard personal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Mi Perfil
              </CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.telefono && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.telefono}</span>
                </div>
              )}
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm capitalize">{user.tipo}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Mis Reservas
              </CardTitle>
              <CardDescription>Gestiona tus reservas activas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/mis-reservas">
                <Button className="w-full bg-green-600 hover:bg-green-700">Ver Todas las Reservas</Button>
              </Link>
            </CardContent>
          </Card>

          {user.tipo === "dueno" && (
            <Card>
              <CardHeader>
                <CardTitle>Panel de Dueño</CardTitle>
                <CardDescription>Gestiona tus canchas y reservas</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Ir al Panel de Dueño</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
