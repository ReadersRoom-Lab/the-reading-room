import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  const body = await request.json();
  const room = store.createRoom(
    body.userId ?? 'demo-user',
    body.name ?? 'Untitled room',
    body.coverColor ?? '#f59e0b',
    body.description,
  );

  return NextResponse.json({ room });
}

export async function GET() {
  return NextResponse.json({ rooms: store.listRooms('demo-user') });
}
