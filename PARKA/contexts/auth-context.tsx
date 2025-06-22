"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  _id: string
  googleId: string
  email: string
  name: string
  picture?: string
  favorites: string[]
}

interface AuthContextType {
  user: User | null
  logout: () => void
  loading: boolean
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("parka_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem("parka_user", JSON.stringify(userData))
      } else {
        const errorData = await response.json()
        alert(`Registration failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed. Could not connect to server.")
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem("parka_user", JSON.stringify(userData))
      } else {
        const errorData = await response.json()
        alert(`Login failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Could not connect to server.")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("parka_user")
  }

  return <AuthContext.Provider value={{ user, logout, loading, registerWithEmail, loginWithEmail }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
