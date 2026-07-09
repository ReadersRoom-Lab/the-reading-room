import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ articles: [], rooms: [], concepts: [] });
    }

    // Search Articles
    const articles = await prisma.article.findMany({
      where: {
        user_id: user.id,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        source_url: true,
        status: true,
      },
      take: 5,
    });

    // Search Rooms
    const rooms = await prisma.room.findMany({
      where: {
        user_id: user.id,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      take: 5,
    });

    // Search Concepts
    const concepts = await prisma.vaultEntry.findMany({
      where: {
        user_id: user.id,
        OR: [
          { term: { contains: query, mode: "insensitive" } },
          { definition: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        term: true,
        definition: true,
      },
      take: 5,
    });

    return NextResponse.json({
      articles,
      rooms,
      concepts,
    });
  } catch (error) {
    logger.error("Error in search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
