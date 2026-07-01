import test from 'node:test';
import assert from 'node:assert/strict';

import { InMemoryStore } from '../lib/store';

// ─── Room CRUD ───────────────────────────────────────────────────────────────

test('createRoom returns a room with correct shape', () => {
  const store = new InMemoryStore();
  const room = store.createRoom('user-1', 'Science', '#3b82f6', 'Physics & Maths');

  assert.equal(room.userId, 'user-1');
  assert.equal(room.name, 'Science');
  assert.equal(room.coverColor, '#3b82f6');
  assert.equal(room.description, 'Physics & Maths');
  assert.equal(room.mode, 'reading');
  assert.ok(typeof room.id === 'string');
  assert.ok(room.id.length > 0);
  assert.ok(typeof room.createdAt === 'string');
});

test('createRoom works without optional description', () => {
  const store = new InMemoryStore();
  const room = store.createRoom('user-1', 'Fiction', '#ec4899');
  assert.equal(room.description, undefined);
});

test('listRooms returns only rooms belonging to the user', () => {
  const store = new InMemoryStore();
  store.createRoom('user-A', 'Room A1', '#000');
  store.createRoom('user-A', 'Room A2', '#111');
  store.createRoom('user-B', 'Room B1', '#222');

  const roomsA = store.listRooms('user-A');
  const roomsB = store.listRooms('user-B');
  const roomsC = store.listRooms('user-C');

  assert.equal(roomsA.length, 2);
  assert.equal(roomsB.length, 1);
  assert.equal(roomsC.length, 0);
});

test('listRooms returns empty array when user has no rooms', () => {
  const store = new InMemoryStore();
  const rooms = store.listRooms('nobody');
  assert.deepEqual(rooms, []);
});

// ─── Article Ingestion ───────────────────────────────────────────────────────

test('ingestArticle returns article with correct shape', () => {
  const store = new InMemoryStore();
  const article = store.ingestArticle('user-1', {
    url: 'https://example.com/article',
    title: 'Test Article',
    content: 'Hello world this is a test article with several words',
  });

  assert.equal(article.userId, 'user-1');
  assert.equal(article.title, 'Test Article');
  assert.equal(article.sourceUrl, 'https://example.com/article');
  assert.equal(article.sourceType, 'url');
  assert.equal(article.readingProgress, 0);
  assert.equal(article.status, 'unread');
  assert.ok(article.wordCount > 0);
  assert.ok(article.readTimeMinutes >= 1);
});

test('ingestArticle defaults title to "Untitled article" when not provided', () => {
  const store = new InMemoryStore();
  const article = store.ingestArticle('user-1', { url: 'https://example.com' });
  assert.equal(article.title, 'Untitled article');
});

test('ingestArticle defaults content to empty string when not provided', () => {
  const store = new InMemoryStore();
  const article = store.ingestArticle('user-1', { url: 'https://example.com' });
  assert.equal(article.content, '');
  assert.equal(article.wordCount, 0);
  assert.equal(article.readTimeMinutes, 1); // Math.max(1, ...)
});

test('ingestArticle calculates word count correctly', () => {
  const store = new InMemoryStore();
  // 200 words → 1 minute read time
  const twoHundredWords = new Array(200).fill('word').join(' ');
  const article = store.ingestArticle('user-1', {
    url: 'https://example.com',
    content: twoHundredWords,
  });
  assert.equal(article.wordCount, 200);
  assert.equal(article.readTimeMinutes, 1);
});

test('ingestArticle assigns roomId when provided', () => {
  const store = new InMemoryStore();
  const room = store.createRoom('user-1', 'History', '#000');
  const article = store.ingestArticle('user-1', {
    url: 'https://example.com',
    roomId: room.id,
  });
  assert.equal(article.roomId, room.id);
});

test('ingestArticle assigns author when provided', () => {
  const store = new InMemoryStore();
  const article = store.ingestArticle('user-1', {
    url: 'https://example.com',
    author: 'John Doe',
  });
  assert.equal(article.author, 'John Doe');
});

// ─── Article Retrieval ───────────────────────────────────────────────────────

test('listArticles returns only articles belonging to the user', () => {
  const store = new InMemoryStore();
  store.ingestArticle('user-A', { url: 'https://a.com/1' });
  store.ingestArticle('user-A', { url: 'https://a.com/2' });
  store.ingestArticle('user-B', { url: 'https://b.com/1' });

  assert.equal(store.listArticles('user-A').length, 2);
  assert.equal(store.listArticles('user-B').length, 1);
  assert.equal(store.listArticles('user-C').length, 0);
});

test('getArticle returns the correct article by id', () => {
  const store = new InMemoryStore();
  const article = store.ingestArticle('user-1', {
    url: 'https://example.com',
    title: 'My Article',
  });

  const found = store.getArticle('user-1', article.id);
  assert.ok(found);
  assert.equal(found.title, 'My Article');
});

test('getArticle returns undefined for wrong user', () => {
  const store = new InMemoryStore();
  const article = store.ingestArticle('user-1', { url: 'https://example.com' });
  const found = store.getArticle('user-2', article.id);
  assert.equal(found, undefined);
});

test('getArticle returns undefined for non-existent id', () => {
  const store = new InMemoryStore();
  const found = store.getArticle('user-1', 'does-not-exist');
  assert.equal(found, undefined);
});

// ─── Highlights ──────────────────────────────────────────────────────────────

test('createHighlight returns a highlight with correct shape', () => {
  const store = new InMemoryStore();
  const article = store.ingestArticle('user-1', { url: 'https://example.com' });
  const highlight = store.createHighlight('user-1', article.id, {
    content: 'Important passage',
    colour: 'amber',
    positionStart: 10,
    positionEnd: 28,
  });

  assert.equal(highlight.userId, 'user-1');
  assert.equal(highlight.articleId, article.id);
  assert.equal(highlight.content, 'Important passage');
  assert.equal(highlight.colour, 'amber');
  assert.equal(highlight.positionStart, 10);
  assert.equal(highlight.positionEnd, 28);
  assert.equal(highlight.note, undefined);
  assert.ok(typeof highlight.id === 'string');
});

test('createHighlight stores an optional note', () => {
  const store = new InMemoryStore();
  const article = store.ingestArticle('user-1', { url: 'https://example.com' });
  const highlight = store.createHighlight('user-1', article.id, {
    content: 'Text',
    colour: 'teal',
    note: 'My annotation',
    positionStart: 0,
    positionEnd: 4,
  });
  assert.equal(highlight.note, 'My annotation');
});

test('listHighlights returns all highlights for a user across articles', () => {
  const store = new InMemoryStore();
  const a1 = store.ingestArticle('user-1', { url: 'https://a.com/1' });
  const a2 = store.ingestArticle('user-1', { url: 'https://a.com/2' });
  store.createHighlight('user-1', a1.id, { content: 'H1', colour: 'amber', positionStart: 0, positionEnd: 2 });
  store.createHighlight('user-1', a2.id, { content: 'H2', colour: 'coral', positionStart: 0, positionEnd: 2 });
  store.createHighlight('user-2', a1.id, { content: 'H3', colour: 'teal', positionStart: 0, positionEnd: 2 });

  assert.equal(store.listHighlights('user-1').length, 2);
  assert.equal(store.listHighlights('user-2').length, 1);
  assert.equal(store.listHighlights('user-3').length, 0);
});

test('listHighlights filters by articleId when provided', () => {
  const store = new InMemoryStore();
  const a1 = store.ingestArticle('user-1', { url: 'https://a.com/1' });
  const a2 = store.ingestArticle('user-1', { url: 'https://a.com/2' });
  store.createHighlight('user-1', a1.id, { content: 'H1', colour: 'amber', positionStart: 0, positionEnd: 2 });
  store.createHighlight('user-1', a1.id, { content: 'H2', colour: 'teal', positionStart: 5, positionEnd: 7 });
  store.createHighlight('user-1', a2.id, { content: 'H3', colour: 'coral', positionStart: 0, positionEnd: 2 });

  assert.equal(store.listHighlights('user-1', a1.id).length, 2);
  assert.equal(store.listHighlights('user-1', a2.id).length, 1);
  assert.equal(store.listHighlights('user-1', 'non-existent').length, 0);
});

test('stores are isolated — each InMemoryStore has its own state', () => {
  const store1 = new InMemoryStore();
  const store2 = new InMemoryStore();

  store1.createRoom('user-1', 'Room in store 1', '#000');
  assert.equal(store1.listRooms('user-1').length, 1);
  assert.equal(store2.listRooms('user-1').length, 0);
});
