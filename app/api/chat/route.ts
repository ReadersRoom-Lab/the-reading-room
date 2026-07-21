import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  streamText,
  createUIMessageStreamResponse,
  toUIMessageStream,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { logger } from "@/lib/logger";
import { generateEmbedding, generateEmbeddings, chunkText } from "@/lib/embeddings";

interface UserArticle {
  id: string;
  title: string;
  content: string;
  source_url: string;
  room: { name: string } | null;
}

interface SemanticChunk {
  title: string;
  content: string;
}

interface UserHighlight {
  content: string;
  note: string | null;
  article: { title: string } | null;
}

interface VaultEntryContext {
  term: string;
  definition: string;
  example_sentence: string | null;
}

/** Vector RAG search for user query */
async function fetchSemanticChunks(userId: string, query: string): Promise<SemanticChunk[]> {
  if (!query) return [];
  try {
    const queryEmbedding = await generateEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    return await prisma.$queryRaw<SemanticChunk[]>`
      SELECT c.content, a.title
      FROM "ArticleChunk" c
      JOIN "Article" a ON c.article_id = a.id
      WHERE a.user_id = ${userId}
      ORDER BY c.embedding <=> ${embeddingString}::vector
      LIMIT 5;
    `;
  } catch (err) {
    logger.error("Failed to perform vector search:", err);
    return [];
  }
}

/** Backfill vector embeddings for unchunked articles */
async function backfillArticleEmbeddings(articles: UserArticle[]): Promise<void> {
  try {
    for (const article of articles) {
      if (!article.content) continue;

      const chunkCount = await prisma.articleChunk.count({
        where: { article_id: article.id },
      });

      if (chunkCount > 0) continue;

      const textChunks = chunkText(article.content, 1000);
      if (textChunks.length === 0) continue;

      const embeddings = await generateEmbeddings(textChunks);
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        const embedding = embeddings[i];
        if (embedding?.length) {
          const embeddingString = `[${embedding.join(",")}]`;
          await prisma.$executeRaw`
            INSERT INTO "ArticleChunk" (id, article_id, content, embedding, created_at)
            VALUES (gen_random_uuid(), ${article.id}, ${chunk}, ${embeddingString}::vector, NOW())
          `;
        }
      }
    }
  } catch (backfillErr) {
    logger.error("Backfill embeddings error:", backfillErr);
  }
}

/** Construct system prompt with full library context */
function buildSystemPrompt(
  userArticles: UserArticle[],
  relevantChunks: SemanticChunk[],
  userHighlights: UserHighlight[],
  vaultEntries: VaultEntryContext[]
): string {
  const libraryContext =
    userArticles.length > 0
      ? userArticles
          .map((a, i) => {
            const roomInfo = a.room ? ` | Room: "${a.room.name}"` : "";
            const maxChars = 6000;
            const contentText =
              a.content.length > maxChars
                ? `${a.content.slice(0, maxChars)}\n...[content truncated for space]`
                : a.content;
            return `--- DOCUMENT ${i + 1}: "${a.title}"${roomInfo} ---\n${contentText}`;
          })
          .join("\n\n")
      : "The user has no articles saved in their library yet.";

  const semanticContext =
    relevantChunks.length > 0
      ? relevantChunks
          .map((c, i) => `[Semantic Match ${i + 1} from "${c.title}"]\n${c.content}`)
          .join("\n\n")
      : "";

  const highlightsContext =
    userHighlights.length > 0
      ? userHighlights
          .map(
            (h) =>
              `• "${h.content}" (from "${h.article?.title || "Article"}"${
                h.note ? `, Note: ${h.note}` : ""
              })`
          )
          .join("\n")
      : "";

  const vaultContext =
    vaultEntries.length > 0
      ? vaultEntries
          .map(
            (v) =>
              `• ${v.term}: ${v.definition}${
                v.example_sentence ? ` (Example: "${v.example_sentence}")` : ""
              }`
          )
          .join("\n")
      : "";

  return `You are "ReadrSpace AI", an advanced, intelligent research and synthesis assistant embedded in the user's reading workspace.

Your core purpose is to help the user analyze, recall, synthesize, and extract insights from their personal reading library, saved documents, highlights, and vocabulary vault.

==================================================
USER'S SAVED LIBRARY (${userArticles.length} DOCUMENTS AVAILABLE)
==================================================
${libraryContext}

${
  semanticContext
    ? `==================================================\nTOP SEMANTIC MATCHES FOR QUERY\n==================================================\n${semanticContext}\n`
    : ""
}
${
  highlightsContext
    ? `==================================================\nUSER'S SAVED HIGHLIGHTS & NOTES\n==================================================\n${highlightsContext}\n`
    : ""
}
${
  vaultContext
    ? `==================================================\nVOCABULARY VAULT (SAVED TERMS)\n==================================================\n${vaultContext}\n`
    : ""
}

==================================================
INSTRUCTIONS & GUIDELINES
==================================================
1. YOU HAVE FULL DIRECT ACCESS TO THE USER'S LIBRARY ARTICLES LISTED ABOVE. Thoroughly search through all documents, highlights, and vocabulary entries provided in this context before answering.
2. Ground your answers directly in the user's saved library whenever applicable.
3. Cite document titles explicitly (e.g. "According to *[Article Title]*...") when providing facts, definitions, or summaries from their reading material.
4. If the user asks about a topic, term, acronym, or entity (e.g., "GBA", "Bengaluru", "Act 36 of 2025") present in any document in their library, synthesize and explain it using the content from those documents.
5. Only if a topic is genuinely not mentioned anywhere in any of their saved library documents or vault, answer the question accurately using your general knowledge, but clearly state at the beginning: "Note: This was not found in your saved library, but here is general information:"
6. Maintain an articulate, concise, academic, yet accessible tone. Use markdown formatting (headers, bold text, bullet points) for readability.`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerk_id: userId } });
    if (!user) return new Response("User not found", { status: 404 });

    const { messages }: { messages: UIMessage[] } = await req.json();
    const lastMessage = messages.at(-1);
    const lastMessageText =
      lastMessage?.role === "user"
        ? lastMessage.parts.map((p) => (p.type === "text" ? p.text : "")).join("")
        : "";

    // Parallel fetch library context
    const [userArticles, relevantChunks, userHighlights, vaultEntries] = await Promise.all([
      prisma.article.findMany({
        where: { user_id: user.id },
        orderBy: { updated_at: "desc" },
        take: 15,
        select: {
          id: true,
          title: true,
          content: true,
          source_url: true,
          room: { select: { name: true } },
        },
      }),
      fetchSemanticChunks(user.id, lastMessageText),
      prisma.highlight.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: "desc" },
        take: 15,
        select: {
          content: true,
          note: true,
          article: { select: { title: true } },
        },
      }),
      prisma.vaultEntry.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: "desc" },
        take: 15,
        select: { term: true, definition: true, example_sentence: true },
      }),
    ]);

    // Asynchronous non-blocking backfill
    if (userArticles.length > 0) {
      void backfillArticleEmbeddings(userArticles);
    }

    const systemPrompt = buildSystemPrompt(
      userArticles,
      relevantChunks,
      userHighlights,
      vaultEntries
    );
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: modelMessages,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
      }),
    });
  } catch (error) {
    logger.error("Error in chat route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
