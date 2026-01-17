import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-auth"
import { getUserCards, createCard, syncUser } from "@/lib/supabase-db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cards = await getUserCards(user.id)
    return NextResponse.json(cards)
  } catch (error) {
    console.error("Error fetching cards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user exists in database
    await syncUser({
      id: user.id,
      email: user.email || null,
      name: user.user_metadata?.name || null,
      image: user.user_metadata?.avatar_url || null,
    })

    const body = await request.json()

    const card = await createCard({
      user_id: user.id,
      title: body.title || "Untitled Card",
      text: body.text || "",
      font_size: body.fontSize || 24,
      font_family: body.fontFamily || "Arial",
      font_style: body.fontStyle || "normal",
      background_color: body.backgroundColor || "#ffffff",
      background_image: body.backgroundImage || null,
      text_color: body.textColor || "#000000",
      text_container_background: body.textContainerBackground || "rgba(255, 255, 255, 0.8)",
      text_container_opacity: body.textContainerOpacity || 0.8,
      initial_request: body.initialRequest || null,
    })

    if (!card) {
      return NextResponse.json({ error: "Failed to create card" }, { status: 500 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

