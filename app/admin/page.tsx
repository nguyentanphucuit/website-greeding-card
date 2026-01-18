"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Users, CreditCard, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase-client"

interface AdminCard {
  id: string
  title: string
  text: string
  font_size: number
  font_family: string
  font_style: string
  background_color: string
  background_image?: string | null
  text_color: string
  text_container_background: string
  text_container_opacity: number
  initial_request?: string | null
  created_at: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

type MenuItem = "greeting-cards" | "users"

export default function AdminPage() {
  const { user, session, loading: authLoading } = useSupabaseAuth()
  const router = useRouter()
  const [cards, setCards] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<MenuItem>("greeting-cards")
  const [users, setUsers] = useState<Array<{id: string, name: string | null, email: string | null, plan: string, role: string, created_at: string}>>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
    }
    // Note: Admin check will be done via API route
  }, [authLoading, user, router])

  const fetchCards = useCallback(async () => {
    try {
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }
      const response = await fetch("/api/admin/cards", { headers })
      if (response.ok) {
        const data = await response.json()
        setCards(data)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoading(false)
    }
  }, [session])

  const fetchUsers = useCallback(async () => {
    try {
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }
      const response = await fetch("/api/admin/users", { headers })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (user) {
      if (activeMenu === "greeting-cards") {
        fetchCards()
      } else if (activeMenu === "users") {
        fetchUsers()
      }
    }
  }, [user, activeMenu, fetchCards, fetchUsers])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/signin")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCards(cards.filter((card) => card.id !== id))
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveMenu("greeting-cards")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === "greeting-cards"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Manage Greeting Card</span>
            </button>
            <button
              onClick={() => setActiveMenu("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === "users"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Manage Users</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-8 py-8">
          {activeMenu === "greeting-cards" && (
            <>
        <Card className="mb-6 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
            <CardTitle className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">{cards.length}</p>
                <p className="text-sm text-muted-foreground">Total Cards</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(cards.map((c) => c.user.id)).size}
                </p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cards.filter((c) => {
                    const date = new Date(c.created_at)
                    const today = new Date()
                    return date.toDateString() === today.toDateString()
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Cards Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            All Cards
          </h2>
          {cards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No cards found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <Card key={card.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{card.title}</CardTitle>
                        <CardDescription>
                          Created by: {card.user.name || card.user.email || "Unknown"} •{" "}
                          {new Date(card.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="w-full aspect-[4/3] rounded-lg p-4 flex flex-col items-center justify-center mb-4"
                      style={{
                        backgroundColor: card.background_color,
                        backgroundImage: card.background_image
                          ? `url(${card.background_image})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <h3
                        className="text-lg font-bold mb-2 text-center"
                        style={{
                          fontFamily: card.font_family,
                          fontSize: `${card.font_size * 0.6}px`,
                          fontStyle: card.font_style.includes("italic") ? "italic" : "normal",
                          fontWeight: card.font_style.includes("bold") ? "bold" : "normal",
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        className="text-center text-sm"
                        style={{
                          fontFamily: card.font_family,
                          fontSize: `${card.font_size * 0.5}px`,
                          fontStyle: card.font_style.includes("italic") ? "italic" : "normal",
                          fontWeight: card.font_style.includes("bold") ? "bold" : "normal",
                          color:
                            card.background_color === "#ffffff" ||
                            card.background_color === "#f0f0f0" ||
                            card.background_color === "#fff5e6"
                              ? "#000000"
                              : "#ffffff",
                        }}
                      >
                        {card.text}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">Font: {card.font_family}</Badge>
                      <Badge variant="outline">Size: {card.font_size}px</Badge>
                      <Badge variant="outline">Style: {card.font_style}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
            </div>
            </>
          )}

          {activeMenu === "users" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                Users
              </h2>
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    View and manage all registered users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading users...</p>
                  ) : users.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No users found.</p>
                  ) : (
                    <div className="space-y-3">
                      {users.map((userItem) => {
                        const userCards = cards.filter(c => c.user.id === userItem.id)
                        return (
                          <div
                            key={userItem.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium">{userItem.name || "Unknown"}</p>
                              <p className="text-sm text-gray-500">{userItem.email}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {userCards.length} card{userCards.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

