import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    const { messages } = await req.json()

    // 1. Lightweight RAG: Fetch some user context.
    // In a real app we'd use semantic search / embeddings here.
    // For now, we'll fetch a sample of recent articles and vault entries to inject into the system prompt.
    const recentArticles = await prisma.article.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 3,
      select: { title: true, content: true }
    })

    const vaultEntries = await prisma.vaultEntry.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: { term: true, definition: true }
    })

    const contextContext = `
    You are the "Reading Room AI", an advanced synthesis assistant for a researcher.
    You help the user synthesize, analyze, and recall information from their saved library.
    
    Here is some recent context from their library:
    
    Recent Articles:
    ${recentArticles.map((a: { title: string; content: string }) => `- Title: ${a.title}\nContent snippet: ${a.content.substring(0, 500)}...`).join('\n\n')}
    
    Recent Vocabulary Concepts:
    ${vaultEntries.map((v: { term: string; definition: string }) => `- ${v.term}: ${v.definition}`).join('\n')}
    
    Always be concise, academic, and insightful. If they ask about something not in the context, answer generally but remind them you only have partial context injected right now.
    `

    const result = await streamText({
      model: google('models/gemini-1.5-flash'),
      system: contextContext,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error in chat route:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
