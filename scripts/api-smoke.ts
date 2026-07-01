import { logger } from '@/lib/logger'
const base = 'http://localhost:3000';

async function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  logger.log('Starting API smoke test...');

  const healthRes = await fetch(`${base}/api/health`);
  const healthJson = await healthRes.json();
  await assert(healthRes.ok, 'Health endpoint failed');
  await assert(healthJson.status === 'ok', 'Health response invalid');
  logger.log('✔ Health endpoint');

  const roomPayload = {
    userId: 'smoke-test-user',
    name: 'Smoke Test Room',
    coverColor: '#8b5cf6',
    description: 'Test room',
  };
  const roomRes = await fetch(`${base}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roomPayload),
  });
  const roomJson = await roomRes.json();
  await assert(roomRes.ok, 'Create room failed');
  await assert(roomJson.room?.id, 'Create room response missing id');
  logger.log('✔ Create room');

  const roomsRes = await fetch(`${base}/api/rooms`);
  const roomsJson = await roomsRes.json();
  await assert(roomsRes.ok, 'List rooms failed');
  await assert(Array.isArray(roomsJson.rooms), 'List rooms response invalid');
  logger.log('✔ List rooms');

  const articlePayload = {
    userId: 'smoke-test-user',
    url: 'https://example.com/story',
    title: 'Example Story',
    content: '<p>Smoke test content</p>',
  };
  const articleRes = await fetch(`${base}/api/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articlePayload),
  });
  const articleJson = await articleRes.json();
  await assert(articleRes.ok, 'Create article failed');
  await assert(articleJson.article?.id, 'Create article response missing id');
  logger.log('✔ Create article');

  const articlesRes = await fetch(`${base}/api/articles`);
  const articlesJson = await articlesRes.json();
  await assert(articlesRes.ok, 'List articles failed');
  await assert(Array.isArray(articlesJson.articles), 'List articles response invalid');
  logger.log('✔ List articles');

  const highlightPayload = {
    userId: 'smoke-test-user',
    articleId: articleJson.article.id,
    content: 'Important sentence',
    colour: 'amber',
    positionStart: 0,
    positionEnd: 18,
  };
  const highlightRes = await fetch(`${base}/api/highlights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(highlightPayload),
  });
  const highlightJson = await highlightRes.json();
  await assert(highlightRes.ok, 'Create highlight failed');
  await assert(highlightJson.highlight?.id, 'Create highlight response missing id');
  logger.log('✔ Create highlight');

  const highlightsRes = await fetch(`${base}/api/highlights?articleId=${articleJson.article.id}`);
  const highlightsJson = await highlightsRes.json();
  await assert(highlightsRes.ok, 'List highlights failed');
  await assert(Array.isArray(highlightsJson.highlights), 'List highlights response invalid');
  logger.log('✔ List highlights');

  logger.log('API smoke test passed.');
}

run().catch((error) => {
  logger.error('Smoke test failed:', error.message);
  process.exit(1);
});
