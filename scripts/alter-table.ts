import prisma from '../lib/prisma'

async function run() {
  try {
    await prisma.$executeRaw`ALTER TABLE "ArticleChunk" ALTER COLUMN embedding TYPE vector(3072)`
    console.log('Altered column successfully')
  } catch (e) {
    console.error(e)
  }
}
run()
