"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"

interface CardData {
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
  updated_at: string
}

// Helper function to get text color based on background (same as create page)
function getTextColor(backgroundColor: string): string {
  const lightColors = [
    "#ffffff", "#fafafa", "#f0f0f0", "#fff5e6", "#fffef0", 
    "#f0fff4", "#f0f9ff", "#fff0f5", "#fff5f5", "#faf5ff"
  ]
  if (lightColors.includes(backgroundColor.toLowerCase())) {
    return "#1a1a1a"
  }
  const hex = backgroundColor.replace("#", "")
  if (hex.length === 6) {
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155 ? "#1a1a1a" : "#ffffff"
  }
  return "#ffffff"
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useSupabaseAuth()
  const router = useRouter()
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      fetchCards()
    }
  }, [user])

  const fetchCards = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/cards?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setCards(data)
      } else {
        console.error("Failed to fetch cards:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return
    if (!user) return

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setCards(cards.filter((card) => card.id !== id))
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  const handleEdit = (card: CardData) => {
    // Navigate to create page with card data
    const cardData = {
      id: card.id,
      title: card.title,
      text: card.text,
      fontSize: card.font_size,
      fontFamily: card.font_family,
      fontStyle: card.font_style || "normal",
      backgroundColor: card.background_color,
      backgroundImage: card.background_image || undefined,
      textColor: card.text_color,
      textContainerBackground: card.text_container_background,
      textContainerOpacity: card.text_container_opacity,
    }
    
    // Store card data in sessionStorage to pass to create page
    sessionStorage.setItem("editCardData", JSON.stringify(cardData))
    
    // Navigate to create page
    router.push("/create")
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
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
            My Cards
          </h1>
          <Link href="/create">
            <Button>Create New Card</Button>
          </Link>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any cards yet.</p>
              <Link href="/create">
                <Button>Create Your First Card</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card.id}>
                <CardHeader>
                  <CardTitle className="truncate">{card.title}</CardTitle>
                  <CardDescription>
                    Created {new Date(card.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Scale calculation: Preview max-w-4xl (~896px) vs Dashboard grid card
                      lg:grid-cols-3: ~400px (scale ~0.45), md:grid-cols-2: ~600px (scale ~0.67)
                      Use CSS container queries or responsive scaling */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg flex flex-col items-center justify-center shadow-lg relative overflow-hidden mb-6"
                    style={{
                      backgroundColor: card.background_color,
                      backgroundImage: card.background_image
                        ? `url(${card.background_image})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      // Scale padding: p-8 (32px) -> responsive based on container
                      // lg: ~14px (0.45 * 32), md: ~21px (0.67 * 32)
                      padding: "clamp(0.875rem, 1.5vw + 0.5rem, 2rem)",
                    }}
                  >
                    {/* Text Container with adjustable background - only show when there's an image */}
                    {card.background_image ? (
                      <div
                        className="rounded-lg"
                        style={{
                          backgroundColor: (() => {
                            const opacity = card.text_container_opacity ?? 0.6
                            const bgColor = card.text_container_background || "#000000"
                            const hex = bgColor.replace("#", "")
                            const r = parseInt(hex.substr(0, 2), 16)
                            const g = parseInt(hex.substr(2, 2), 16)
                            const b = parseInt(hex.substr(4, 2), 16)
                            return `rgba(${r}, ${g}, ${b}, ${opacity})`
                          })(),
                          maxWidth: "90%",
                          opacity: "1",
                          // Scale padding: px-8 py-6 -> proportional
                          // lg: px-3.5 py-2.7, md: px-5.3 py-4
                          padding: "clamp(0.675rem, 1.2vw + 0.4rem, 1.5rem) clamp(0.875rem, 1.5vw + 0.5rem, 2rem)",
                        }}
                      >
                        <h2
                          className="font-bold text-center"
                          style={{
                            fontFamily: card.font_family,
                            // Scale font: font_size * 1.1 -> scale down proportionally
                            // lg: ~0.45x, md: ~0.67x, base: 1x
                            fontSize: `clamp(${(card.font_size * 1.1 * 0.4).toFixed(1)}px, ${(card.font_size * 1.1 * 0.65).toFixed(1)}px, ${card.font_size * 1.1}px)`,
                            fontStyle: (card.font_style || "normal").includes("italic") ? "italic" : "normal",
                            fontWeight: "bold",
                            color: card.text_color || "#ffffff",
                            // Scale text shadow: 2px -> ~0.9px (lg), ~1.3px (md)
                            textShadow: "clamp(0.8px, 0.15vw, 1px) clamp(0.8px, 0.15vw, 1px) clamp(1.6px, 0.3vw, 2px) rgba(0,0,0,0.5), 0 0 clamp(3.2px, 0.6vw, 4px) rgba(0,0,0,0.3)",
                            letterSpacing: "clamp(0.2px, 0.05vw, 0.5px)",
                            marginBottom: "clamp(0.5rem, 1vw + 0.25rem, 1rem)",
                          }}
                        >
                          {card.title}
                        </h2>
                        <p
                          className="text-center"
                          style={{
                            fontFamily: card.font_family,
                            // Scale font: font_size -> proportional
                            fontSize: `clamp(${(card.font_size * 0.4).toFixed(1)}px, ${(card.font_size * 0.65).toFixed(1)}px, ${card.font_size}px)`,
                            fontStyle: (card.font_style || "").includes("italic") ? "italic" : "normal",
                            fontWeight: (card.font_style || "").includes("bold") ? "bold" : "normal",
                            color: card.text_color || "#ffffff",
                          }}
                        >
                          {card.text}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h2
                          className="font-bold text-center"
                      style={{
                        fontFamily: card.font_family,
                            // Scale font: font_size * 1.1 -> proportional
                            fontSize: `clamp(${(card.font_size * 1.1 * 0.4).toFixed(1)}px, ${(card.font_size * 1.1 * 0.65).toFixed(1)}px, ${card.font_size * 1.1}px)`,
                            fontStyle: (card.font_style || "normal").includes("italic") ? "italic" : "normal",
                            fontWeight: "bold",
                            color: card.text_color || getTextColor(card.background_color),
                            // Scale text shadow: 1px -> ~0.45px (lg), ~0.67px (md)
                            textShadow: "clamp(0.4px, 0.08vw, 0.5px) clamp(0.4px, 0.08vw, 0.5px) clamp(0.8px, 0.15vw, 1px) rgba(0,0,0,0.2)",
                            letterSpacing: "clamp(0.2px, 0.05vw, 0.5px)",
                            marginBottom: "clamp(0.5rem, 1vw + 0.25rem, 1rem)",
                      }}
                    >
                      {card.title}
                        </h2>
                    <p
                          className="text-center"
                      style={{
                        fontFamily: card.font_family,
                            // Scale font: font_size -> proportional
                            fontSize: `clamp(${(card.font_size * 0.4).toFixed(1)}px, ${(card.font_size * 0.65).toFixed(1)}px, ${card.font_size}px)`,
                            fontStyle: (card.font_style || "").includes("italic") ? "italic" : "normal",
                            fontWeight: (card.font_style || "").includes("bold") ? "bold" : "normal",
                            color: card.text_color || getTextColor(card.background_color),
                      }}
                    >
                          {card.text}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(card)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}

