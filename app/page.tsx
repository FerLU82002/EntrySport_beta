"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppProvider } from "@/contexts/AppContext"
import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { CanchasGrid } from "@/components/CanchasGrid"
import { LoginModal } from "@/components/LoginModal"
import { DetallesModal } from "@/components/DetallesModal"
import { CheckoutModal } from "@/components/CheckoutModal"
import { useReserva } from "@/hooks/useReserva"
import { useAuth } from "@/hooks/useAuth"

function HomePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { abrirLogin } = useReserva()
  const { user } = useAuth()

  useEffect(() => {
    const shouldLogin = searchParams.get("login")
    if (shouldLogin === "true") {
      abrirLogin()
    }
  }, [searchParams, abrirLogin])

  useEffect(() => {
    if (user?.tipo === "dueno") {
      router.push("/admin")
    }
  }, [user, router])

  if (user?.tipo === "dueno") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CanchasGrid />
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
