"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verificar que el usuario tenga un token válido de recuperación
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Si no hay sesión, redirigir al inicio con mensaje
        router.push('/?error=invalid_recovery_link')
      }
    }

    checkSession()
  }, [router, supabase])

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = []
    
    if (pwd.length < 8) {
      errors.push("Mínimo 8 caracteres")
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Al menos una mayúscula")
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Al menos una minúscula")
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("Al menos un número")
    }
    
    return errors
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setValidationErrors(validatePassword(value))
    setError("")
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    const errors = validatePassword(password)
    if (errors.length > 0) {
      setError("La contraseña no cumple con los requisitos mínimos")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
        
        // Redirigir al inicio después de 3 segundos
        setTimeout(() => {
          router.push('/?password_reset=success')
        }, 3000)
      }
    } catch (err) {
      setError("Ocurrió un error. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "" }
    
    const errors = validatePassword(password)
    
    if (errors.length === 0) {
      return { label: "Fuerte", color: "text-green-600" }
    } else if (errors.length <= 2) {
      return { label: "Media", color: "text-yellow-600" }
    } else {
      return { label: "Débil", color: "text-red-600" }
    }
  }

  const strength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center">
              {isSuccess ? "¡Contraseña actualizada!" : "Restablecer contraseña"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSuccess 
                ? "Tu contraseña ha sido cambiada exitosamente" 
                : "Crea una nueva contraseña segura para tu cuenta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Contraseña actualizada correctamente
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Redirigiendo al inicio de sesión...
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={() => router.push('/')} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Volver al inicio
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu nueva contraseña"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      disabled={isLoading}
                      className={validationErrors.length > 0 && password ? "border-red-300" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Seguridad:</span>
                        <span className={`font-medium ${strength.color}`}>{strength.label}</span>
                      </div>
                      
                      {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-xs font-medium text-red-800 mb-1">Requisitos faltantes:</p>
                          <ul className="text-xs text-red-700 space-y-1">
                            {validationErrors.map((err, idx) => (
                              <li key={idx} className="flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {err}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setError("")
                      }}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Las contraseñas no coinciden
                    </p>
                  )}
                  
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Las contraseñas coinciden
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-900 mb-2">
                    📌 Requisitos de seguridad:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-center">
                      {password.length >= 8 ? (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <div className="h-3 w-3 mr-1 rounded-full border border-blue-400" />
                      )}
                      Mínimo 8 caracteres
                    </li>
                    <li className="flex items-center">
                      {/[A-Z]/.test(password) ? (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <div className="h-3 w-3 mr-1 rounded-full border border-blue-400" />
                      )}
                      Al menos una letra mayúscula
                    </li>
                    <li className="flex items-center">
                      {/[a-z]/.test(password) ? (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <div className="h-3 w-3 mr-1 rounded-full border border-blue-400" />
                      )}
                      Al menos una letra minúscula
                    </li>
                    <li className="flex items-center">
                      {/[0-9]/.test(password) ? (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <div className="h-3 w-3 mr-1 rounded-full border border-blue-400" />
                      )}
                      Al menos un número
                    </li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={isLoading || validationErrors.length > 0 || password !== confirmPassword}
                >
                  {isLoading ? "Actualizando..." : "Restablecer contraseña"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
