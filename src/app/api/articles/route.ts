import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  const body = await request.json();
  const article = await store.ingestArticle(body.userId ?? 'demo-user', {
    url: body.url,
    roomId: body.roomId,
    title: body.title,
    content: body.content,
    author: body.author,
  });

  return NextResponse.json({ article });
}

export async function GET() {
  return NextResponse.json({ articles: await store.listArticles('demo-user') });
}
