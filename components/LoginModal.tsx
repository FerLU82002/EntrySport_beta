"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useReserva } from "@/hooks/useReserva"
import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

export function LoginModal() {
  const { reserva, cerrarLogin } = useReserva()
  const { login, register, isLoading } = useAuth()
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    nombre: "",
    telefono: "",
  })
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(loginForm.email, loginForm.password)
    if (success) {
      cerrarLogin()
    } else {
      setError(
        "Credenciales inválidas. Verifica tu email y contraseña.",
      )
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await register(
      registerForm.email,
      registerForm.password,
      registerForm.nombre,
      registerForm.telefono,
    )
    if (success) {
      cerrarLogin()
    } else {
      setError(
        "Error al registrar. Verifica que todos los campos estén completos y la contraseña tenga al menos 6 caracteres",
      )
    }
  }

  return (
    <Dialog open={reserva.isLoginOpen} onOpenChange={cerrarLogin}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Accede a tu cuenta</DialogTitle>
          <DialogDescription>Inicia sesión para reservar canchas en toda la ciudad</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a 
                    href="/auth/forgot-password" 
                    className="text-xs text-green-600 hover:text-green-500 font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={registerForm.nombre}
                  onChange={(e) => setRegisterForm({ ...registerForm, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register">Email</Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="tu@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+51 987 654 321"
                  value={registerForm.telefono}
                  onChange={(e) => setRegisterForm({ ...registerForm, telefono: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">Contraseña</Label>
                <Input
                  id="password-register"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
