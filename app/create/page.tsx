"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CardEditor } from "@/components/card-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Edit, Save, Download, RefreshCw } from "lucide-react"
import html2canvas from "html2canvas"

export default function CreatePage() {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [userRequest, setUserRequest] = useState("")
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [cardData, setCardData] = useState<{
    title: string
    text: string
    fontSize: number
    fontFamily: string
    fontStyle: string
    backgroundColor: string
    backgroundImage?: string
    imageUrl?: string
    textContainerBackground?: string
    textContainerOpacity?: number
    textColor?: string
  } | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [generatedData, setGeneratedData] = useState<{
    title?: string
    text?: string
    imageDescription?: string
    imageUrl?: string | null
    suggestedBackgroundColor?: string
  } | undefined>(undefined)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [loading, user, router])

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userRequest.trim()) return

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRequest }),
      })

      let data: {
        error?: string
        details?: string
        message?: string
        title?: string
        text?: string
        imageUrl?: string
        imageDescription?: string
        suggestedBackgroundColor?: string
      } = {}
      const contentType = response.headers.get("content-type")
      
      // Read response as text first (can only read body once)
      const responseText = await response.text()
      
      if (contentType && contentType.includes("application/json")) {
        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText)
          } catch (parseError) {
            console.error("Failed to parse JSON response:", parseError)
            console.error("Response text:", responseText)
            throw new Error(`Server error: ${response.status} ${response.statusText}. Invalid JSON response.`)
          }
        } else {
          console.warn("Empty JSON response body")
          data = {}
        }
      } else {
        console.error("Non-JSON response:", responseText || "(empty)")
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${responseText || "No error details provided."}`)
      }

      if (!response.ok) {
        // Check if data is actually populated
        const hasErrorData = data && typeof data === 'object' && Object.keys(data).length > 0 && (data.error || data.details || data.message)
        const isEmptyResponse = !responseText || responseText.trim().length === 0
        
        // Build error message with priority: error > details > message > fallback
        let errorMessage = `Failed to generate card (${response.status} ${response.statusText})`
        
        if (hasErrorData) {
          errorMessage = data.error || data.details || data.message || errorMessage
        } else if (!isEmptyResponse) {
          // Try to extract error from response text if JSON parse failed
          errorMessage = responseText.length > 200 ? responseText.substring(0, 200) + "..." : responseText
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}. The server returned an empty response.`
        }
        
        // Log detailed error information
        const errorInfo: {
          status: number
          statusText: string
          contentType: string
          responseBodyLength: number
          isEmptyResponse: boolean
          responseBody?: string
          responseBodyPreview?: string
          parsedData?: unknown
          dataKeys?: string[]
        } = {
          status: response.status,
          statusText: response.statusText,
          contentType: contentType || "(not set)",
          responseBodyLength: responseText?.length || 0,
          isEmptyResponse: isEmptyResponse
        }
        
        // Only include response body if it's not too long
        if (responseText && responseText.length < 500) {
          errorInfo.responseBody = responseText
        } else if (responseText) {
          errorInfo.responseBodyPreview = responseText.substring(0, 200) + "..."
        }
        
        // Include parsed data if available
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          errorInfo.parsedData = data
          errorInfo.dataKeys = Object.keys(data)
        } else {
          errorInfo.parsedData = "(empty or invalid)"
        }
        
        console.error("API Error:", errorInfo)
        throw new Error(errorMessage)
      }

      console.log("Generated data received:", data)
      console.log("Image URL:", data.imageUrl)
      setGeneratedData(data)
      
      // Initialize card data from generated data
      setCardData({
        title: data.title || "Greetings!",
        text: data.text || "Wishing you all the best!",
        fontSize: 24,
        fontFamily: "Arial",
        fontStyle: "normal",
        backgroundColor: data.suggestedBackgroundColor || "#fafafa",
        backgroundImage: data.imageUrl || undefined,
        imageUrl: data.imageUrl || undefined,
        textContainerBackground: data.imageUrl ? "#000000" : undefined,
        textContainerOpacity: data.imageUrl ? 0.6 : undefined,
        textColor: data.imageUrl ? "#ffffff" : undefined,
      })
      
      // Go directly to editor after creation
      setShowEditor(true)
    } catch (err: unknown) {
      console.error("Error generating card:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate card. Please try again."
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async (cardData: {
    id?: string
    title: string
    text: string
    fontSize: number
    fontFamily: string
    fontStyle: string
    backgroundColor: string
    backgroundImage?: string
    imageUrl?: string
    textContainerBackground?: string
    textContainerOpacity?: number
    textColor?: string
  }) => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      })

      if (response.ok) {
        await response.json()
        router.push(`/dashboard`)
      } else {
        throw new Error("Failed to save card")
      }
    } catch (error) {
      console.error("Error saving card:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Helper function to get text color based on background
  const getTextColor = (backgroundColor: string): string => {
    const lightColors = [
      "#ffffff", "#fafafa", "#f0f0f0", "#fff5e6", "#fffef0", 
      "#f0fff4", "#f0f9ff", "#fff0f5", "#fff5f5", "#faf5ff"
    ]
    if (lightColors.includes(backgroundColor.toLowerCase())) {
      return "#1a1a1a"
    }
    const hex = backgroundColor.replace("#", "")
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? "#1a1a1a" : "#ffffff"
  }

  const handleExport = async () => {
    if (!previewRef.current || !cardData) return

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: cardData.backgroundColor || "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: false,
      })
      const url = canvas.toDataURL("image/png", 1.0)
      const link = document.createElement("a")
      link.download = `greeting-card-${Date.now()}.png`
      link.href = url
      link.click()
    } catch (error) {
      console.error("Error exporting card:", error)
    }
  }

  const handleRegenerate = () => {
    setShowPreview(false)
    setCardData(null)
    setGeneratedData(undefined)
    setUserRequest("")
  }

  const handleSaveFromPreview = async () => {
    if (!cardData) return
    await handleSave(cardData)
  }

  if (!showPreview && !showEditor) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 pt-20 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                Create New Greeting Card
              </h1>
              <p className="text-lg text-muted-foreground">
                Describe what kind of greeting card you want to create
              </p>
            </div>

            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  What would you like to create?
                </CardTitle>
                <CardDescription>
                  Enter your request and our AI will help you create a beautiful greeting card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="e.g., A birthday card for my friend with balloons and cake theme..."
                    value={userRequest}
                    onChange={(e) => setUserRequest(e.target.value)}
                    className="h-12 text-lg"
                    disabled={isGenerating}
                  />
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!userRequest.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Generating your card with AI...
                      </span>
                    ) : (
                      "Generate Card"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Preview mode - show card with action buttons
  if (showPreview && !showEditor && cardData) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                setShowPreview(false)
                setCardData(null)
                setGeneratedData(undefined)
                setUserRequest("")
              }}
              className="mb-4"
            >
              ← Back to Request
            </Button>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
              Your Greeting Card
            </h1>
            <p className="text-muted-foreground">
              Based on: &quot;{userRequest}&quot;
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                {/* Card Preview */}
                <div
                  ref={previewRef}
                  className="w-full aspect-[4/3] rounded-lg p-8 flex flex-col items-center justify-center shadow-lg relative overflow-hidden mb-6"
                  style={{
                    backgroundColor: cardData.backgroundColor,
                    backgroundImage: cardData.backgroundImage
                      ? `url(${cardData.backgroundImage})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Text Container with adjustable background - only show when there's an image */}
                  {cardData.backgroundImage ? (
                    <div
                      className="px-8 py-6 rounded-lg"
                      style={{
                        backgroundColor: (() => {
                          const opacity = cardData.textContainerOpacity ?? 0.6
                          const bgColor = cardData.textContainerBackground || "#000000"
                          const hex = bgColor.replace("#", "")
                          const r = parseInt(hex.substr(0, 2), 16)
                          const g = parseInt(hex.substr(2, 2), 16)
                          const b = parseInt(hex.substr(4, 2), 16)
                          return `rgba(${r}, ${g}, ${b}, ${opacity})`
                        })(),
                        maxWidth: "90%",
                        opacity: "1",
                      }}
                    >
                      <h2
                        className="text-2xl font-bold mb-4 text-center"
                        style={{
                          fontFamily: cardData.fontFamily,
                          fontSize: `${cardData.fontSize * 1.1}px`,
                          fontStyle: cardData.fontStyle.includes("italic") ? "italic" : "normal",
                          fontWeight: "bold",
                          color: cardData.textColor || "#ffffff",
                          textShadow: "2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {cardData.title}
                      </h2>
                      <p
                        className="text-center"
                        style={{
                          fontFamily: cardData.fontFamily,
                          fontSize: `${cardData.fontSize}px`,
                          fontStyle: cardData.fontStyle.includes("italic") ? "italic" : "normal",
                          fontWeight: cardData.fontStyle.includes("bold") ? "bold" : "normal",
                          color: cardData.textColor || "#ffffff",
                        }}
                      >
                        {cardData.text}
                      </p>
                    </div>
                  ) : (
                    <>
                      <h2
                        className="text-2xl font-bold mb-4 text-center"
                        style={{
                          fontFamily: cardData.fontFamily,
                          fontSize: `${cardData.fontSize * 1.1}px`,
                          fontStyle: cardData.fontStyle.includes("italic") ? "italic" : "normal",
                          fontWeight: "bold",
                          color: cardData.textColor || getTextColor(cardData.backgroundColor),
                          textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {cardData.title}
                      </h2>
                      <p
                        className="text-center"
                        style={{
                          fontFamily: cardData.fontFamily,
                          fontSize: `${cardData.fontSize}px`,
                          fontStyle: cardData.fontStyle.includes("italic") ? "italic" : "normal",
                          fontWeight: cardData.fontStyle.includes("bold") ? "bold" : "normal",
                          color: cardData.textColor || getTextColor(cardData.backgroundColor),
                        }}
                      >
                        {cardData.text}
                      </p>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setShowEditor(true)} variant="default" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button onClick={handleSaveFromPreview} variant="default" className="flex-1" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={handleExport} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button onClick={handleRegenerate} variant="outline" className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Editor mode - show full editor
  if (showEditor && cardData) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                setShowEditor(false)
                setCardData(null)
                setGeneratedData(undefined)
                setUserRequest("")
              }}
              className="mb-4"
            >
              ← Back to Create
            </Button>
          </div>
          <CardEditor 
            onSave={handleSave} 
            initialRequest={userRequest}
            generatedData={generatedData}
            initialData={cardData}
          />
        </main>
        <Footer />
      </div>
    )
  }

  return null
}

