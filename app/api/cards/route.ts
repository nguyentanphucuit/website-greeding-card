import { NextRequest, NextResponse } from "next/server"
import { getUserCards, createCard, updateCard } from "@/lib/supabase-db"
import { createServerClient } from "@/lib/supabase-server"

const BUCKET_NAME = 'card-images'

/**
 * Upload base64 image to Supabase Storage
 */
async function uploadBase64ImageToSupabase(
  base64DataUrl: string,
  userId: string,
  cardId: string
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
    const filePath = `${userId}/${cardId}_background.${ext}`

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

export async function GET(request: NextRequest) {
  try {
    // Get userId from query parameter
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId") || searchParams.get("user_id")
    
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        message: "Please provide userId as query parameter"
      }, { status: 400 })
    }

    const cards = await getUserCards(userId)
    return NextResponse.json(cards)
  } catch (error) {
    console.error("Error fetching cards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get user_id from request body (required)
    const userId = body.userId || body.user_id
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        message: "Please provide userId in request body"
      }, { status: 400 })
    }

    // Verify user exists in database
    const { getUserById } = await import("@/lib/supabase-db")
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ 
        error: "User not found",
        message: `User with ID ${userId} does not exist in database`
      }, { status: 404 })
    }
    console.log("Card save request received:", {
      userId: userId,
      title: body.title,
      text: body.text?.substring(0, 50),
      hasBackgroundImage: !!body.backgroundImage,
      backgroundImageType: body.backgroundImage?.substring(0, 20),
      initialRequest: body.initialRequest?.substring(0, 50),
    })

    // Check if backgroundImage is a base64 data URL, upload to Supabase if needed
    let backgroundImageUrl = body.backgroundImage || null
    if (backgroundImageUrl && backgroundImageUrl.startsWith('data:')) {
      // Create card first to get cardId
      const tempCard = await createCard({
        user_id: userId,
        title: body.title || "Untitled Card",
        text: body.text || "",
        font_size: body.fontSize || 24,
        font_family: body.fontFamily || "Arial",
        font_style: body.fontStyle || "normal",
        background_color: body.backgroundColor || "#ffffff",
        background_image: null, // Will update after upload
        text_color: body.textColor || "#000000",
        text_container_background: body.textContainerBackground || "rgba(255, 255, 255, 0.8)",
        text_container_opacity: body.textContainerOpacity || 0.8,
        initial_request: body.initialRequest || null,
      })

      if (!tempCard) {
        console.error("Failed to create temp card - check database connection and RLS policies")
        return NextResponse.json({ 
          error: "Failed to create card",
          message: "Could not create card in database. Please check your connection and try again."
        }, { status: 500 })
      }

      // Upload base64 image to Supabase
      const uploadedUrl = await uploadBase64ImageToSupabase(
        backgroundImageUrl,
        userId,
        tempCard.id
      )

      if (uploadedUrl) {
        backgroundImageUrl = uploadedUrl
        // Update card with Supabase URL and ensure initial_request is saved
        const updatedCard = await updateCard(tempCard.id, {
          background_image: uploadedUrl,
          initial_request: body.initialRequest || null, // Ensure prompt is saved
        })
        if (!updatedCard) {
          console.error("Failed to update card after image upload")
          return NextResponse.json({ 
            error: "Failed to update card",
            message: "Card created but failed to update with image URL"
          }, { status: 500 })
        }
        return NextResponse.json(updatedCard)
      } else {
        // If upload fails, keep base64 URL and ensure initial_request is saved
        const updatedCard = await updateCard(tempCard.id, {
          background_image: backgroundImageUrl,
          initial_request: body.initialRequest || null, // Ensure prompt is saved
        })
        if (!updatedCard) {
          console.error("Failed to update card with base64 image")
          return NextResponse.json({ 
            error: "Failed to update card",
            message: "Card created but failed to update with image URL"
          }, { status: 500 })
        }
        return NextResponse.json(updatedCard)
      }
    }

    // If not base64, create card normally
    const card = await createCard({
      user_id: userId,
      title: body.title || "Untitled Card",
      text: body.text || "",
      font_size: body.fontSize || 24,
      font_family: body.fontFamily || "Arial",
      font_style: body.fontStyle || "normal",
      background_color: body.backgroundColor || "#ffffff",
      background_image: backgroundImageUrl,
      text_color: body.textColor || "#000000",
      text_container_background: body.textContainerBackground || "rgba(255, 255, 255, 0.8)",
      text_container_opacity: body.textContainerOpacity || 0.8,
      initial_request: body.initialRequest || null,
    })

    if (!card) {
      console.error("Failed to create card - check database connection and RLS policies")
      return NextResponse.json({ 
        error: "Failed to create card",
        message: "Could not create card in database. Please check your connection and try again."
      }, { status: 500 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error creating card:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Log detailed error for debugging
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    })
    
    return NextResponse.json({ 
      error: "Internal server error",
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}

