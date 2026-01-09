import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
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
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

