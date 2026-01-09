"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AdminCard {
  id: string
  title: string
  text: string
  fontSize: number
  fontFamily: string
  fontStyle: string
  backgroundColor: string
  backgroundImage?: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

export default function AdminPage() {
  const { user, loading: authLoading } = useSupabaseAuth()
  const router = useRouter()
  const [cards, setCards] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
    }
    // Note: Admin check will be done via API route
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      fetchCards()
    }
  }, [user])

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/admin/cards")
      if (response.ok) {
        const data = await response.json()
        setCards(data)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
          Admin Panel
        </h1>
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
                    const date = new Date(c.createdAt)
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
                          {new Date(card.createdAt).toLocaleString()}
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
                        backgroundColor: card.backgroundColor,
                        backgroundImage: card.backgroundImage
                          ? `url(${card.backgroundImage})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <h3
                        className="text-lg font-bold mb-2 text-center"
                        style={{
                          fontFamily: card.fontFamily,
                          fontSize: `${card.fontSize * 0.6}px`,
                          fontStyle: card.fontStyle.includes("italic") ? "italic" : "normal",
                          fontWeight: card.fontStyle.includes("bold") ? "bold" : "normal",
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        className="text-center text-sm"
                        style={{
                          fontFamily: card.fontFamily,
                          fontSize: `${card.fontSize * 0.5}px`,
                          fontStyle: card.fontStyle.includes("italic") ? "italic" : "normal",
                          fontWeight: card.fontStyle.includes("bold") ? "bold" : "normal",
                          color:
                            card.backgroundColor === "#ffffff" ||
                            card.backgroundColor === "#f0f0f0" ||
                            card.backgroundColor === "#fff5e6"
                              ? "#000000"
                              : "#ffffff",
                        }}
                      >
                        {card.text}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">Font: {card.fontFamily}</Badge>
                      <Badge variant="outline">Size: {card.fontSize}px</Badge>
                      <Badge variant="outline">Style: {card.fontStyle}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

