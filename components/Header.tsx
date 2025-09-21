"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useReserva } from "@/hooks/useReserva"
import { useAuth } from "@/hooks/useAuth"
import { User, LogOut, Calendar, Settings } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { abrirLogin } = useReserva()
  const { user, logout } = useAuth()

  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">RC</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ReservaCanchas</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#canchas" className="text-gray-600 hover:text-green-600 transition-colors">
            Canchas
          </a>
          <a href="#como-funciona" className="text-gray-600 hover:text-green-600 transition-colors">
            Cómo funciona
          </a>
          <a href="#contacto" className="text-gray-600 hover:text-green-600 transition-colors">
            Contacto
          </a>
        </nav>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-600 text-white">{getInitials(user.nombre)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.nombre}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-green-600 font-medium">
                    {user.tipo === "dueno" ? "Dueño de Cancha" : "Usuario General"}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/mis-reservas" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Mis Reservas
                </Link>
              </DropdownMenuItem>
              {user.tipo === "dueno" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Panel de Dueño
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="bg-green-600 hover:bg-green-700" onClick={abrirLogin}>
            Iniciar Sesión
          </Button>
        )}
      </div>
    </header>
  )
}
