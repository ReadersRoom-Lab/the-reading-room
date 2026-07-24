import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const sourceArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!sourceArticle || sourceArticle.user_id !== user.id) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const targetRoomId = body.roomId !== undefined ? body.roomId : sourceArticle.room_id;

    const duplicatedArticle = await prisma.article.create({
      data: {
        user_id: user.id,
        room_id: targetRoomId,
        title: `Copy of ${sourceArticle.title}`,
        author: sourceArticle.author,
        source_url: sourceArticle.source_url,
        source_type: sourceArticle.source_type,
        content: sourceArticle.content,
        cover_image: sourceArticle.cover_image,
        file_url: sourceArticle.file_url,
        reading_progress: 0,
        status: "unread",
        word_count: sourceArticle.word_count,
        read_time_minutes: sourceArticle.read_time_minutes,
        tags: sourceArticle.tags,
      } as Prisma.ArticleUncheckedCreateInput,
    });

    return NextResponse.json(duplicatedArticle, { status: 201 });
  } catch (error) {
    logger.error("Error duplicating article:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
