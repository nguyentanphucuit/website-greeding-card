import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const cards = await prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(cards)
  } catch (error) {
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
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email || undefined,
        name: user.user_metadata?.name || undefined,
        image: user.user_metadata?.avatar_url || undefined,
      },
      create: {
        id: user.id,
        email: user.email || null,
        name: user.user_metadata?.name || null,
        image: user.user_metadata?.avatar_url || null,
      },
    })

    const userId = user.id
    const body = await request.json()

    const card = await prisma.card.create({
      data: {
        userId,
        title: body.title || "Untitled Card",
        text: body.text || "",
        fontSize: body.fontSize || 24,
        fontFamily: body.fontFamily || "Arial",
        fontStyle: body.fontStyle || "normal",
        backgroundColor: body.backgroundColor || "#ffffff",
        backgroundImage: body.backgroundImage || null,
        imageUrl: body.imageUrl || null,
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

