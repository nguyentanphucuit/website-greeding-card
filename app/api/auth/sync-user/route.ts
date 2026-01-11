import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name, image } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Upsert user to database
    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email: email || undefined,
        name: name || undefined,
        image: image || undefined,
      },
      create: {
        id,
        email: email || null,
        name: name || null,
        image: image || null,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


