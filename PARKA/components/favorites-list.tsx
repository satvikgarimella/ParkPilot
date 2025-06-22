"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Trash2, Heart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface ParkingSpot {
  _id: string
  lat: number
  lng: number
  isAvailable: boolean
  lastUpdated: string
  address?: string
  spotType: string
  price?: number
}

export function FavoritesList() {
  const [favorites, setFavorites] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchFavorites = async () => {
    if (!user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favorites/${user._id}`)
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [user])

  const removeFavorite = async (spotId: string) => {
    if (!user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favorite`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          spotId: spotId,
        }),
      })

      if (response.ok) {
        setFavorites((prev) => prev.filter((spot) => spot._id !== spotId))
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
        </div>
      </div>
    )
  }

  if (!favorites.length) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No favorites yet</h3>
        <p className="text-gray-600 dark:text-gray-400">Start exploring and save your favorite parking spots!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Favorite Spots</h2>

      {favorites.map((spot) => (
        <Card key={spot._id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{spot.address || "Parking Spot"}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${spot.isAvailable ? "bg-green-500" : "bg-red-500"}`} />
                    {spot.isAvailable ? "Available" : "Occupied"}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(spot.lastUpdated).toLocaleTimeString()}
                  </div>

                  <span className="capitalize bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    {spot.spotType}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Coordinates: {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFavorite(spot._id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
