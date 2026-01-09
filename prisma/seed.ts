import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Note: Users are now managed by Supabase Auth
  // This seed file is kept for reference but users should be created via Supabase Auth
  console.log("ℹ️  Users are managed by Supabase Auth. No seed data needed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
