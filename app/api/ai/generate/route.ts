import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { getUser } from "@/lib/supabase-auth"
import { createServerClient } from "@/lib/supabase-server"

const BUCKET_NAME = 'card-images'

/**
 * Upload base64 image to Supabase Storage
 */
async function uploadBase64ImageToSupabase(
  base64DataUrl: string,
  userId: string,
  fileName: string
): Promise<string | null> {
  try {
    const supabase = createServerClient()
    if (!supabase) {
      console.error("Supabase client not initialized")
      return null
    }

    // Extract base64 data and mime type from data URL
    // Format: data:image/png;base64,iVBORw0KG...
    const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      console.error("Invalid base64 data URL format")
      return null
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Determine file extension from mime type
    const ext = mimeType.split('/')[1] || 'png'
    const filePath = `${userId}/generated_${fileName}.${ext}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        upsert: true,
        contentType: mimeType,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    console.log(`✅ Image uploaded to Supabase: ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading image to Supabase:', error)
    return null
  }
}

interface ImagePart {
  text?: string
  inlineData?: {
    data: string
    mimeType?: string
  }
}

interface ImageCandidate {
  content?: {
    parts?: ImagePart[]
  }
}

interface ImageResponse {
  candidates?: ImageCandidate[]
  text?: string | (() => string)
}

export async function POST(request: NextRequest) {
  try {
    const { userRequest, mode, selectedPrompt } = await request.json()

    if (!userRequest || !userRequest.trim()) {
      return NextResponse.json(
        { error: "User request is required" },
        { status: 400 }
      )
    }

    // Mode: "prompts" - generate 3 prompt options only (no image generation)
    if (mode === "prompts") {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY
      if (!GEMINI_API_KEY) {
        return NextResponse.json(
          { error: "Gemini API key is not configured" },
          { status: 500 }
        )
      }

      const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
      })

      const promptsPrompt = `Based on this user request: "${userRequest}"

Generate 3 different, creative, and detailed prompts for creating greeting card background images. Each prompt should:
- Be unique and offer a different visual style (e.g., minimalist, luxurious, cute, modern, classic)
- Include specific design elements, colors, materials/textures, lighting, and mood
- Be detailed enough for AI image generation (include style, colors, composition, mood)
- Be suitable for a greeting card background (LANDSCAPE A5 ratio ~1.414:1, clear negative space reserved for text)
- No text, no letters, no numbers, no watermark, no logo
- Print-ready look (clean edges, subtle grain, avoid clutter, high-quality)

Format your response as JSON array:
{
  "prompts": [
    "First detailed prompt here...",
    "Second detailed prompt here...",
    "Third detailed prompt here..."
  ]
}`


      console.log("Generating 3 prompt options...")
      const promptsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptsPrompt,
      })

      let promptsData = {
        prompts: [
          `Create a beautiful, high-quality greeting card background image based on: "${userRequest}". Modern, elegant style with harmonious colors, clean design, joyful mood, high resolution, 800x600 pixels, horizontal orientation, space for text overlay.`,
          `Design a stunning greeting card background for: "${userRequest}". Professional greeting card style with vibrant color palette, decorative elements, warm and inviting atmosphere, sharp details, landscape orientation, text area in center.`,
          `Generate an attractive greeting card background inspired by: "${userRequest}". Contemporary design with complementary colors, subtle patterns, celebratory mood, high-quality rendering, horizontal format, clear center area for text.`
        ]
      }

      try {
        let textContent: string
        if (typeof promptsResponse === 'string') {
          textContent = promptsResponse
        } else if (promptsResponse && 'text' in promptsResponse) {
          const textValue = (promptsResponse as { text?: string | (() => string) }).text
          if (typeof textValue === 'string') {
            textContent = textValue
          } else if (typeof textValue === 'function') {
            textContent = textValue()
          } else {
            textContent = String(textValue || promptsResponse)
          }
        } else {
          textContent = JSON.stringify(promptsResponse)
        }

        const jsonMatch = textContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.prompts && Array.isArray(parsed.prompts) && parsed.prompts.length >= 3) {
            promptsData = parsed
          }
        }
      } catch (error) {
        console.error("Error parsing prompts response:", error)
      }

      return NextResponse.json({
        prompts: promptsData.prompts.slice(0, 3)
      })
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables")
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      )
    }

    console.log("Using Gemini API key:", GEMINI_API_KEY.substring(0, 10) + "...")

    // Initialize GoogleGenAI - API key is read from GEMINI_API_KEY env variable
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY
    })

    // Generate text content using the new API
    const textPrompt = `Create a greeting card based on this request: "${userRequest}"

Please provide:
1. A title for the greeting card (short, 1-5 words)
2. A message/text for the greeting card (2-3 sentences, warm and appropriate)

Format your response as JSON:
{
  "title": "title here",
  "text": "message text here"
}`

    console.log("Generating text content...")
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: textPrompt,
    })
    
    console.log("Text response type:", typeof textResponse)
    console.log("Text response keys:", Object.keys(textResponse || {}))
    
    let textData = { title: "Greetings!", text: "Wishing you all the best!" }

    try {
      // Handle different response structures
      let textContent: string
      if (typeof textResponse === 'string') {
        textContent = textResponse
      } else if (textResponse && 'text' in textResponse) {
        // text is a getter property, not a method
        const textValue = (textResponse as { text?: string | (() => string) }).text
        if (typeof textValue === 'string') {
          textContent = textValue
        } else if (typeof textValue === 'function') {
          textContent = textValue()
        } else {
          textContent = String(textValue || textResponse)
        }
      } else {
        textContent = JSON.stringify(textResponse)
      }
      
      console.log("Extracted text content:", textContent.substring(0, 100))
      
      // Try to extract JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        textData = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: parse the text manually
        const lines = textContent.split("\n").filter(l => l.trim())
        if (lines.length > 0) {
          textData.title = lines[0].replace(/^[0-9.]+\s*/, "").trim() || textData.title
        }
        if (lines.length > 1) {
          textData.text = lines.slice(1).join(" ").trim() || textData.text
        }
      }
    } catch (error) {
      console.error("Error parsing text response:", error)
    }

    // Generate image directly using Gemini image generation model
    // Use selectedPrompt if provided (from mode="generate"), otherwise use userRequest
    const imageRequestText = selectedPrompt || userRequest
    
    // Create a detailed prompt with specific color and style requirements
    const imagePrompt = selectedPrompt || `Create a beautiful, high-quality greeting card background image based on this request: "${userRequest}". 

REQUIREMENTS:
- Dimensions: 800x600 pixels, horizontal/landscape orientation
- Style: Modern, elegant, professional greeting card design
- Colors: Use a harmonious, vibrant color palette that matches the occasion. For birthday: warm colors like pink, yellow, orange, or pastel tones. For celebrations: festive and bright colors. Avoid dull or muddy colors.
- Design: Clean background with decorative elements, patterns, or subtle illustrations that complement the theme
- Mood: Joyful, celebratory, warm, and inviting
- Quality: High resolution, sharp details, professional appearance
- Text area: Leave center area relatively clear/light for text overlay
- No text or words in the image (background only)

Make it visually stunning with beautiful, complementary colors that will make text stand out clearly.`

    console.log("Generating image with Gemini...")
    let imageUrl: string | null = null
    let imageDescription: string = ""
    
    // Helper function to get fallback image URL.
    // Uses Pollinations.ai — free AI image generation, no API key required.
    // (The old source.unsplash.com endpoint was shut down by Unsplash in 2024.)
    const getFallbackImageUrl = () => {
      const fallbackPrompt = (selectedPrompt || imagePrompt).slice(0, 500)
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=800&height=600&nologo=true`
    }
    
    // Try different methods for image generation
    // Method 1: Try Imagen 4.0 (imagen-4.0-generate-001) - Google's text-to-image model
    // Method 2: Try chat API with gemini-3-pro-image-preview
    // Method 3: Try direct model calls with various model names
    // Method 4: Fallback to Unsplash
    
    let imageResponse = null
    const triedMethods: string[] = []
    
    // Use gemini-2.5-flash-image (Nano Banana) — the only image generation model
    // with a free tier. Imagen 4.x and gemini-3-pro-image are paid-only, so we
    // don't call them when running on a free API key.
    // NOTE: responseModalities must include 'IMAGE' or the model returns text only.
    const imageModels = [
      "gemini-2.5-flash-image",
      "gemini-2.5-flash-image-preview",
      "gemini-2.0-flash-preview-image-generation",
    ]

    for (const modelName of imageModels) {
      try {
        console.log(`Trying image model: ${modelName}`)
        triedMethods.push(`model:${modelName}`)
        imageResponse = await ai.models.generateContent({
          model: modelName,
          contents: imagePrompt,
          config: {
            responseModalities: ['IMAGE'],
          },
        })
        console.log(`✅ Successfully called model: ${modelName}`)
        break // Success, exit loop
      } catch (modelError) {
        const errorMsg = modelError instanceof Error ? modelError.message : String(modelError)
        console.log(`❌ Model ${modelName} failed:`, errorMsg.includes("quota") ? "Quota exceeded" : errorMsg.substring(0, 120))
        imageResponse = null
        continue
      }
    }
    
    if (imageResponse) {
      try {
      
        console.log("Image response received, checking for image data...")
        
        // Check if response has candidates with image data
        const responseWithCandidates = imageResponse as ImageResponse
      if (responseWithCandidates && responseWithCandidates.candidates && Array.isArray(responseWithCandidates.candidates)) {
        const candidates = responseWithCandidates.candidates
        if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.text) {
              imageDescription = part.text
              console.log("Image description:", imageDescription.substring(0, 100))
            } else if (part.inlineData) {
              // Image data is in base64 format
              const imageData = part.inlineData.data
              const mimeType = part.inlineData.mimeType || "image/png"
              
              // Convert base64 to data URL for direct display (will be uploaded to Supabase when saved)
              imageUrl = `data:${mimeType};base64,${imageData}`
              console.log("Image generated successfully, size:", imageData.length, "bytes")
              break
            }
          }
          }
        }
        
        // Fallback: if no image data, try to get text description
        if (!imageUrl && !imageDescription) {
          if (responseWithCandidates.text) {
            const textValue = responseWithCandidates.text
            imageDescription = typeof textValue === 'string' 
              ? textValue 
              : typeof textValue === 'function'
              ? textValue()
              : String(textValue)
          }
        }
      } catch (parseError) {
        console.error("Error parsing image response:", parseError)
      }
    }
    
    // If still no image, use fallback Unsplash
    if (!imageUrl) {
      if (triedMethods.length > 0) {
        console.log(`All image generation methods failed (tried: ${triedMethods.join(", ")}), using Unsplash fallback`)
        console.log("Note: Image generation models may require paid tier. Using Unsplash as free alternative.")
      } else {
        console.log("No image generation methods available, using Unsplash fallback")
      }
      imageUrl = getFallbackImageUrl()
      console.log("Using fallback image URL:", imageUrl)
    }

    // Determine appropriate background color based on request and image
    let suggestedBackgroundColor = "#fafafa" // Very light gray (almost white) - works well with images
    const lowerRequest = userRequest.toLowerCase()
    
    // Extract color preferences from request
    if (lowerRequest.includes("birthday") || lowerRequest.includes("sinh nhật")) {
      suggestedBackgroundColor = "#fff5e6" // Warm cream
    } else if (lowerRequest.includes("wedding") || lowerRequest.includes("cưới")) {
      suggestedBackgroundColor = "#faf5ff" // Soft lavender
    } else if (lowerRequest.includes("christmas") || lowerRequest.includes("giáng sinh")) {
      suggestedBackgroundColor = "#fff5f5" // Soft red tint
    } else if (lowerRequest.includes("thank") || lowerRequest.includes("cảm ơn")) {
      suggestedBackgroundColor = "#f0f9ff" // Soft blue
    } else if (lowerRequest.includes("red") || lowerRequest.includes("đỏ")) {
      suggestedBackgroundColor = "#fff5f5"
    } else if (lowerRequest.includes("blue") || lowerRequest.includes("xanh dương")) {
      suggestedBackgroundColor = "#f0f9ff"
    } else if (lowerRequest.includes("pink") || lowerRequest.includes("hồng")) {
      suggestedBackgroundColor = "#fff0f5"
    } else if (lowerRequest.includes("yellow") || lowerRequest.includes("vàng")) {
      suggestedBackgroundColor = "#fffef0"
    } else if (lowerRequest.includes("green") || lowerRequest.includes("xanh lá")) {
      suggestedBackgroundColor = "#f0fff4"
    }
    
    // If we have an image, use a very light/neutral background color so image shows through beautifully
    if (imageUrl) {
      suggestedBackgroundColor = "#fafafa" // Very light gray, almost white - complements most images
    }

    return NextResponse.json({
      title: textData.title || "Greetings!",
      text: textData.text || "Wishing you all the best!",
      imageDescription: imageDescription,
      imageUrl: imageUrl,
      suggestedBackgroundColor: suggestedBackgroundColor, // Add suggested color that matches the theme
    })
  } catch (error: unknown) {
    console.error("Gemini API error:", error)
    
    // Extract error information safely
    const errorObj = error instanceof Error ? error : new Error(String(error))
    const errorMessage = errorObj.message || "Unknown error"
    const errorName = errorObj.name || "Error"
    const errorStack = errorObj.stack
    
    if (errorStack) {
      console.error("Error stack:", errorStack)
    }
    
    // Check if it's a model not found error
    const isModelError = errorMessage.includes("not found") || errorMessage.includes("not supported")
    
    let details = errorMessage
    if (isModelError) {
      details = `${errorMessage}\n\nPossible solutions:\n1. Check that your Gemini API key has access to the requested model\n2. Enable the Gemini API in Google Cloud Console\n3. Verify your API key has the necessary permissions\n4. Try using a different model name like 'gemini-1.5-flash' or 'gemini-1.5-pro'`
    }
    
    return NextResponse.json(
      { 
        error: "Failed to generate content",
        details: details,
        type: errorName
      },
      { status: 500 }
    )
  }
}

