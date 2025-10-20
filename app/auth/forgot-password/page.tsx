"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      setError("Ocurrió un error. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al inicio
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription className="text-center">
              {isSuccess 
                ? "Revisa tu correo electrónico" 
                : "Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Email enviado exitosamente
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                      Revisa tu bandeja de entrada y sigue las instrucciones.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    💡 Consejos importantes:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>El enlace expira en 1 hora</li>
                    <li>Revisa tu carpeta de spam si no lo ves</li>
                    <li>Si no recibes el email en 5 minutos, intenta nuevamente</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => setIsSuccess(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Enviar otro enlace
                </Button>

                <Link href="/">
                  <Button variant="default" className="w-full bg-green-600 hover:bg-green-700">
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/" 
                    className="text-sm text-green-600 hover:text-green-500 font-medium"
                  >
                    ¿Recordaste tu contraseña? Volver al inicio
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
