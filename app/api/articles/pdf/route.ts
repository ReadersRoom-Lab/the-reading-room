import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { PDFParse } from 'pdf-parse'
import DOMPurify from 'isomorphic-dompurify'
import { logger } from '@/lib/logger'
import { chunkText, generateEmbeddings } from '@/lib/embeddings'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure the user exists in our DB
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const roomId = formData.get('roomId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Convert Buffer to Uint8Array for pdf-parse v2+
    const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    
    const parser = new PDFParse({ data: uint8Array })
    const textResult = await parser.getText()
    const infoResult = await parser.getInfo()

    const textContent = textResult.text || ''
    
    // Fallbacks for title and author if not in PDF metadata
    const title = infoResult.info?.Title || file.name || 'Untitled PDF'
    const author = infoResult.info?.Author || null

    // We format the raw text into paragraphs for readability
    const formattedHtml = textContent
      .split('\n\n')
      .filter((p: string) => p.trim().length > 0)
      .map((p: string) => `<p>${p.replaceAll('\n', ' ')}</p>`)
      .join('')

    const cleanContent = DOMPurify.sanitize(formattedHtml)

    const wordCount = textContent.trim().split(/\s+/).length
    const readTimeMinutes = Math.ceil(wordCount / 200)

    const savedArticle = await prisma.article.create({
      data: {
        user_id: user.id,
        room_id: roomId || null,
        title: title,
        author: author,
        source_url: `upload://${file.name}`,
        source_type: 'pdf',
        content: cleanContent,
        word_count: wordCount,
        read_time_minutes: readTimeMinutes,
        date_accessed: new Date(),
        status: 'unread',
        reading_progress: 0,
      }
    })

    // --- Vector Search & RAG: Generate Embeddings ---
    try {
      const textChunks = chunkText(textContent, 1000)
      if (textChunks.length > 0) {
        const embeddings = await generateEmbeddings(textChunks)
        
        for (let i = 0; i < textChunks.length; i++) {
          const chunk = textChunks[i]
          const embedding = embeddings[i]
          
          if (embedding && embedding.length > 0) {
            const embeddingString = `[${embedding.join(',')}]`
            await prisma.$executeRaw`
              INSERT INTO "ArticleChunk" (id, article_id, content, embedding, created_at)
              VALUES (gen_random_uuid(), ${savedArticle.id}, ${chunk}, ${embeddingString}::vector, NOW())
            `
          }
        }
      }
    } catch (embedError) {
      logger.error('Failed to generate embeddings for PDF article:', embedError)
    }

    return NextResponse.json(savedArticle, { status: 201 })
  } catch (error) {
    logger.error('Error saving PDF:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
