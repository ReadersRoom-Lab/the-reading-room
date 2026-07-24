import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const conceptSchema = z.object({
  definition: z.string(),
  pronunciation: z.string(),
  etymology: z.string(),
  exampleSentence: z.string(),
});

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");
    const passage = searchParams.get("passage") || "";

    if (!term) {
      return NextResponse.json({ error: "Term is required" }, { status: 400 });
    }

    // Call Gemini to generate structured dictionary details
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system:
        "You are a lexicographer. Return a JSON object with fields: definition (prefixed with part of speech like '(noun) '), pronunciation (e.g. /phonetic/), etymology, and exampleSentence.",
      prompt: `Provide details for the term "${term}"${
        passage ? ` in the context of this passage: "${passage}"` : ""
      }.`,
    });

    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = conceptSchema.parse(JSON.parse(cleanJson));

    return NextResponse.json({
      term,
      definition: parsed.definition,
      pronunciation: parsed.pronunciation,
      etymology: parsed.etymology,
      exampleSentence: parsed.exampleSentence,
      description: "",
      thumbnail: null,
      sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(term)}`,
    });
  } catch (error) {
    logger.error("Gemini Concept Lookup Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
