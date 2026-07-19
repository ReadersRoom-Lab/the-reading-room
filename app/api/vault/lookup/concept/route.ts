import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

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

    // Call Gemini to generate structured definition, pronunciation, etymology, and example sentence
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        definition: z
          .string()
          .describe(
            "Accurate, clear definition of the term. If a passage is provided, tailor the definition to match the meaning in that context. Prefix with part of speech in lowercase, like '(noun) ' or '(adverb) '."
          ),
        pronunciation: z
          .string()
          .describe("Phonetic pronunciation of the word (e.g. /ɪnˈkrɛd.ɪ.bli/)."),
        etymology: z.string().describe("Comprehensive word origin and etymology."),
        exampleSentence: z
          .string()
          .describe("A clean, descriptive example sentence of the word in action."),
      }),
      prompt: `Provide details for the term "${term}"${
        passage ? ` in the context of this passage: "${passage}"` : ""
      }. Explain the definition, pronunciation, etymology/origin, and a new example sentence.`,
    });

    return NextResponse.json({
      term,
      definition: result.object.definition,
      pronunciation: result.object.pronunciation,
      etymology: result.object.etymology,
      exampleSentence: result.object.exampleSentence,
      description: "",
      thumbnail: null,
      sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(term)}`,
    });
  } catch (error) {
    logger.error("Gemini Concept Lookup Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
