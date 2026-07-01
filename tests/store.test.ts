import test from 'node:test';
import assert from 'node:assert/strict';

import { store } from '../lib/store';

test('creates a room and ingests an article for the user', async () => {
  const userId = 'test-user';
  const room = await store.createRoom(userId, 'Reading List', '#8b5cf6', 'Demo room');
  const article = await store.ingestArticle(userId, {
    url: 'https://example.com/reading-room',
    roomId: room.id,
    title: 'Reading Room Intro',
    content: '<p>Backend scaffold is live.</p>',
  });

  const rooms = await store.listRooms(userId);
  assert.equal(room.name, 'Reading List');
  assert.equal(article.userId, userId);
  assert.equal(article.roomId, room.id);
  assert.equal(article.title, 'Reading Room Intro');
  assert.equal(rooms.length, 1);
});
