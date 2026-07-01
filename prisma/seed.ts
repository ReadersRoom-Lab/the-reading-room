import { PrismaClient } from '../src/generated/prisma/client'
const prisma = new PrismaClient(undefined as never)

async function main() {
  // Check if test user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@thereadingroom.com' }
  })

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        clerk_id: 'user_2mTESTuserID123',
        email: 'test@thereadingroom.com',
        name: 'Test Reader',
        tier: 'free',
        rooms: {
          create: [
            {
              name: 'Technology',
              description: 'Tech articles and news',
              cover_color: '#818CF8',
              mode: 'reading',
            }
          ]
        }
      }
    })

    console.log(`Created test user: ${user.email}`)
  } else {
    console.log('Test user already exists. Skipping seed.')
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
