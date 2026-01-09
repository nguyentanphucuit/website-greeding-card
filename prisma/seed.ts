import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create test user if it doesn't exist
  const testEmail = "test@example.com"
  const testUsername = "testuser"
  const testPassword = "123456"

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: testEmail },
        { username: testUsername }
      ]
    }
  })

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    await prisma.user.create({
      data: {
        email: testEmail,
        username: testUsername,
        password: hashedPassword,
        name: "Test User",
        role: "user",
        plan: "free",
      },
    })
    console.log("✅ Test user created!")
    console.log(`   Email: ${testEmail}`)
    console.log(`   Username: ${testUsername}`)
    console.log(`   Password: ${testPassword}`)
  } else {
    console.log("ℹ️  Test user already exists")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

