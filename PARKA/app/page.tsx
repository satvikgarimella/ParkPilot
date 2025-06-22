"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AppLayout } from "@/components/app-layout"
import { Onboarding } from "@/components/onboarding"
import { DebugPanel } from "@/components/debug-panel"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user, loading } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Load Google Maps API
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      document.head.appendChild(script)
    }

    // Load Google Identity Services
    if (typeof window !== "undefined" && !document.querySelector('script[src*="accounts.google.com"]')) {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading Parka...</p>
        </div>
      </div>
    )
  }

  // Show debug panel in development
  if (showDebug) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Parka Debug Panel</h1>
            <Button onClick={() => setShowDebug(false)} variant="outline">
              Back to App
            </Button>
          </div>
          <DebugPanel />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {user ? <AppLayout /> : <Onboarding />}

      {/* Debug button in development */}
      {process.env.NODE_ENV === "development" && (
        <Button onClick={() => setShowDebug(true)} className="fixed bottom-4 right-4 z-50" size="sm" variant="outline">
          Debug
        </Button>
      )}
    </div>
  )
}
