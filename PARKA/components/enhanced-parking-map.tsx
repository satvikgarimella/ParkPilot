"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MapPin, Clock, DollarSign, Search } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { SearchBar } from "./search-bar"
import type { google } from "google-maps"

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

interface SearchResult {
  id: string
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
  types: string[]
}

interface EnhancedParkingMapProps {
  onFavoriteToggle?: () => void
}

export function EnhancedParkingMap({ onFavoriteToggle }: EnhancedParkingMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([])
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null)
  const [loading, setLoading] = useState(true)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [searchMarkers, setSearchMarkers] = useState<google.maps.Marker[]>([])
  const { user } = useAuth()
  const [mapLoaded, setMapLoaded] = useState(false)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to San Francisco
          setUserLocation({ lat: 37.7749, lng: -122.4194 })
        },
      )
    } else {
      // Default to San Francisco
      setUserLocation({ lat: 37.7749, lng: -122.4194 })
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (userLocation && typeof window !== "undefined") {
      // Check if Google Maps is loaded
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps) {
          setMapLoaded(true)
          const mapInstance = new window.google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: userLocation,
            zoom: 15,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          })

          // Add user location marker
          new window.google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            title: "Your Location",
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `),
              scaledSize: new window.google.maps.Size(24, 24),
            },
          })

          setMap(mapInstance)
          setLoading(false)
        } else {
          // Retry after 100ms if Google Maps isn't loaded yet
          setTimeout(checkGoogleMaps, 100)
        }
      }

      checkGoogleMaps()
    }
  }, [userLocation])

  // Fetch parking spots
  const fetchParkingSpots = useCallback(async (location?: { lat: number; lng: number }) => {
    const targetLocation = location || userLocation
    if (!targetLocation) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parking?lat=${targetLocation.lat}&lng=${targetLocation.lng}&radius=0.02`,
      )
      if (response.ok) {
        const spots = await response.json()
        setParkingSpots(spots)
      }
    } catch (error) {
      console.error("Error fetching parking spots:", error)
    }
  }, [userLocation])

  useEffect(() => {
    fetchParkingSpots()
  }, [fetchParkingSpots])

  // Add parking spot markers to map
  useEffect(() => {
    if (!map || !parkingSpots.length) return

    // Clear existing parking markers
    markers.forEach((marker) => marker.setMap(null))

    const newMarkers = parkingSpots.map((spot) => {
      const marker = new window.google.maps.Marker({
        position: { lat: spot.lat, lng: spot.lng },
        map: map,
        title: spot.address || "Parking Spot",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${spot.isAvailable ? "#10B981" : "#EF4444"}" stroke="white" strokeWidth="2"/>
              <text x="16" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">P</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })

      marker.addListener("click", () => {
        setSelectedSpot(spot)
      })

      return marker
    })

    setMarkers(newMarkers)
  }, [map, parkingSpots])

  // Add search result markers to map
  useEffect(() => {
    if (!map || !searchMarkers.length) return

    // Clear existing search markers
    searchMarkers.forEach((marker) => marker.setMap(null))

    const newSearchMarkers = searchMarkers.map((marker) => {
      marker.setMap(map)
      return marker
    })

    setSearchMarkers(newSearchMarkers)
  }, [map, searchMarkers])

  const handleSearchResult = (result: SearchResult) => {
    if (!result || !result.location || !map) return
    
    const location = { lat: result.location.lat, lng: result.location.lng }
    
    // Clear existing search markers
    searchMarkers.forEach((marker) => marker.setMap(null))
    
    // Add new search result marker
    const searchMarker = new window.google.maps.Marker({
      position: location,
      map: map,
      title: result.name,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#FF6B35" stroke="white" strokeWidth="2"/>
            <text x="16" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">📍</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
      },
    })

    // Add click listener to search marker
    searchMarker.addListener("click", () => {
      // Show info window or alert with search result info
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${result.name}</h3>
            <p style="margin: 0; color: #666;">${result.address}</p>
          </div>
        `,
      })
      infoWindow.open(map, searchMarker)
    })

    setSearchMarkers([searchMarker])
    
    // Animate map to the search location
    map.panTo(location)
    map.setZoom(16)
    
    // Fetch parking spots around the search location
    fetchParkingSpots(location)
  }

  const handleSearchSubmit = async (address: string) => {
    if (!address) return
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/geocode?address=${encodeURIComponent(address)}`
      )
      const data = await response.json()
      if (response.ok) {
        const { lat, lng } = data
        const location = { lat, lng }
        
        // Clear existing search markers
        searchMarkers.forEach((marker) => marker.setMap(null))
        
        // Add search result marker
        const searchMarker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: address,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#FF6B35" stroke="white" strokeWidth="2"/>
                <text x="16" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">📍</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
          },
        })

        setSearchMarkers([searchMarker])
        
        // Animate map to the search location
        if (map) {
          map.panTo(location)
          map.setZoom(16)
        }
        
        // Fetch parking spots around the search location
        fetchParkingSpots(location)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    }
  }

  const handleFavorite = async (spot: ParkingSpot) => {
    if (!user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          spotId: spot._id,
        }),
      })

      if (response.ok) {
        onFavoriteToggle?.()
        setSelectedSpot(null)
      }
    } catch (error) {
      console.error("Error adding to favorites:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10">
        <SearchBar onSearchSubmit={handleSearchSubmit} onSearchResult={handleSearchResult} />
      </div>

      <div id="map" className="w-full h-full" />

      {selectedSpot && (
        <Card className="absolute bottom-4 left-4 right-4 z-10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{selectedSpot.address || "Parking Spot"}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-3 h-3 rounded-full ${selectedSpot.isAvailable ? "bg-green-500" : "bg-red-500"}`}
                    />
                    {selectedSpot.isAvailable ? "Available" : "Occupied"}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedSpot.lastUpdated).toLocaleTimeString()}
                  </div>

                  {selectedSpot.price !== undefined && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />${selectedSpot.price}/hr
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFavorite(selectedSpot)}
                    className="flex items-center gap-2"
                    disabled={!user}
                  >
                    <Heart className="w-4 h-4" />
                    Save to Favorites
                  </Button>

                  <Button variant="outline" onClick={() => setSelectedSpot(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 