import "dotenv/config";
import prisma from "../lib/prisma";
import { logger } from "@/lib/logger";

async function main() {
  // Check if test user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "test@thereadingroom.com" },
  });

  if (existingUser) {
    logger.log("Test user already exists. Skipping seed.");
  } else {
    const user = await prisma.user.create({
      data: {
        clerk_id: "user_2mTESTuserID123",
        email: "test@thereadingroom.com",
        name: "Test Reader",
        tier: "free",
        rooms: {
          create: [
            {
              name: "Technology",
              description: "Tech articles and news",
              cover_color: "#818CF8",
              mode: "reading",
            },
          ],
        },
      },
    });

    logger.log(`Created test user: ${user.email}`);
  }
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
