"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface HealthCheck {
  name: string
  status: "success" | "error" | "warning"
  message: string
}

export function DebugPanel() {
  const [checks, setChecks] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(false)

  const runHealthChecks = async () => {
    setLoading(true)
    const newChecks: HealthCheck[] = []

    // Check environment variables
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      newChecks.push({
        name: "Google Maps API Key",
        status: "success",
        message: "API key is set",
      })
    } else {
      newChecks.push({
        name: "Google Maps API Key",
        status: "error",
        message: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set",
      })
    }

    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      newChecks.push({
        name: "Backend URL",
        status: "success",
        message: `Set to ${process.env.NEXT_PUBLIC_BACKEND_URL}`,
      })
    } else {
      newChecks.push({
        name: "Backend URL",
        status: "error",
        message: "NEXT_PUBLIC_BACKEND_URL not set",
      })
    }

    // Check backend connection
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/health`)
      if (response.ok) {
        const data = await response.json()
        newChecks.push({
          name: "Backend Connection",
          status: "success",
          message: `Backend is running - ${data.message}`,
        })
      } else {
        newChecks.push({
          name: "Backend Connection",
          status: "error",
          message: `Backend responded with status ${response.status}`,
        })
      }
    } catch (error) {
      newChecks.push({
        name: "Backend Connection",
        status: "error",
        message: "Cannot connect to backend. Make sure it's running on port 10000",
      })
    }

    // Check Google Maps loading
    if (typeof window !== "undefined" && window.google) {
      newChecks.push({
        name: "Google Maps API",
        status: "success",
        message: "Google Maps API loaded successfully",
      })
    } else {
      newChecks.push({
        name: "Google Maps API",
        status: "warning",
        message: "Google Maps API not loaded yet",
      })
    }

    // Check geolocation
    if (navigator.geolocation) {
      newChecks.push({
        name: "Geolocation",
        status: "success",
        message: "Geolocation API available",
      })
    } else {
      newChecks.push({
        name: "Geolocation",
        status: "warning",
        message: "Geolocation not supported",
      })
    }

    setChecks(newChecks)
    setLoading(false)
  }

  useEffect(() => {
    runHealthChecks()
  }, [])

  const getIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Parka System Status
          <Button onClick={runHealthChecks} disabled={loading} size="sm">
            {loading ? "Checking..." : "Refresh"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
              {getIcon(check.status)}
              <div className="flex-1">
                <h4 className="font-medium">{check.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{check.message}</p>
              </div>
            </div>
          ))}
        </div>

        {checks.some((check) => check.status === "error") && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Setup Required</h4>
            <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <p>1. Set environment variables in .env.local</p>
              <p>2. Start backend: cd backend && npm start</p>
              <p>3. Seed database: node scripts/seed-database.js</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
