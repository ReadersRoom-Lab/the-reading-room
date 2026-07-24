import { NextResponse, after } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { parseHTML } from "linkedom";
import sanitizeHtml from "sanitize-html";
import { logger } from "@/lib/logger";
import { chunkText, generateEmbeddings } from "@/lib/embeddings";
import { revalidatePath } from "next/cache";

interface BatchItemPayload {
  title?: string;
  url?: string;
  source_url?: string;
  source_type?: string;
  text?: string;
  html?: string;
  file_url?: string;
  file_data?: string;
}

function processArticleText(rawContent: string) {
  const cleanContent = sanitizeHtml(rawContent || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
  const { document } = parseHTML(`<div>${cleanContent}</div>`);
  const textContent = document.body.textContent || "";
  const words = textContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return { cleanContent, textContent, wordCount, readTimeMinutes };
}

async function generateArticleEmbeddings(articleId: string, textContent: string) {
  try {
    const textChunks = chunkText(textContent, 1000);
    if (textChunks.length === 0) return;
    const embeddings = await generateEmbeddings(textChunks);

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const embedding = embeddings[i];

      if (embedding && embedding.length > 0) {
        const embeddingString = `[${embedding.join(",")}]`;
        await prisma.$executeRaw`
          INSERT INTO "ArticleChunk" (id, article_id, content, embedding, created_at)
          VALUES (gen_random_uuid(), ${articleId}, ${chunk}, ${embeddingString}::vector, NOW())
        `;
      }
    }
  } catch (embedError) {
    logger.error("Failed to generate embeddings for batch article:", embedError);
  }
}

async function saveBatchItem(
  item: BatchItemPayload,
  userId: string,
  roomId: string | null,
  formattedTags: string[]
) {
  const title = item.title || "Untitled Document";
  try {
    let contentHtml = "";
    const sourceType = item.source_type || "upload";
    const sourceUrl = item.source_url || item.url || `upload://${title}`;

    if (item.text) {
      contentHtml = item.text
        .split("\n\n")
        .filter((p: string) => p.trim().length > 0)
        .map((p: string) => `<p>${p.replaceAll("\n", " ")}</p>`)
        .join("");
    } else if (item.html) {
      contentHtml = item.html;
    } else {
      contentHtml = `<p>${title}</p>`;
    }

    const { cleanContent, textContent, wordCount, readTimeMinutes } =
      processArticleText(contentHtml);

    const rawFilePayload = item.file_url || item.file_data || null;

    const savedArticle = await prisma.article.create({
      data: {
        user_id: userId,
        room_id: roomId || null,
        tags: formattedTags,
        title: title,
        author: null,
        source_url: sourceUrl,
        source_type: sourceType,
        content: cleanContent,
        cover_image: null,
        file_url: rawFilePayload,
        word_count: wordCount,
        read_time_minutes: readTimeMinutes,
        date_accessed: new Date(),
        status: "unread",
        reading_progress: 0,
      } as Prisma.ArticleUncheckedCreateInput,
    });

    after(() => generateArticleEmbeddings(savedArticle.id, textContent));

    return {
      title,
      success: true,
      article: savedArticle,
    };
  } catch (itemErr) {
    logger.error(`Error processing batch file ${title}:`, itemErr);
    return {
      title,
      success: false,
      error: itemErr instanceof Error ? itemErr.message : "Failed to save document",
    };
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, roomId, tags } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Batch payload must contain a non-empty array of items." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formattedTags = Array.isArray(tags)
      ? tags.map((t: string) => (t.startsWith("#") ? t.trim() : `#${t.trim()}`)).filter(Boolean)
      : [];

    const results = [];
    for (const item of items as BatchItemPayload[]) {
      const result = await saveBatchItem(item, user.id, roomId, formattedTags);
      results.push(result);
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ results }, { status: 207 });
  } catch (error) {
    logger.error("Error in batch save route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
