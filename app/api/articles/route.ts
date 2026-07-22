import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const articles = await prisma.article.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        user_id: true,
        room_id: true,
        title: true,
        author: true,
        source_url: true,
        source_type: true,
        cover_image: true,
        reading_progress: true,
        status: true,
        word_count: true,
        read_time_minutes: true,
        date_accessed: true,
        created_at: true,
        updated_at: true,
        room: true,
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    logger.error("Error fetching articles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
