"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"

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

interface SearchBarProps {
  onSearchSubmit: (address: string) => void
  onSearchResult: (result: SearchResult) => void
  placeholder?: string
}

export function SearchBar({ onSearchSubmit, onSearchResult, placeholder = "Search for a location..." }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery.trim())
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const performSearch = async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    try {
      // Use Google Places API for better search results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&types=establishment|geocode`
      )
      
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const results = data.results.slice(0, 5).map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          location: place.geometry.location,
          types: place.types,
        }))
        
        setSearchResults(results)
        setShowResults(true)
        setSelectedIndex(-1)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
      setShowResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      await onSearchSubmit(searchQuery.trim())
      setSearchQuery("")
      setShowResults(false)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    setSearchQuery(result.name)
    setShowResults(false)
    setSelectedIndex(-1)
    
    // Call the callback with the selected result
    onSearchResult(result)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleResultSelect(searchResults[selectedIndex])
      } else {
        handleSearch()
      }
    } else if (e.key === "Escape") {
      setShowResults(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true)
            }
          }}
          className="pr-12"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0"
        >
          {isSearching ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {searchResults.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleResultSelect(result)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                index === selectedIndex ? "bg-gray-50 dark:bg-gray-700" : ""
              }`}
            >
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {result.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {result.address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 