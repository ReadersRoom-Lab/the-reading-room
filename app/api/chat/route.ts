import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { logger } from "@/lib/logger";
import { generateEmbedding } from "@/lib/embeddings";

// Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // 1. Semantic RAG: Fetch relevant user context.
    let relevantChunks: { title: string; content: string }[] = [];

    if (lastMessage?.role === "user") {
      try {
        const queryEmbedding = await generateEmbedding(lastMessage.content);
        const embeddingString = `[${queryEmbedding.join(",")}]`;

        relevantChunks = await prisma.$queryRaw`
          SELECT c.content, a.title 
          FROM "ArticleChunk" c
          JOIN "Article" a ON c.article_id = a.id
          WHERE a.user_id = ${user.id}
          ORDER BY c.embedding <=> ${embeddingString}::vector
          LIMIT 5;
        `;
      } catch (err) {
        logger.error("Failed to perform vector search:", err);
      }
    }

    const vaultEntries = await prisma.vaultEntry.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      take: 5,
      select: { term: true, definition: true },
    });

    const contextContext = `
    You are the "ReadrSpace AI", an advanced synthesis assistant for a researcher.
    You help the user synthesize, analyze, and recall information from their saved library.
    
    Here is some relevant context from their library based on their query:
    
    Relevant Passages:
    ${
      relevantChunks.length > 0
        ? relevantChunks.map((c) => `- Title: ${c.title}\nPassage: ${c.content}`).join("\n\n")
        : "No highly relevant passages found for this specific query."
    }
    
    Recent Vocabulary Concepts:
    ${vaultEntries.map((v: { term: string; definition: string }) => `- ${v.term}: ${v.definition}`).join("\n")}
    
    Always be concise, academic, and insightful. If they ask about something not in the context, answer generally but remind them you only have partial context injected right now.
    `;

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: contextContext,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    logger.error("Error in chat route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
