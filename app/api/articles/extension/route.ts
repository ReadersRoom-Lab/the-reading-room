import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import sanitizeHtml from "sanitize-html";
import { logger } from "@/lib/logger";
import { chunkText, generateEmbeddings } from "@/lib/embeddings";

async function processVectorEmbeddings(textContent: string, articleId: string) {
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
    logger.error("Failed to generate embeddings for extension article:", embedError);
  }
}

interface ExtractImageDocument {
  getElementsByTagName: (
    name: string
  ) => ArrayLike<{ getAttribute: (name: string) => string | null }>;
}

function extractCoverImage(document: ExtractImageDocument) {
  const metaTags = document.getElementsByTagName("meta");
  for (const metaTag of Array.from(metaTags)) {
    if (
      metaTag.getAttribute("property") === "og:image" ||
      metaTag.getAttribute("name") === "twitter:image"
    ) {
      return metaTag.getAttribute("content");
    }
  }
  return null;
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "*";

  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
  };

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to The Reading Room on localhost:3000 first." },
        { status: 401, headers: corsHeaders }
      );
    }

    const { url, html, roomId } = await req.json();

    if (!url || !html) {
      return NextResponse.json(
        { error: "URL and HTML content are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders });
    }

    // Parse HTML with Readability
    const { document } = parseHTML(html);
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      return NextResponse.json(
        { error: "Failed to extract article content from the provided page" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Extract cover image
    const coverImage = extractCoverImage(document);

    const cleanContent = sanitizeHtml(article.content || "", {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    });

    // Calculate word count and read time
    const { document: tempDoc } = parseHTML(`<div>${cleanContent}</div>`);
    const textContent = tempDoc.body.textContent || "";
    const wordCount = textContent.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const savedArticle = await prisma.article.create({
      data: {
        user_id: user.id,
        room_id: roomId || null,
        title: article.title || "Untitled Article",
        author: article.byline || null,
        source_url: url,
        source_type: "extension",
        content: cleanContent,
        cover_image: coverImage,
        word_count: wordCount,
        read_time_minutes: readTimeMinutes,
        status: "unread",
        reading_progress: 0,
      },
    });

    // --- Vector Search & RAG: Generate Embeddings ---
    await processVectorEmbeddings(textContent, savedArticle.id);

    return NextResponse.json(savedArticle, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    logger.error("Extension save error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
