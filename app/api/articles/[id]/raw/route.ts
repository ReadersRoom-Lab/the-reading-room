import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const article = await prisma.article.findUnique({
      where: {
        id,
        user_id: user.id,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const fileUrl = (article as { file_url?: string | null }).file_url;

    // Check file_url for stored native content
    if (fileUrl) {
      if (fileUrl.startsWith("data:")) {
        const matches = /^data:([^;]+);base64,(.+)$/.exec(fileUrl);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");

          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": mimeType,
              "Content-Disposition": `inline; filename="${encodeURIComponent(article.title)}.pdf"`,
              "Content-Length": buffer.length.toString(),
              "Content-Security-Policy": "default-src 'none'; plugin-types application/pdf;",
              "X-Content-Type-Options": "nosniff",
              "X-Frame-Options": "SAMEORIGIN",
              "Cache-Control": "private, max-age=86400, immutable",
            },
          });
        }
      } else if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
        return NextResponse.redirect(fileUrl);
      }
    }

    // Fallback: If no file_url, serve raw content as HTML document
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #222; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .author { color: #666; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>${article.title}</h1>
  ${article.author ? `<div class="author">By ${article.author}</div>` : ""}
  <div>${article.content}</div>
</body>
</html>`;

    return new Response(htmlBody, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    logger.error("Error serving raw document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
