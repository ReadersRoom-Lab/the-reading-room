import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
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

    const {
      term,
      definition,
      passage,
      article_id,
      room_id,
      type,
      user_note,
      etymology,
      pronunciation,
      example_sentence,
    } = await req.json();

    if (!term || !article_id || !passage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if vault entry already exists for this term and user
    let vaultEntry = await prisma.vaultEntry.findFirst({
      where: {
        user_id: user.id,
        term: { equals: term, mode: "insensitive" },
      },
    });

    if (vaultEntry) {
      // Enrich existing record with new details if they are currently missing
      if (!vaultEntry.etymology || !vaultEntry.pronunciation || !vaultEntry.example_sentence) {
        vaultEntry = await prisma.vaultEntry.update({
          where: { id: vaultEntry.id },
          data: {
            etymology: vaultEntry.etymology || etymology || null,
            pronunciation: vaultEntry.pronunciation || pronunciation || null,
            example_sentence: vaultEntry.example_sentence || example_sentence || null,
          },
        });
      }
    } else {
      vaultEntry = await prisma.vaultEntry.create({
        data: {
          user_id: user.id,
          term,
          type: type || "concept",
          definition: definition || "",
          user_note,
          etymology: etymology || null,
          pronunciation: pronunciation || null,
          example_sentence: example_sentence || null,
        },
      });
    }

    // Create the trail
    const trail = await prisma.vaultTrail.create({
      data: {
        vault_entry_id: vaultEntry.id,
        article_id,
        room_id,
        passage,
      },
    });

    return NextResponse.json({ vaultEntry, trail }, { status: 201 });
  } catch (error) {
    logger.error("Error creating vault entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    const vaultEntries = await prisma.vaultEntry.findMany({
      where: { user_id: user.id },
      include: {
        vaultTrails: {
          include: {
            article: true,
            room: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(vaultEntries, { status: 200 });
  } catch (error) {
    logger.error("Error fetching vault entries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    // Verify ownership
    const vaultEntry = await prisma.vaultEntry.findUnique({
      where: { id },
    });

    if (!vaultEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (vaultEntry.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the vault entry (cascading delete in schema.prisma ensures vaultTrails are also deleted)
    await prisma.vaultEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Error deleting vault entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
