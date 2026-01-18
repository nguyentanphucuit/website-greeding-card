"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, RefreshCw, Save } from "lucide-react"
import html2canvas from "html2canvas"

interface CardData {
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
}

interface CardEditorProps {
  initialData?: CardData
  initialRequest?: string
  generatedData?: {
    title?: string
    text?: string
    imageDescription?: string
    imageUrl?: string | null
    suggestedBackgroundColor?: string
  }
  onSave?: (data: CardData) => Promise<void>
  onRegenerate?: (data: {
    title?: string
    text?: string
    imageDescription?: string
    imageUrl?: string | null
    suggestedBackgroundColor?: string
  }) => void
}

// Helper function to determine text color based on background color
function getTextColor(backgroundColor: string): string {
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

export function CardEditor({ initialData, initialRequest, generatedData, onSave, onRegenerate }: CardEditorProps) {
  const [cardData, setCardData] = useState<CardData>(() => {
    if (initialData) {
      return initialData
    }
    if (generatedData) {
      return {
        title: generatedData.title || "Greetings!",
        text: generatedData.text || "Wishing you all the best!",
        fontSize: 24,
        fontFamily: "Arial",
        fontStyle: "normal",
        backgroundColor: generatedData.suggestedBackgroundColor || "#fafafa",
        backgroundImage: generatedData.imageUrl || undefined,
        textContainerBackground: generatedData.imageUrl ? "#000000" : undefined,
        textContainerOpacity: generatedData.imageUrl ? 0.6 : undefined,
        textColor: generatedData.imageUrl ? "#ffffff" : undefined,
      }
    }
    return {
      title: "Happy Birthday!",
      text: "Wishing you a wonderful day filled with joy and happiness!",
      fontSize: 24,
      fontFamily: "Arial",
      fontStyle: "normal",
      backgroundColor: "#ffffff",
    }
  })

  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    initialData?.backgroundImage || generatedData?.imageUrl || null
  )
  const [imageDescription, setImageDescription] = useState<string | null>(
    generatedData?.imageDescription || null
  )
  const [isSearchingImage, setIsSearchingImage] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialData) {
      setCardData(initialData)
      setBackgroundImageUrl(initialData.backgroundImage || null)
    }
    if (generatedData) {
      if (generatedData.title || generatedData.text) {
        setCardData(prev => ({
          ...prev,
          title: generatedData.title || prev.title,
          text: generatedData.text || prev.text,
        }))
      }
      if (generatedData.imageUrl) {
        setBackgroundImageUrl(generatedData.imageUrl)
        setCardData(prev => ({ ...prev, backgroundImage: generatedData.imageUrl || undefined }))
      }
      if (generatedData.suggestedBackgroundColor) {
        setCardData(prev => ({ ...prev, backgroundColor: generatedData.suggestedBackgroundColor! }))
      }
      if (generatedData.imageDescription) {
        setImageDescription(generatedData.imageDescription)
      }
    }
  }, [initialData, generatedData])

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBackgroundImageFile(file)
      const url = URL.createObjectURL(file)
      setBackgroundImageUrl(url)
      setCardData({ ...cardData, backgroundImage: url })
    }
  }

  const handleExport = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
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

  const handleRegenerate = async () => {
    if (!initialRequest || !initialRequest.trim()) {
      // Fallback to old behavior if no request
    const fonts = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana"]
    const colors = ["#ffffff", "#f0f0f0", "#fff5e6", "#e6f3ff", "#ffe6f0"]
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    setCardData({
      ...cardData,
      fontFamily: randomFont,
      backgroundColor: randomColor,
      fontSize: Math.floor(Math.random() * 20) + 20,
    })
      return
    }

    setIsRegenerating(true)
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRequest: initialRequest }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate card: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Update card data with new generated content
      const newGeneratedData = {
        title: data.title,
        text: data.text,
        imageDescription: data.imageDescription,
        imageUrl: data.imageUrl,
        suggestedBackgroundColor: data.suggestedBackgroundColor,
      }

      // Update state
      if (data.title || data.text) {
        setCardData(prev => ({
          ...prev,
          title: data.title || prev.title,
          text: data.text || prev.text,
        }))
      }

      if (data.imageUrl) {
        setBackgroundImageUrl(data.imageUrl)
        setCardData(prev => ({ ...prev, backgroundImage: data.imageUrl }))
      }

      if (data.suggestedBackgroundColor) {
        setCardData(prev => ({ ...prev, backgroundColor: data.suggestedBackgroundColor }))
      }

      if (data.imageDescription) {
        setImageDescription(data.imageDescription)
      }

      // Update text container settings if image is present
      if (data.imageUrl) {
        setCardData(prev => ({
          ...prev,
          textContainerBackground: prev.textContainerBackground || "#000000",
          textContainerOpacity: prev.textContainerOpacity ?? 0.6,
          textColor: prev.textColor || "#ffffff",
        }))
      }

      // Call onRegenerate callback if provided
      if (onRegenerate) {
        onRegenerate(newGeneratedData)
      }
    } catch (error) {
      console.error("Error regenerating card:", error)
      alert(error instanceof Error ? error.message : "Failed to regenerate card")
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(cardData)
    }
  }

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Left Column - Text Editing */}
      <Card className="flex-shrink min-w-[280px] lg:w-80">
        <CardHeader>
          <CardTitle>Text Editor</CardTitle>
          <CardDescription>Edit your card title and message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={cardData.title}
              onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Message</Label>
            <Textarea
              id="text"
              value={cardData.text}
              onChange={(e) => setCardData({ ...cardData, text: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={cardData.fontSize}
                onChange={(e) =>
                  setCardData({ ...cardData, fontSize: parseInt(e.target.value) || 24 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select
                value={cardData.fontFamily}
                onValueChange={(value) => setCardData({ ...cardData, fontFamily: value })}
              >
                <SelectTrigger id="fontFamily">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontStyle">Font Style</Label>
            <Select
              value={cardData.fontStyle}
              onValueChange={(value) => setCardData({ ...cardData, fontStyle: value })}
            >
              <SelectTrigger id="fontStyle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="italic">Italic</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="bold italic">Bold Italic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={cardData.textColor || "#1a1a1a"}
                onChange={(e) => setCardData({ ...cardData, textColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={cardData.textColor || "#1a1a1a"}
                onChange={(e) => setCardData({ ...cardData, textColor: e.target.value })}
                placeholder="#1a1a1a"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={handleRegenerate} 
              variant="outline" 
              className="w-full"
              disabled={isRegenerating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
              {isRegenerating ? "Generating..." : "Re-generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Center Column - Preview (Fixed/Min Width) */}
      <Card className="flex-1 min-w-[400px] lg:min-w-[500px]">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={cardRef}
            data-card-preview
            className="w-full aspect-[4/3] rounded-lg p-8 flex flex-col items-center justify-center shadow-lg relative overflow-hidden mb-4"
            style={{
              backgroundColor: cardData.backgroundColor,
              backgroundImage: backgroundImageUrl
                ? `url(${backgroundImageUrl})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Text Container with adjustable background - only show when there's an image */}
            {backgroundImageUrl ? (
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
                    fontStyle: (cardData.fontStyle || "").includes("italic") ? "italic" : "normal",
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
          {initialRequest && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Based on: &quot;{initialRequest}&quot;
            </p>
          )}
        </CardContent>
      </Card>

      {/* Right Column - All Other Controls */}
      <Card className="flex-shrink min-w-[280px] lg:w-80">
        <CardHeader>
          <CardTitle>Card Editor</CardTitle>
          <CardDescription>Customize your greeting card</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backgroundImage">Background Image</Label>
            {imageDescription && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                <p className="text-xs text-blue-700 mb-2 font-medium">AI Suggested Image:</p>
                <p className="text-sm text-blue-900">{imageDescription}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={async () => {
                    setIsSearchingImage(true)
                    try {
                      const query = imageDescription.split(" ").slice(0, 5).join(" ")
                      const response = await fetch(`/api/ai/search-image?q=${encodeURIComponent(query)}`)
                      const data = await response.json()
                      if (data.imageUrl) {
                        setBackgroundImageUrl(data.imageUrl)
                        setCardData({ ...cardData, backgroundImage: data.imageUrl })
                      }
                    } catch (error) {
                      console.error("Error searching image:", error)
                    } finally {
                      setIsSearchingImage(false)
                    }
                  }}
                  disabled={isSearchingImage}
                >
                  {isSearchingImage ? "Searching..." : "Find Image from Description"}
                </Button>
              </div>
            )}
            <Input
              id="backgroundImage"
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageChange}
            />
            {backgroundImageUrl && (
              <div className="mt-2">
                <img 
                  src={backgroundImageUrl} 
                  alt="Background preview" 
                  className="w-full h-32 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setBackgroundImageUrl(null)
                    setCardData({ ...cardData, backgroundImage: undefined })
                  }}
                >
                  Remove Image
                </Button>
              </div>
            )}
          </div>

          {/* Text Container Settings - Only show when there's a background image */}
          {backgroundImageUrl && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Text Container Background</Label>
                <p className="text-xs text-muted-foreground">Background color for text box (helps text stand out on images)</p>
          <div className="flex gap-2">
                  <Input
                    type="color"
                    value={cardData.textContainerBackground || "#000000"}
                    onChange={(e) => setCardData({ ...cardData, textContainerBackground: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={cardData.textContainerBackground || "#000000"}
                    onChange={(e) => setCardData({ ...cardData, textContainerBackground: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textContainerOpacity">
                  Text Container Opacity: {((cardData.textContainerOpacity ?? 0.6) * 100).toFixed(0)}%
                </Label>
                <p className="text-xs text-muted-foreground">Adjust transparency of text background (0% = transparent, 100% = solid)</p>
                <Input
                  id="textContainerOpacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={cardData.textContainerOpacity ?? 0.6}
                  onChange={(e) => setCardData({ ...cardData, textContainerOpacity: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleExport} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
