import { embedMany, embed } from 'ai'
import { google } from '@ai-sdk/google'

/**
 * Split text into chunks of roughly `chunkSize` characters,
 * respecting paragraph boundaries where possible.
 */
export function chunkText(text: string, chunkSize = 1000): string[] {
  if (!text) return []

  const paragraphs = text.split(/\n\s*\n/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = ''
    }
    currentChunk += paragraph + '\n\n'
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

/**
 * Generate embeddings for an array of strings.
 */
export async function generateEmbeddings(chunks: string[]) {
  if (chunks.length === 0) return []
  
  const { embeddings } = await embedMany({
    model: google.textEmbeddingModel('gemini-embedding-2'),
    values: chunks,
  })

  return embeddings
}

/**
 * Generate a single embedding for a query string.
 */
export async function generateEmbedding(text: string) {
  const { embedding } = await embed({
    model: google.textEmbeddingModel('gemini-embedding-2'),
    value: text,
  })

  return embedding
}
