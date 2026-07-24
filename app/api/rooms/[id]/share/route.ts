import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

function generateShareToken(): string {
  return "room_" + crypto.randomUUID().replaceAll("-", "");
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

    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room || room.user_id !== user.id) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    let token = room.share_token;
    if (!token) {
      token = generateShareToken();
    }

    const updated = await prisma.room.update({
      where: { id: room.id },
      data: {
        share_token: token,
      },
    });

    return NextResponse.json({
      share_token: updated.share_token,
      share_url: `/share/${updated.share_token}`,
    });
  } catch (error) {
    logger.error("Error creating room share link:", error);
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

    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room || room.user_id !== user.id) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    await prisma.room.update({
      where: { id: room.id },
      data: {
        share_token: null,
      },
    });

    return NextResponse.json({ message: "Share token revoked" });
  } catch (error) {
    logger.error("Error revoking room share link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
