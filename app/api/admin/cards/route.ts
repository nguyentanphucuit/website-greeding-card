import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Note: Admin check removed - can be added back via Supabase RLS or custom logic

    const cards = await prisma.card.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(cards)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

