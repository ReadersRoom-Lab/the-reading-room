import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import DOMPurify from 'isomorphic-dompurify'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, roomId } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Ensure the user exists in our DB
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch the raw HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TheReadingRoomBot/1.0)',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: 400 })
    }

    const html = await response.text()

    // Parse the DOM
    const doc = new JSDOM(html, { url })
    
    // Extract metadata & content using Readability
    const reader = new Readability(doc.window.document)
    const article = reader.parse()

    if (!article) {
      return NextResponse.json({ error: 'Failed to extract article content' }, { status: 400 })
    }

    // Sanitize the HTML output
    const cleanContent = DOMPurify.sanitize(article.content || '')

    // Calculate word count and read time
    const textContent = article.textContent || ''
    const wordCount = textContent.trim().split(/\s+/).length
    const readTimeMinutes = Math.ceil(wordCount / 200) // Assumes ~200 WPM

    // Determine cover image (attempt to find og:image or twitter:image)
    let coverImage = null
    const metaTags = doc.window.document.getElementsByTagName('meta')
    for (let i = 0; i < metaTags.length; i++) {
      const property = metaTags[i].getAttribute('property')
      const name = metaTags[i].getAttribute('name')
      if (property === 'og:image' || name === 'twitter:image') {
        coverImage = metaTags[i].getAttribute('content')
        break
      }
    }

    // Save to database
    const savedArticle = await prisma.article.create({
      data: {
        user_id: user.id,
        room_id: roomId || null,
        title: article.title || 'Untitled Article',
        author: article.byline || null,
        source_url: url,
        source_type: 'url',
        content: cleanContent,
        cover_image: coverImage,
        word_count: wordCount,
        read_time_minutes: readTimeMinutes,
        date_accessed: new Date(),
        status: 'unread',
        reading_progress: 0,
      }
    })

    return NextResponse.json(savedArticle, { status: 201 })
  } catch (error) {
    console.error('Error saving article:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
