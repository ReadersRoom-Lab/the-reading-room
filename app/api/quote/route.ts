import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  try {
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt: "Generate a profound, unique, and culturally diverse quote about reading, books, literature, or libraries. Output exactly in this format: \"[Quote Text]\" - [Author Name]. Do not include any other text.",
      temperature: 0.9,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI Quote Generation Error:", error);
    return new Response("Error generating quote", { status: 500 });
  }
}
