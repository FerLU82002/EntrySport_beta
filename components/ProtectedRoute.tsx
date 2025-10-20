"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  resource?: string
  fallbackPath?: string
}

export function ProtectedRoute({ children, requiredRole, resource, fallbackPath = "/" }: ProtectedRouteProps) {
  const { user, hasRole, canAccess, isLoading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Detectar si estamos en proceso de logout
  const isLoggingOut = typeof window !== "undefined" && sessionStorage.getItem("logging-out") === "true"

  useEffect(() => {
    if (isLoading || isLoggingOut) return

    if (!user) {
      setIsRedirecting(true)
      router.push("/login")
      return
    }

    if (requiredRole && !hasRole(requiredRole)) {
      setIsRedirecting(true)
      router.push(fallbackPath)
      return
    }

    if (resource && !canAccess(resource)) {
      setIsRedirecting(true)
      router.push(fallbackPath)
      return
    }
  }, [user, requiredRole, resource, hasRole, canAccess, router, fallbackPath, isLoading, isLoggingOut])

  // Mientras está cargando, redirigiendo o cerrando sesión, mostrar spinner
  if (isLoading || isRedirecting || isLoggingOut || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoggingOut ? "Cerrando sesión..." : isRedirecting ? "Redirigiendo..." : "Verificando acceso..."}
          </p>
        </div>
      </div>
    )
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes el rol necesario para acceder a esta página</p>
          <Link href={fallbackPath}>
            <Button className="bg-green-600 hover:bg-green-700">Volver</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (resource && !canAccess(resource)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Acceso No Autorizado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a este recurso</p>
          <Link href={fallbackPath}>
            <Button className="bg-green-600 hover:bg-green-700">Volver</Button>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
