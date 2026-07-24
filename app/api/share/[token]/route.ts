import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Share token required" }, { status: 400 });
    }

    // 1. Check if token belongs to an Article
    const article = await prisma.article.findUnique({
      where: { share_token: token },
      include: {
        highlights: {
          select: {
            id: true,
            content: true,
            colour: true,
            note: true,
            annotation_type: true,
            position_start: true,
            position_end: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (article) {
      return NextResponse.json({
        type: "article",
        data: {
          id: article.id,
          title: article.title,
          author: article.author,
          source_url: article.source_url,
          source_type: article.source_type,
          content: article.content,
          cover_image: article.cover_image,
          file_url: article.file_url,
          read_time_minutes: article.read_time_minutes,
          word_count: article.word_count,
          default_share_mode: article.default_share_mode,
          owner: article.user.name || "A ReadrSpace User",
          created_at: article.created_at,
          highlights: article.highlights,
        },
      });
    }

    // 2. Check if token belongs to a Room
    const room = await prisma.room.findUnique({
      where: { share_token: token },
      include: {
        user: {
          select: { name: true },
        },
        articles: {
          select: {
            id: true,
            title: true,
            author: true,
            source_url: true,
            cover_image: true,
            read_time_minutes: true,
            reading_progress: true,
            status: true,
            created_at: true,
          },
        },
      },
    });

    if (room) {
      return NextResponse.json({
        type: "room",
        data: {
          id: room.id,
          name: room.name,
          description: room.description,
          cover_color: room.cover_color,
          owner: room.user.name || "A ReadrSpace User",
          articles: room.articles,
        },
      });
    }

    // 3. Check if token belongs to a User Library
    const user = await prisma.user.findUnique({
      where: { library_share_token: token },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            author: true,
            source_url: true,
            cover_image: true,
            read_time_minutes: true,
            reading_progress: true,
            status: true,
            created_at: true,
          },
          orderBy: { updated_at: "desc" },
        },
      },
    });

    if (user) {
      return NextResponse.json({
        type: "library",
        data: {
          owner: user.name || "A ReadrSpace User",
          articles: user.articles,
        },
      });
    }

    return NextResponse.json({ error: "Share token not found or expired" }, { status: 404 });
  } catch (error) {
    logger.error("Error resolving share token:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
