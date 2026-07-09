import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");

    if (!term) {
      return NextResponse.json({ error: "Term is required" }, { status: 400 });
    }

    // Clean up term and encode for Wikipedia REST API
    const cleanTerm = term.trim().replace(/\s+/g, "_");
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTerm)}`;

    const response = await fetch(wikiUrl, {
      headers: {
        "User-Agent": "TheReadingRoom/1.0 (contact@thereadingroom.com)",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Concept not found" }, { status: 404 });
      }
      throw new Error(`Wikipedia API responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      term: data.title || term,
      definition: data.extract || "",
      description: data.description || "",
      thumbnail: data.thumbnail?.source || null,
      sourceUrl:
        data.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTerm)}`,
    });
  } catch (error) {
    logger.error("Wikipedia Lookup Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
