"use client"

import { useState, useEffect, createContext, useContext, useCallback, useMemo, type ReactNode } from "react"

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

const DEMO_USERS: Record<string, User> = {
  "usuario@gmail.com": {
    id: "user-1",
    email: "usuario@gmail.com",
    nombre: "Usuario General",
    telefono: "+51 987 654 321",
    tipo: "usuario",
    role: "usuario",
  },
  "admin@gmail.com": {
    id: "admin-1",
    email: "admin@gmail.com",
    nombre: "Dueño de Cancha",
    telefono: "+51 987 654 322",
    tipo: "dueno",
    role: "dueno",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("auth-user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        if (!parsedUser.role) {
          parsedUser.role = parsedUser.tipo
        }
        setUser(parsedUser)
      } catch (error) {
        localStorage.removeItem("auth-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const demoUser = DEMO_USERS[email]
    if (demoUser && password.length >= 6) {
      setUser(demoUser)
      localStorage.setItem("auth-user", JSON.stringify(demoUser))
      document.cookie = `auth-user=${JSON.stringify(demoUser)}; path=/; max-age=86400`
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }, [])

  const register = useCallback(
    async (email: string, password: string, nombre: string, telefono?: string): Promise<boolean> => {
      setIsLoading(true)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (password.length >= 6 && nombre.trim()) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          nombre,
          telefono,
          tipo: "usuario",
          role: "usuario",
        }

        setUser(newUser)
        localStorage.setItem("auth-user", JSON.stringify(newUser))
        document.cookie = `auth-user=${JSON.stringify(newUser)}; path=/; max-age=86400`
        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("auth-user")
    document.cookie = "auth-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/"
  }, [])

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
