import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

function generateShareToken(): string {
  return "lib_" + crypto.randomUUID().replaceAll("-", "");
}

export async function POST() {
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

    let token = user.library_share_token;
    if (!token) {
      token = generateShareToken();
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        library_share_token: token,
      },
    });

    return NextResponse.json({
      share_token: updated.library_share_token,
      share_url: `/share/${updated.library_share_token}`,
    });
  } catch (error) {
    logger.error("Error creating library share link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        library_share_token: null,
      },
    });

    return NextResponse.json({ message: "Library share token revoked" });
  } catch (error) {
    logger.error("Error revoking library share link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
