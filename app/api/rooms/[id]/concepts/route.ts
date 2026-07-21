import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { logger } from "@/lib/logger";

// GET /api/rooms/[id]/concepts — fetch persisted concepts for a room
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerk_id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const room = await prisma.room.findUnique({
      where: { id: roomId, user_id: user.id },
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const concepts = await prisma.roomConcept.findMany({
      where: { room_id: roomId },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json({ concepts, roomName: room.name });
  } catch (error) {
    logger.error("Error fetching room concepts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Zod schema for a single concept — gives us free validation + type inference
const ConceptSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(10).max(300),
  explanation: z.string().min(50),
});

const ConceptsArraySchema = z.object({
  concepts: z.array(ConceptSchema).min(3).max(10),
});

// POST /api/rooms/[id]/concepts — generate & persist concepts via Gemini
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerk_id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch room with articles — verify ownership
    const room = await prisma.room.findUnique({
      where: { id: roomId, user_id: user.id },
      include: {
        articles: {
          select: { id: true, title: true, content: true },
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.articles.length === 0) {
      return NextResponse.json({ error: "This room has no articles to analyse." }, { status: 400 });
    }

    // Budget: ~6 000 chars per article, hard cap total at 40 000 chars
    // to avoid token overflow on very large rooms.
    const MAX_CHARS_PER_ARTICLE = 6000;
    const MAX_TOTAL_CHARS = 40000;

    let totalChars = 0;
    const articleSnippets: string[] = [];

    for (const [i, article] of room.articles.entries()) {
      const remaining = MAX_TOTAL_CHARS - totalChars;
      if (remaining <= 0) break;

      const snippet = article.content.slice(0, Math.min(MAX_CHARS_PER_ARTICLE, remaining));
      totalChars += snippet.length;

      articleSnippets.push(`### Article ${i + 1}: "${article.title}"\n\n${snippet}`);
    }

    const articleContext = articleSnippets.join("\n\n---\n\n");
    const articleCount = articleSnippets.length;
    let conceptCount: string;
    if (articleCount === 1) {
      conceptCount = "5 to 6";
    } else if (articleCount <= 3) {
      conceptCount = "5 to 7";
    } else {
      conceptCount = "6 to 9";
    }

    const prompt = `You are a brilliant academic tutor specialising in knowledge synthesis and interdisciplinary thinking.

A reader has saved ${articleCount} article(s) in a reading room called "${room.name}". Your job is to extract the core concepts they must truly understand — not just surface facts, but the ideas that give these articles intellectual coherence and lasting insight.

---

${articleContext}

---

TASK  
Identify ${conceptCount} key concepts from the material above.

CONCEPT QUALITY GUIDELINES  
- Concepts must be *grounded* in the article content — no hallucinated ideas.  
- Prioritise concepts that recur across multiple articles or that unlock understanding of others.  
- Prefer ideas over facts: "Why X happens" beats "X happened".  
- If only one article is present, still find concepts of genuine intellectual depth.

PER-CONCEPT RULES  
- "title": A clear, 2–7 word label (e.g. "Cognitive Load Theory", "The Streetlight Effect").  
- "summary": One or two sentences (≤ 40 words). Write it as an insight — something worth bookmarking on its own.  
- "explanation": 3–5 paragraphs. Open each paragraph with a strong topic sentence. Build from intuition → mechanism → implication. Use vivid analogies for abstract ideas. No unexplained jargon — always define technical terms inline.

Separate paragraphs in "explanation" with two newline characters (\n\n). Return only valid JSON with no extra prose.`;

    const { output: generated } = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({ schema: ConceptsArraySchema }),
      prompt,
    });

    // Delete old concepts for this room, then insert the new batch atomically
    await prisma.roomConcept.deleteMany({ where: { room_id: roomId } });

    const concepts = await prisma.$transaction(
      generated.concepts.map((c) =>
        prisma.roomConcept.create({
          data: {
            room_id: roomId,
            title: c.title,
            summary: c.summary,
            explanation: c.explanation,
          },
        })
      )
    );

    return NextResponse.json({ concepts, roomName: room.name }, { status: 201 });
  } catch (error) {
    logger.error("Error generating room concepts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
