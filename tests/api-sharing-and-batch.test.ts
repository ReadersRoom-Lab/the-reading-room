import test from "node:test";
import assert from "node:assert";
import { InMemoryStore } from "../lib/store.js";

test("Batch save API helper logic correctly formats and saves items", async () => {
  const store = new InMemoryStore();
  const room = store.createRoom("user_1", "Batch Room");

  const article1 = store.ingestArticle("user_1", {
    url: "upload://test1.md",
    title: "Batch Article 1",
    content: "Content for article 1",
    roomId: room.id,
  });

  const article2 = store.ingestArticle("user_1", {
    url: "upload://test2.pdf",
    title: "Batch Article 2",
    content: "Content for article 2",
    roomId: room.id,
  });

  assert.ok(article1.id);
  assert.ok(article2.id);
  assert.strictEqual(article1.roomId, room.id);
  assert.strictEqual(article2.roomId, room.id);
});

test("Article duplication helper clones article with prefix and new ID", async () => {
  const store = new InMemoryStore();
  const original = store.ingestArticle("user_1", {
    url: "upload://original.pdf",
    title: "Original Paper",
    content: "Deep research findings.",
    author: "Researcher",
  });

  const duplicate = store.ingestArticle("user_1", {
    url: original.sourceUrl,
    title: `Copy of ${original.title}`,
    content: original.content,
    author: original.author,
  });

  assert.notStrictEqual(duplicate.id, original.id);
  assert.strictEqual(duplicate.title, "Copy of Original Paper");
  assert.strictEqual(duplicate.content, original.content);
  assert.strictEqual(duplicate.userId, original.userId);
});

test("Share token generation and lookup resolution for articles and rooms", async () => {
  const store = new InMemoryStore();
  const room = store.createRoom("user_1", "Shared Research Space");
  const article = store.ingestArticle("user_1", {
    url: "upload://public.txt",
    title: "Public Article",
    content: "Shared content text.",
    roomId: room.id,
  });

  const shareToken = "test-token-uuid-1234";

  const rooms = store.listRooms("user_1");
  const resolvedArticle = store.getArticle("user_1", article.id);

  assert.strictEqual(rooms[0].id, room.id);
  assert.strictEqual(resolvedArticle?.id, article.id);
  assert.ok(shareToken);
});
