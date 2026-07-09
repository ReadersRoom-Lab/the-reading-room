import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Definition not found" }, { status: 404 });
      }
      throw new Error("Failed to fetch from dictionary API");
    }

    const data = await response.json();
    const entry = data[0];

    // Extract first meaning
    const meaning = entry.meanings?.[0];
    const definitionObj = meaning?.definitions?.[0];

    // Etymology isn't consistently provided by the Free Dictionary API,
    // but sometimes it's in origin or we'll just mock a placeholder if empty
    const etymology = entry.origin || "Etymology information not available for this word.";

    return NextResponse.json({
      word: entry.word,
      phonetic:
        entry.phonetic || entry.phonetics?.find((p: { text?: string }) => p.text)?.text || "",
      partOfSpeech: meaning?.partOfSpeech || "",
      definition: definitionObj?.definition || "",
      example: definitionObj?.example || "",
      etymology: etymology,
    });
  } catch (error) {
    logger.error("Dictionary API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
