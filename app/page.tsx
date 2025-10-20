"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppProvider } from "@/contexts/AppContext"
import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { CanchasGrid } from "@/components/CanchasGrid"
import { Footer } from "@/components/Footer"
import { LoginModal } from "@/components/LoginModal"
import { DetallesModal } from "@/components/DetallesModal"
import { CheckoutModal } from "@/components/CheckoutModal"
import { useReserva } from "@/hooks/useReserva"
import { useAuth } from "@/hooks/useAuth"
import { CheckCircle, X } from "lucide-react"

function HomePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { abrirLogin } = useReserva()
  const { user } = useAuth()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    const shouldLogin = searchParams.get("login")
    const passwordReset = searchParams.get("password_reset")
    
    if (shouldLogin === "true") {
      abrirLogin()
    }
    
    if (passwordReset === "success") {
      setShowSuccessMessage(true)
      // Limpiar el parámetro de la URL
      router.replace("/")
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams, abrirLogin, router])

  useEffect(() => {
    if (user?.tipo === "dueno") {
      router.push("/admin")
    }
  }, [user, router])

  if (user?.tipo === "dueno") {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Mensaje de éxito de reseteo de contraseña */}
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg shadow-lg px-6 py-4 flex items-center space-x-3 max-w-md">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">
                ¡Contraseña actualizada exitosamente!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Ahora puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-700 hover:text-green-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-grow">
        <HeroSection />
        <CanchasGrid />
      </main>
      <Footer />
      <LoginModal />
      <DetallesModal />
      <CheckoutModal />
    </div>
  )
}

export default function HomePage() {
  return (
    <AppProvider>
      <HomePageContent />
    </AppProvider>
  )
}
