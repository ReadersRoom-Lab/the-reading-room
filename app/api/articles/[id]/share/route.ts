import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

function generateShareToken(): string {
  return "art_" + crypto.randomUUID().replaceAll("-", "");
}

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

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article || article.user_id !== user.id) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "native" ? "native" : "reader";

    let token = article.share_token;
    if (!token) {
      token = generateShareToken();
    }

    const updated = await prisma.article.update({
      where: { id: article.id },
      data: {
        share_token: token,
        default_share_mode: mode,
      },
    });

    return NextResponse.json({
      share_token: updated.share_token,
      default_share_mode: updated.default_share_mode,
      share_url: `/share/${updated.share_token}?view=${updated.default_share_mode}`,
    });
  } catch (error) {
    logger.error("Error creating article share link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article || article.user_id !== user.id) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await prisma.article.update({
      where: { id: article.id },
      data: {
        share_token: null,
      },
    });

    return NextResponse.json({ message: "Share token revoked" });
  } catch (error) {
    logger.error("Error revoking article share link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
