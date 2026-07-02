import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import DOMPurify from 'isomorphic-dompurify'
import { logger } from '@/lib/logger'
import { chunkText, generateEmbeddings } from '@/lib/embeddings'

// helper to fetch DOI
async function fetchDOIMetadata(doi: string) {
  const cleanDoi = doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '')
  const res = await fetch(`https://api.crossref.org/works/${cleanDoi}`)
  if (!res.ok) throw new Error('DOI not found')
  const data = await res.json()
  const message = data.message
  
  const title = message.title?.[0] || 'Untitled Article'
  const author = message.author?.map((a: { given: string; family: string }) => `${a.given} ${a.family}`).join(', ') || null
  const content = message.abstract ? `<p>${message.abstract}</p>` : '<p>No abstract available.</p>'
  
  return { title, author, content, url: `https://doi.org/${cleanDoi}`, sourceType: 'doi' }
}

// helper to fetch arXiv
async function fetchArxivMetadata(arxivId: string) {
  const cleanId = arxivId.replace(/^(https?:\/\/)?arxiv\.org\/(abs|pdf)\//, '').replace(/\.pdf$/, '')
  const res = await fetch(`http://export.arxiv.org/api/query?id_list=${cleanId}`)
  if (!res.ok) throw new Error('arXiv ID not found')
  const xml = await res.text()
  
  const doc = new JSDOM(xml, { contentType: "text/xml" }).window.document
  const entry = doc.querySelector('entry')
  if (!entry) throw new Error('arXiv entry not found')
  
  const title = entry.querySelector('title')?.textContent?.trim() || 'Untitled Article'
  const authors = Array.from(entry.querySelectorAll('author name')).map(n => n.textContent).join(', ')
  const abstract = entry.querySelector('summary')?.textContent?.trim() || 'No abstract available.'
  
  return { title, author: authors, content: `<p>${abstract}</p>`, url: `https://arxiv.org/abs/${cleanId}`, sourceType: 'arxiv' }
}

// helper to fetch standard web page
async function fetchStandardUrl(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TheReadingRoomBot/1.0)',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`)
  }

  const html = await response.text()
  const doc = new JSDOM(html, { url })
  const reader = new Readability(doc.window.document)
  const article = reader.parse()

  if (!article) {
    throw new Error('Failed to extract article content')
  }

  let coverImage = null
  const metaTags = doc.window.document.getElementsByTagName('meta')
  for (const metaTag of Array.from(metaTags)) {
    const property = metaTag.getAttribute('property')
    const name = metaTag.getAttribute('name')
    if (property === 'og:image' || name === 'twitter:image') {
      coverImage = metaTag.getAttribute('content')
      break
    }
  }

  return {
    articleData: {
      title: article.title || 'Untitled Article',
      author: article.byline || null,
      content: article.content || '',
      url: url,
      sourceType: 'url'
    },
    coverImage
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, roomId } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL or Identifier is required' }, { status: 400 })
    }

    // Ensure the user exists in our DB
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let articleData = null;
    let coverImage = null;

    if (url.startsWith('10.') || url.includes('doi.org')) {
      articleData = await fetchDOIMetadata(url)
    } else if (url.includes('arxiv.org') || url.startsWith('arxiv:')) {
      articleData = await fetchArxivMetadata(url.replace(/^arxiv:/, ''))
    } else {
      const standardRes = await fetchStandardUrl(url)
      articleData = standardRes.articleData
      coverImage = standardRes.coverImage
    }

    // Sanitize the HTML output
    const cleanContent = DOMPurify.sanitize(articleData.content || '')

    // Calculate word count and read time
    // Create a temporary JSDOM just to extract textContent for word count
    const tempDoc = new JSDOM(cleanContent).window.document;
    const textContent = tempDoc.body.textContent || '';
    
    const wordCount = textContent.trim().split(/\s+/).length
    const readTimeMinutes = Math.ceil(wordCount / 200) // Assumes ~200 WPM

    // Save to database
    const savedArticle = await prisma.article.create({
      data: {
        user_id: user.id,
        room_id: roomId || null,
        title: articleData.title,
        author: articleData.author,
        source_url: articleData.url,
        source_type: articleData.sourceType,
        content: cleanContent,
        cover_image: coverImage,
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
      logger.error('Failed to generate embeddings for article:', embedError)
      // We don't fail the save if embeddings fail, just log it.
    }

    return NextResponse.json(savedArticle, { status: 201 })
  } catch (error) {
    logger.error('Error saving article:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
