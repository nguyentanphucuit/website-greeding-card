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
  textContainerBackground?: string // Background color for text container
  textContainerOpacity?: number // Opacity of text container (0-1)
  textColor?: string // Custom text color
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
}

// Helper function to determine text color based on background color
function getTextColor(backgroundColor: string): string {
  // Light colors - use dark text
  const lightColors = [
    "#ffffff", "#fafafa", "#f0f0f0", "#fff5e6", "#fffef0", 
    "#f0fff4", "#f0f9ff", "#fff0f5", "#fff5f5", "#faf5ff"
  ]
  
  if (lightColors.includes(backgroundColor.toLowerCase())) {
    return "#1a1a1a" // Dark text for light backgrounds
  }
  
  // Try to parse hex color and determine brightness
  const hex = backgroundColor.replace("#", "")
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  return brightness > 128 ? "#1a1a1a" : "#ffffff" // Dark text on light, white text on dark
}

function generateCardFromRequest(request: string): CardData {
  const lowerRequest = request.toLowerCase()
  
  // Determine card type and content
  let title = "Greetings!"
  let text = "Wishing you all the best!"
  let backgroundColor = "#ffffff"
  let fontFamily = "Arial"
  
  // Birthday
  if (lowerRequest.includes("birthday") || lowerRequest.includes("bday")) {
    title = "Happy Birthday!"
    text = "Wishing you a wonderful day filled with joy and happiness!"
    backgroundColor = "#fff5e6"
  }
  // Anniversary
  else if (lowerRequest.includes("anniversary")) {
    title = "Happy Anniversary!"
    text = "Celebrating another year of love and happiness together!"
    backgroundColor = "#ffe6f0"
  }
  // Wedding
  else if (lowerRequest.includes("wedding") || lowerRequest.includes("marriage")) {
    title = "Congratulations!"
    text = "Wishing you a lifetime of love and happiness!"
    backgroundColor = "#f0f0ff"
  }
  // Thank you
  else if (lowerRequest.includes("thank") || lowerRequest.includes("thanks")) {
    title = "Thank You!"
    text = "Your kindness and generosity mean the world to me!"
    backgroundColor = "#e6f3ff"
  }
  // Christmas
  else if (lowerRequest.includes("christmas") || lowerRequest.includes("xmas")) {
    title = "Merry Christmas!"
    text = "Wishing you joy, peace, and happiness this holiday season!"
    backgroundColor = "#ffe6e6"
  }
  // New Year
  else if (lowerRequest.includes("new year")) {
    title = "Happy New Year!"
    text = "Wishing you health, happiness, and success in the coming year!"
    backgroundColor = "#fff5e6"
  }
  
  // Extract custom text if mentioned
  if (lowerRequest.includes("say") || lowerRequest.includes("write")) {
    const sayMatch = request.match(/(?:say|write|text)[:\s]+["']?([^"']+)["']?/i)
    if (sayMatch && sayMatch[1]) {
      text = sayMatch[1]
    }
  }
  
  // Color preferences
  if (lowerRequest.includes("red")) backgroundColor = "#ffe6e6"
  if (lowerRequest.includes("blue")) backgroundColor = "#e6f3ff"
  if (lowerRequest.includes("pink")) backgroundColor = "#ffe6f0"
  if (lowerRequest.includes("yellow")) backgroundColor = "#fff9e6"
  if (lowerRequest.includes("green")) backgroundColor = "#e6ffe6"
  
  // Font preferences
  if (lowerRequest.includes("elegant") || lowerRequest.includes("formal")) {
    fontFamily = "Georgia"
  } else if (lowerRequest.includes("modern") || lowerRequest.includes("bold")) {
    fontFamily = "Verdana"
  }
  
  return {
    title,
    text,
    fontSize: 24,
    fontFamily,
    fontStyle: "normal",
    backgroundColor,
  }
}

export function CardEditor({ initialData, initialRequest, generatedData, onSave }: CardEditorProps) {
  const [cardData, setCardData] = useState<CardData>(() => {
    if (initialData) {
      return initialData
    }
    // Use Gemini generated data if available
    if (generatedData) {
      return {
        title: generatedData.title || "Greetings!",
        text: generatedData.text || "Wishing you all the best!",
        fontSize: 24,
        fontFamily: "Arial",
        fontStyle: "normal",
        backgroundColor: generatedData.suggestedBackgroundColor || "#fafafa", // Use suggested color or very light gray
        backgroundImage: generatedData.imageUrl || undefined,
        textContainerBackground: generatedData.imageUrl ? "#000000" : undefined, // Dark background for text on images
        textContainerOpacity: generatedData.imageUrl ? 0.6 : undefined, // Semi-transparent on images
        textColor: generatedData.imageUrl ? "#ffffff" : undefined, // White text on images
      }
    }
    // Fallback to request-based generation
    if (initialRequest) {
      return generateCardFromRequest(initialRequest)
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
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialData) {
      setCardData(initialData)
      setBackgroundImageUrl(initialData.backgroundImage || null)
    }
    if (generatedData) {
      console.log("CardEditor: received generatedData", generatedData)
      // Update text content
      if (generatedData.title || generatedData.text) {
        setCardData(prev => ({
          ...prev,
          title: generatedData.title || prev.title,
          text: generatedData.text || prev.text,
        }))
      }
      // Update image
      if (generatedData.imageUrl) {
        console.log("CardEditor: setting image URL", generatedData.imageUrl)
        setBackgroundImageUrl(generatedData.imageUrl)
        setCardData(prev => ({ ...prev, backgroundImage: generatedData.imageUrl || undefined }))
      } else {
        console.log("CardEditor: no imageUrl in generatedData")
      }
      // Update background color if suggested
      if (generatedData.suggestedBackgroundColor) {
        console.log("CardEditor: setting suggested background color", generatedData.suggestedBackgroundColor)
        setCardData(prev => ({ ...prev, backgroundColor: generatedData.suggestedBackgroundColor! }))
      }
      // Store image description
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
        // Better rendering for opacity
        foreignObjectRendering: false,
        // Ensure all styles are captured
        ignoreElements: (element) => {
          // Don't ignore any elements
          return false
        },
      })
      const url = canvas.toDataURL("image/png", 1.0) // Maximum quality
      const link = document.createElement("a")
      link.download = `greeting-card-${Date.now()}.png`
      link.href = url
      link.click()
    } catch (error) {
      console.error("Error exporting card:", error)
    }
  }

  const handleRegenerate = () => {
    // Symbolic AI generation - just randomize some values
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
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(cardData)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Card Editor</CardTitle>
          <CardDescription>Customize your greeting card</CardDescription>
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

          <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label>Text Color</Label>
                <p className="text-xs text-muted-foreground">Color of the text</p>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={cardData.textColor || "#ffffff"}
                    onChange={(e) => setCardData({ ...cardData, textColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={cardData.textColor || "#ffffff"}
                    onChange={(e) => setCardData({ ...cardData, textColor: e.target.value })}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleRegenerate} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-generate
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleExport} variant="default" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={cardRef}
            className="w-full aspect-[4/3] rounded-lg p-8 flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
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
                    // Convert hex to rgba - ensure opacity is properly applied
                    const hex = bgColor.replace("#", "")
                    const r = parseInt(hex.substr(0, 2), 16)
                    const g = parseInt(hex.substr(2, 2), 16)
                    const b = parseInt(hex.substr(4, 2), 16)
                    // Use rgba with explicit opacity value
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`
                  })(),
                  maxWidth: "90%",
                  // Ensure opacity is applied correctly for export
                  opacity: "1", // Keep element fully opaque, use rgba alpha instead
                }}
              >
                <h2
                  className="text-2xl font-bold mb-4 text-center"
                  style={{
                    fontFamily: cardData.fontFamily,
                    fontSize: `${cardData.fontSize * 1.1}px`, // Larger than before
                    fontStyle: cardData.fontStyle.includes("italic") ? "italic" : "normal",
                    fontWeight: "bold", // Always bold for title
                    color: cardData.textColor || "#ffffff",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)", // Stronger shadow
                    letterSpacing: "0.5px", // Slightly more spacing
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
              // No image - show text directly
              <>
                <h2
                  className="text-2xl font-bold mb-4 text-center"
                  style={{
                    fontFamily: cardData.fontFamily,
                    fontSize: `${cardData.fontSize * 1.1}px`, // Larger than before
                    fontStyle: cardData.fontStyle.includes("italic") ? "italic" : "normal",
                    fontWeight: "bold", // Always bold for title
                    color: cardData.textColor || getTextColor(cardData.backgroundColor),
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)", // Subtle shadow for contrast
                    letterSpacing: "0.5px", // Slightly more spacing
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
        </CardContent>
      </Card>
    </div>
  )
}

