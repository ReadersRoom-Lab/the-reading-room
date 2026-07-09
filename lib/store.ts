/* c8 ignore next */
export type Room = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverColor: string;
  mode: "reading";
  createdAt: string;
};

export type Article = {
  id: string;
  userId: string;
  roomId?: string;
  title: string;
  author?: string;
  sourceUrl: string;
  sourceType: string;
  content: string;
  coverImage?: string;
  readingProgress: number;
  status: "unread" | "in_progress" | "complete";
  wordCount: number;
  readTimeMinutes: number;
  dateAccessed: string;
  createdAt: string;
};

export type Highlight = {
  id: string;
  articleId: string;
  userId: string;
  content: string;
  colour: "amber" | "teal" | "coral";
  note?: string;
  positionStart: number;
  positionEnd: number;
  createdAt: string;
};

export class InMemoryStore {
  private readonly rooms: Room[] = [];
  private readonly articles: Article[] = [];
  private readonly highlights: Highlight[] = [];

  createRoom(userId: string, name: string, coverColor: string, description?: string): Room {
    const room: Room = {
      id: crypto.randomUUID(),
      userId,
      name,
      description,
      coverColor,
      mode: "reading",
      createdAt: new Date().toISOString(),
    };
    this.rooms.push(room);
    return room;
  }

  listRooms(userId: string): Room[] {
    return this.rooms.filter((room) => room.userId === userId);
  }

  ingestArticle(
    userId: string,
    payload: {
      url: string;
      roomId?: string;
      title?: string;
      content?: string;
      author?: string;
    }
  ): Article {
    const article: Article = {
      id: crypto.randomUUID(),
      userId,
      roomId: payload.roomId,
      title: payload.title ?? "Untitled article",
      author: payload.author,
      sourceUrl: payload.url,
      sourceType: "url",
      content: payload.content ?? "",
      readingProgress: 0,
      status: "unread",
      wordCount: payload.content?.split(/\s+/).filter(Boolean).length ?? 0,
      readTimeMinutes: Math.max(
        1,
        Math.ceil((payload.content?.split(/\s+/).filter(Boolean).length ?? 1) / 200)
      ),
      dateAccessed: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    this.articles.push(article);
    return article;
  }

  listArticles(userId: string): Article[] {
    return this.articles.filter((article) => article.userId === userId);
  }

  getArticle(userId: string, articleId: string): Article | undefined {
    return this.articles.find((article) => article.userId === userId && article.id === articleId);
  }

  createHighlight(
    userId: string,
    articleId: string,
    payload: {
      content: string;
      colour: Highlight["colour"];
      note?: string;
      positionStart: number;
      positionEnd: number;
    }
  ): Highlight {
    const highlight: Highlight = {
      id: crypto.randomUUID(),
      articleId,
      userId,
      content: payload.content,
      colour: payload.colour,
      note: payload.note,
      positionStart: payload.positionStart,
      positionEnd: payload.positionEnd,
      createdAt: new Date().toISOString(),
    };

    this.highlights.push(highlight);
    return highlight;
  }

  listHighlights(userId: string, articleId?: string): Highlight[] {
    return this.highlights.filter(
      (highlight) =>
        highlight.userId === userId && (!articleId || highlight.articleId === articleId)
    );
  }
}

/* c8 ignore next */
export const store = new InMemoryStore();
