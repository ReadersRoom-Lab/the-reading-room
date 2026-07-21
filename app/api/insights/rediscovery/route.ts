import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { secureRandom } from "@/lib/utils";
import { subDays } from "date-fns";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get("excludeId");

    const thirtyDaysAgo = subDays(new Date(), 30);

    // Try fetching vault entries older than 30 days first (Spaced repetition)
    let vaultEntries = await prisma.vaultEntry.findMany({
      where: {
        user_id: user.id,
        created_at: { lte: thirtyDaysAgo },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: {
        vaultTrails: {
          include: {
            article: { select: { id: true, title: true } },
          },
        },
      },
    });

    // Fallback: If no entries > 30 days old exist, fetch all user vault entries
    if (vaultEntries.length === 0) {
      vaultEntries = await prisma.vaultEntry.findMany({
        where: {
          user_id: user.id,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        include: {
          vaultTrails: {
            include: {
              article: { select: { id: true, title: true } },
            },
          },
        },
      });
    }

    // Also fetch highlights
    let highlights = await prisma.highlight.findMany({
      where: {
        user_id: user.id,
        created_at: { lte: thirtyDaysAgo },
      },
      include: {
        article: { select: { id: true, title: true } },
      },
    });

    if (highlights.length === 0) {
      highlights = await prisma.highlight.findMany({
        where: { user_id: user.id },
        include: {
          article: { select: { id: true, title: true } },
        },
      });
    }

    if (vaultEntries.length === 0 && highlights.length === 0) {
      return NextResponse.json({ item: null });
    }

    // Pick a random memory item
    const items: Array<{
      id: string;
      type: "vault" | "highlight";
      termOrText: string;
      definitionOrNote: string;
      pronunciation?: string | null;
      etymology?: string | null;
      articleTitle?: string;
      articleId?: string;
      created_at: Date;
      user_note?: string | null;
    }> = [];

    vaultEntries.forEach((entry) => {
      items.push({
        id: entry.id,
        type: "vault",
        termOrText: entry.term,
        definitionOrNote: entry.definition,
        pronunciation: entry.pronunciation,
        etymology: entry.etymology,
        articleTitle: entry.vaultTrails[0]?.article?.title,
        articleId: entry.vaultTrails[0]?.article?.id,
        created_at: entry.created_at,
        user_note: entry.user_note,
      });
    });

    highlights.forEach((hl) => {
      items.push({
        id: hl.id,
        type: "highlight",
        termOrText: hl.content,
        definitionOrNote: hl.note || "Highlighted Passage",
        articleTitle: hl.article.title,
        articleId: hl.article.id,
        created_at: hl.created_at,
        user_note: hl.note,
      });
    });

    const randomIndex = Math.floor(secureRandom() * items.length);
    const selectedItem = items[randomIndex];

    return NextResponse.json({ item: selectedItem });
  } catch (error) {
    console.error("Error fetching rediscovery item:", error);
    return NextResponse.json({ error: "Failed to fetch rediscovery item" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

    const { id, type, user_note } = await request.json();

    if (!id || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "vault") {
      const updated = await prisma.vaultEntry.updateMany({
        where: { id, user_id: user.id },
        data: { user_note },
      });
      return NextResponse.json({ success: true, count: updated.count });
    } else {
      const updated = await prisma.highlight.updateMany({
        where: { id, user_id: user.id },
        data: { note: user_note },
      });
      return NextResponse.json({ success: true, count: updated.count });
    }
  } catch (error) {
    console.error("Error updating rediscovery note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}
