import { generateEmbedding, chunkText } from '../lib/embeddings'

async function run() {
  try {
    const { embed } = await import('ai')
    const { google } = await import('@ai-sdk/google')
    
    console.log('Testing gemini-embedding-001...')
    const { embedding: e1 } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: 'hello world',
    })
    console.log('gemini-embedding-001 works:', e1.slice(0,5))

    console.log('Testing gemini-embedding-2...')
    const { embedding: e2 } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-2'),
      value: 'hello world',
    })
    console.log('gemini-embedding-2 works:', e2.slice(0,5))
  } catch (error) {
    console.error('Test failed:', error)
  }
}

run()
