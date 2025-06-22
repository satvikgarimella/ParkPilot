"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Heart, Settings, Moon, Sun, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { EnhancedParkingMap } from "./enhanced-parking-map"
import { FavoritesList } from "./favorites-list"

type Tab = "map" | "favorites"

export function AppLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("map")
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Parka</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <div className="relative group">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name || "User"}</span>
              </Button>

              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "map" ? (
          <EnhancedParkingMap />
        ) : (
          <div className="p-6">
            <FavoritesList />
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex justify-around">
          <Button
            variant={activeTab === "map" ? "default" : "ghost"}
            onClick={() => setActiveTab("map")}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs">Find Parking</span>
          </Button>

          <Button
            variant={activeTab === "favorites" ? "default" : "ghost"}
            onClick={() => setActiveTab("favorites")}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Favorites</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
