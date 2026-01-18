import { NextRequest, NextResponse } from "next/server"
import { getCardById, updateCard, deleteCard } from "@/lib/supabase-db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get userId from query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const card = await getCardById(id)

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    // If userId is provided, verify ownership
    if (userId && card.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden", message: "User does not own this card." }, { status: 403 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error fetching card:", error)
    return NextResponse.json({ error: "Internal server error", message: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    // Get userId from request body
    const userId = body.userId || body.user_id
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        message: "Please provide userId in request body"
      }, { status: 400 })
    }

    // Verify card exists
    const card = await getCardById(id)
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    // Verify ownership
    if (card.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if backgroundImage is a base64 data URL, upload to Supabase if needed
    let backgroundImageUrl = body.backgroundImage || card.background_image
    if (backgroundImageUrl && backgroundImageUrl.startsWith('data:')) {
      // Import upload function
      const { createServerClient } = await import("@/lib/supabase-server")
      const BUCKET_NAME = 'card-images'
      
      const supabase = createServerClient()
      if (supabase) {
        try {
          const matches = backgroundImageUrl.match(/^data:([^;]+);base64,(.+)$/)
          if (matches) {
            const mimeType = matches[1]
            const base64Data = matches[2]
            const buffer = Buffer.from(base64Data, 'base64')
            const ext = mimeType.split('/')[1] || 'png'
            const filePath = `${userId}/${id}_background.${ext}`

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(filePath, buffer, {
                upsert: true,
                contentType: mimeType,
              })

            if (!uploadError && uploadData) {
              const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath)
              backgroundImageUrl = urlData.publicUrl
            }
          }
        } catch (uploadErr) {
          console.error("Error uploading image on update:", uploadErr)
          // Continue with base64 if upload fails
        }
      }
    }

    const updatedCard = await updateCard(id, {
      title: body.title,
      text: body.text,
      font_size: body.fontSize,
      font_family: body.fontFamily,
      font_style: body.fontStyle,
      background_color: body.backgroundColor,
      background_image: backgroundImageUrl,
      text_color: body.textColor,
      text_container_background: body.textContainerBackground,
      text_container_opacity: body.textContainerOpacity,
      initial_request: body.initialRequest || card.initial_request,
    })

    if (!updatedCard) {
      return NextResponse.json({ error: "Failed to update card" }, { status: 500 })
    }

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error("Error updating card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get userId from request body
    let userId: string | undefined
    try {
      const body = await request.json()
      userId = body.userId || body.user_id
    } catch {
      // If body is empty or not JSON, try query params
      const { searchParams } = new URL(request.url)
      userId = searchParams.get('userId') || undefined
    }

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        message: "Please provide userId in request body or query parameters"
      }, { status: 400 })
    }

    const card = await getCardById(id)

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    if (card.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden", message: "User does not own this card." }, { status: 403 })
    }

    const success = await deleteCard(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete card" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting card:", error)
    return NextResponse.json({ error: "Internal server error", message: (error as Error).message }, { status: 500 })
  }
}

