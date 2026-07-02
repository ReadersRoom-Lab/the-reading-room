import prisma from '../lib/prisma'
import { generateEmbeddings, chunkText } from '../lib/embeddings'

async function run() {
  try {
    console.log('Testing end-to-end RAG chunk insertion...')
    
    // Create a dummy user and article if none exist
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerk_id: 'test-rag-user',
          email: 'test@rag.com',
          first_name: 'Test',
          last_name: 'Rag'
        }
      })
    }

    const article = await prisma.article.create({
      data: {
        user_id: user.id,
        title: 'Semantic Vector Search using pgvector',
        content: '<p>Vector search is powerful. It allows finding related items by their vector distance.</p>',
        source_url: 'http://test.local',
        source_type: 'url',
        word_count: 14,
        read_time_minutes: 1,
        date_accessed: new Date(),
        status: 'unread',
        reading_progress: 0
      }
    })
    console.log('Created test article:', article.id)

    // Simulate save route logic
    const textContent = 'Vector search is powerful. It allows finding related items by their vector distance.'
    const textChunks = chunkText(textContent, 100)
    console.log(`Generated ${textChunks.length} chunks.`)

    if (textChunks.length > 0) {
      const embeddings = await generateEmbeddings(textChunks)
      
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i]
        const embedding = embeddings[i]
        
        if (embedding && embedding.length > 0) {
          const embeddingString = `[${embedding.join(',')}]`
          await prisma.$executeRaw`
            INSERT INTO "ArticleChunk" (id, article_id, content, embedding, created_at)
            VALUES (gen_random_uuid(), ${article.id}, ${chunk}, ${embeddingString}::vector, NOW())
          `
        }
      }
    }
    console.log('Inserted chunks successfully.')

    // Now test vector search
    const queryEmbedding = (await generateEmbeddings(['vector search']))[0]
    const qString = `[${queryEmbedding.join(',')}]`
    
    const results = await prisma.$queryRaw`
      SELECT c.content, a.title 
      FROM "ArticleChunk" c
      JOIN "Article" a ON c.article_id = a.id
      WHERE a.user_id = ${user.id}
      ORDER BY c.embedding <=> ${qString}::vector
      LIMIT 1;
    `
    console.log('Search results:', results)

  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

run()
