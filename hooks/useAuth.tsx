"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  nombre: string
  telefono?: string
  tipo: "usuario" | "dueno"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, nombre: string, telefono?: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USERS: Record<string, User> = {
  "usuario@gmail.com": {
    id: "user-1",
    email: "usuario@gmail.com",
    nombre: "Usuario General",
    telefono: "+51 987 654 321",
    tipo: "usuario",
  },
  "admin@gmail.com": {
    id: "admin-1",
    email: "admin@gmail.com",
    nombre: "Dueño de Cancha",
    telefono: "+51 987 654 322",
    tipo: "dueno",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("auth-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const demoUser = DEMO_USERS[email]
    if (demoUser && password.length >= 6) {
      setUser(demoUser)
      localStorage.setItem("auth-user", JSON.stringify(demoUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (email: string, password: string, nombre: string, telefono?: string): Promise<boolean> => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (password.length >= 6 && nombre.trim()) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        nombre,
        telefono,
        tipo: "usuario",
      }

      setUser(newUser)
      localStorage.setItem("auth-user", JSON.stringify(newUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth-user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
