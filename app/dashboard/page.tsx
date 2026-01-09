"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Download } from "lucide-react"
import html2canvas from "html2canvas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CardEditor } from "@/components/card-editor"

interface CardData {
  id: string
  title: string
  text: string
  fontSize: number
  fontFamily: string
  fontStyle: string
  backgroundColor: string
  backgroundImage?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<CardData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchCards()
    }
  }, [session])

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards")
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

  const handleEdit = (card: CardData) => {
    setEditingCard(card)
    setIsDialogOpen(true)
  }

  const handleSaveEdit = async (cardData: any) => {
    if (!editingCard) return

    try {
      const response = await fetch(`/api/cards/${editingCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      })

      if (response.ok) {
        await fetchCards()
        setIsDialogOpen(false)
        setEditingCard(null)
      }
    } catch (error) {
      console.error("Error updating card:", error)
    }
  }

  const handleExport = async (card: CardData) => {
    // Create a temporary preview element
    const preview = document.createElement("div")
    preview.className = "w-full aspect-[4/3] rounded-lg p-8 flex flex-col items-center justify-center"
    preview.style.backgroundColor = card.backgroundColor
    if (card.backgroundImage) {
      preview.style.backgroundImage = `url(${card.backgroundImage})`
      preview.style.backgroundSize = "cover"
      preview.style.backgroundPosition = "center"
    }
    preview.style.backgroundPosition = "center"

    const title = document.createElement("h2")
    title.textContent = card.title
    title.className = "text-2xl font-bold mb-4 text-center"
    title.style.fontFamily = card.fontFamily
    title.style.fontSize = `${card.fontSize * 0.8}px`
    title.style.fontStyle = card.fontStyle.includes("italic") ? "italic" : "normal"
    title.style.fontWeight = card.fontStyle.includes("bold") ? "bold" : "normal"

    const text = document.createElement("p")
    text.textContent = card.text
    text.className = "text-center"
    text.style.fontFamily = card.fontFamily
    text.style.fontSize = `${card.fontSize}px`
    text.style.fontStyle = card.fontStyle.includes("italic") ? "italic" : "normal"
    text.style.fontWeight = card.fontStyle.includes("bold") ? "bold" : "normal"
    text.style.color =
      card.backgroundColor === "#ffffff" ||
      card.backgroundColor === "#f0f0f0" ||
      card.backgroundColor === "#fff5e6"
        ? "#000000"
        : "#ffffff"

    preview.appendChild(title)
    preview.appendChild(text)
    document.body.appendChild(preview)

    try {
      const canvas = await html2canvas(preview, {
        backgroundColor: card.backgroundColor,
        scale: 2,
      })
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `greeting-card-${card.id}.png`
      link.href = url
      link.click()
    } catch (error) {
      console.error("Error exporting card:", error)
    } finally {
      document.body.removeChild(preview)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
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
                    Created {new Date(card.createdAt).toLocaleDateString()}
                  </CardDescription>
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
                      {card.text.substring(0, 50)}
                      {card.text.length > 50 ? "..." : ""}
                    </p>
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
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(card)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Card</DialogTitle>
              <DialogDescription>Make changes to your greeting card</DialogDescription>
            </DialogHeader>
            {editingCard && (
              <CardEditor initialData={editingCard} onSave={handleSaveEdit} />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

