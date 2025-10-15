"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { LoginModal } from "@/components/LoginModal"
import { useReserva } from "@/hooks/useReserva"
import { AppProvider } from "@/contexts/AppContext"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { abrirLogin } = useReserva()

  const redirectPath = searchParams.get("redirect") || "/"

  useEffect(() => {
    if (user) {
      router.push(redirectPath)
      return
    }

    // Solo abrir login una vez cuando el componente se monta
    const timer = setTimeout(() => {
      abrirLogin()
    }, 100)

    return () => clearTimeout(timer)
  }, [user, router, redirectPath]) // Solo depende de user, router y redirectPath

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">Accede a tu cuenta para gestionar tus reservas</p>
        </div>

        <LoginModal />

        <div className="text-center">
          <button onClick={() => router.push("/")} className="text-green-600 hover:text-green-500 text-sm font-medium">
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AppProvider>
      <LoginPageContent />
    </AppProvider>
  )
}
