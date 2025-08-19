"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Shield } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useReserva } from "@/hooks/useReserva"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { abrirLogin } = useReserva()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const goToDashboard = () => {
    if (isAdmin) {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">RC</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ReservaCanchas</span>
        </div>

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

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name || ""} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.full_name || "Usuario"}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    {isAdmin && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <Shield className="h-3 w-3" />
                        Administrador
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={goToDashboard}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{isAdmin ? "Panel Admin" : "Mi Dashboard"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700" onClick={abrirLogin}>
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
