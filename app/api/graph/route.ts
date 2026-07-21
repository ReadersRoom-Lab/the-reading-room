import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

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

    // Fetch user's articles
    const articles = await prisma.article.findMany({
      where: { user_id: user.id },
      include: {
        room: { select: { id: true, name: true } },
        _count: { select: { highlights: true } },
      },
      orderBy: { created_at: "desc" },
    });

    // Fetch user's vault concepts
    const vaultEntries = await prisma.vaultEntry.findMany({
      where: { user_id: user.id },
      include: {
        vaultTrails: {
          include: {
            article: { select: { id: true, title: true } },
            room: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Generate graph nodes
    const nodes: Array<{
      id: string;
      type: "articleNode" | "conceptNode";
      position: { x: number; y: number };
      data: Record<string, unknown>;
    }> = [];

    const edges: Array<{
      id: string;
      source: string;
      target: string;
      animated?: boolean;
      style?: Record<string, unknown>;
    }> = [];

    // Calculate grid positions for articles (Left side grid)
    articles.forEach((article, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      nodes.push({
        id: `article_${article.id}`,
        type: "articleNode",
        position: { x: col * 320, y: row * 180 },
        data: {
          id: article.id,
          title: article.title,
          source_url: article.source_url,
          reading_progress: article.reading_progress,
          read_time_minutes: article.read_time_minutes,
          roomName: article.room?.name ?? "General Library",
          highlightCount: article._count.highlights,
        },
      });
    });

    // Calculate grid positions for concepts (Right side grid)
    const edgeSet = new Set<string>();

    vaultEntries.forEach((entry, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const nodeId = `concept_${entry.id}`;

      nodes.push({
        id: nodeId,
        type: "conceptNode",
        position: { x: 1100 + col * 280, y: row * 180 },
        data: {
          id: entry.id,
          term: entry.term,
          type: entry.type,
          definition: entry.definition,
          pronunciation: entry.pronunciation,
          etymology: entry.etymology,
          example_sentence: entry.example_sentence,
          user_note: entry.user_note,
          created_at: entry.created_at,
          vaultTrails: entry.vaultTrails,
        },
      });

      // Create edges between Concept and Articles where it was highlighted
      entry.vaultTrails.forEach((trail) => {
        const edgeId = `edge_${entry.id}_${trail.article_id}`;
        if (!edgeSet.has(edgeId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: nodeId,
            target: `article_${trail.article_id}`,
            animated: true,
            style: { stroke: "#E6C79C", strokeWidth: 1.5 },
          });
        }
      });
    });

    return NextResponse.json({
      nodes,
      edges,
      totals: {
        articles: articles.length,
        concepts: vaultEntries.length,
        connections: edges.length,
      },
    });
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return NextResponse.json({ error: "Failed to fetch graph data" }, { status: 500 });
  }
}
