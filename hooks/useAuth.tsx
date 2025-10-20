"use client"

import { useState, useEffect, createContext, useContext, useCallback, useMemo, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

export interface User {
  id: string
  email: string
  nombre: string
  telefono?: string
  tipo: "usuario" | "dueno"
  role: "usuario" | "dueno"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, nombre: string, telefono?: string) => Promise<boolean>
  logout: () => void
  hasRole: (role: string) => boolean
  canAccess: (resource: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Primero intentar cargar desde localStorage para acelerar
    const cachedUser = localStorage.getItem("auth-user")
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser)
        setUser(userData)
        setIsLoading(false)
        
        // Validar en segundo plano
        setTimeout(() => validateSession(), 100)
        return
      } catch (e) {
        localStorage.removeItem("auth-user")
      }
    }
    
    // Si no hay cache, verificar sesión
    validateSession()
    
    async function validateSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setUser(null)
          setIsLoading(false)
          return
        }
        
        if (session?.user) {
          // Obtener perfil del usuario
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            const userData: User = {
              id: profile.id,
              email: profile.email,
              nombre: profile.nombre,
              telefono: profile.telefono,
              tipo: profile.role,
              role: profile.role,
            }
            setUser(userData)
            localStorage.setItem("auth-user", JSON.stringify(userData))
          }
        } else {
          setUser(null)
          localStorage.removeItem("auth-user")
        }
      } catch (error) {
        console.error("Error en validateSession:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            nombre: profile.nombre,
            telefono: profile.telefono,
            tipo: profile.role,
            role: profile.role,
          }
          setUser(userData)
          localStorage.setItem("auth-user", JSON.stringify(userData))
        }
      } else {
        setUser(null)
        localStorage.removeItem("auth-user")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error en login:", error.message)
        setIsLoading(false)
        return false
      }

      if (data.user) {
        // Obtener perfil del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profile) {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            nombre: profile.nombre,
            telefono: profile.telefono,
            tipo: profile.role,
            role: profile.role,
          }
          setUser(userData)
          localStorage.setItem("auth-user", JSON.stringify(userData))
          setIsLoading(false)
          return true
        }
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Error en login:", error)
      setIsLoading(false)
      return false
    }
  }, [supabase])

  const register = useCallback(
    async (email: string, password: string, nombre: string, telefono?: string): Promise<boolean> => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre,
              telefono,
              role: 'usuario', // Por defecto todos son usuarios
            },
          },
        })

        if (error) {
          console.error("Error en registro:", error.message)
          setIsLoading(false)
          return false
        }

        if (data.user) {
          // El trigger creará automáticamente el perfil
          setIsLoading(false)
          return true
        }

        setIsLoading(false)
        return false
      } catch (error) {
        console.error("Error en registro:", error)
        setIsLoading(false)
        return false
      }
    },
    [supabase],
  )

  const logout = useCallback(async () => {
    try {
      // Limpiar localStorage inmediatamente
      localStorage.removeItem("auth-user")
      
      // Limpiar cachés del usuario
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("mis-reservas-") || key.startsWith("admin-data-")) {
          localStorage.removeItem(key)
        }
      })
      
      // Limpiar sessionStorage
      sessionStorage.clear()
      
      // Limpiar el estado del usuario inmediatamente
      setUser(null)
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut()
      
      // Redirigir después de un pequeño delay para asegurar que todo se limpió
      setTimeout(() => {
        window.location.href = "/"
      }, 100)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Incluso si hay error, redirigir
      window.location.href = "/"
    }
  }, [supabase])

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.role === role
    },
    [user],
  )

  const canAccess = useCallback(
    (resource: string): boolean => {
      if (!user) {
        return false
      }

      const accessRules: Record<string, string[]> = {
        "/panel": ["dueno"],
        "/admin": ["dueno"],
        "/mis-reservas": ["usuario"],
        "/dashboard": ["usuario", "dueno"],
        "/checkout": ["usuario"],
      }

      const allowedRoles = accessRules[resource]
      return allowedRoles ? allowedRoles.includes(user.role) : true
    },
    [user],
  )

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      hasRole,
      canAccess,
    }),
    [user, isLoading, login, register, logout, hasRole, canAccess],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
