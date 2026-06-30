import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  const body = await request.json();
  const highlight = await store.createHighlight(body.userId ?? 'demo-user', body.articleId, {
    content: body.content,
    colour: body.colour ?? 'amber',
    note: body.note,
    positionStart: body.positionStart ?? 0,
    positionEnd: body.positionEnd ?? 0,
  });

  return NextResponse.json({ highlight });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId') ?? undefined;
  return NextResponse.json({ highlights: await store.listHighlights('demo-user', articleId) });
}
