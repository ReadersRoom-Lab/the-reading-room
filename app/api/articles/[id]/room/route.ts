import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { roomId } = await req.json();

    // Validate if the room belongs to the user (if roomId is provided)
    if (roomId) {
      const room = await prisma.room.findUnique({
        where: { id: roomId, user_id: user.id },
      });

      if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
    }

    const article = await prisma.article.update({
      where: {
        id: id,
        user_id: user.id,
      },
      data: {
        room_id: roomId || null,
      },
    });

    revalidatePath("/", "layout");
    return NextResponse.json(article);
  } catch (error) {
    logger.error("Error updating article room:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
