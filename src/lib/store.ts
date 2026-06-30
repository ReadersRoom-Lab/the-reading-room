import { getPrisma } from './prisma';

export type Room = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverColor: string;
  mode: 'reading';
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
  status: 'unread' | 'in_progress' | 'complete';
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
  colour: 'amber' | 'teal' | 'coral';
  note?: string;
  positionStart: number;
  positionEnd: number;
  createdAt: string;
};

export class InMemoryStore {
  private rooms: Room[] = [];
  private articles: Article[] = [];
  private highlights: Highlight[] = [];

  createRoom(userId: string, name: string, coverColor: string, description?: string): Room {
    const room: Room = {
      id: crypto.randomUUID(),
      userId,
      name,
      description,
      coverColor,
      mode: 'reading',
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
    },
  ): Article {
    const article: Article = {
      id: crypto.randomUUID(),
      userId,
      roomId: payload.roomId,
      title: payload.title ?? 'Untitled article',
      author: payload.author,
      sourceUrl: payload.url,
      sourceType: 'url',
      content: payload.content ?? '',
      readingProgress: 0,
      status: 'unread',
      wordCount: payload.content?.split(/\s+/).filter(Boolean).length ?? 0,
      readTimeMinutes: Math.max(1, Math.ceil((payload.content?.split(/\s+/).filter(Boolean).length ?? 1) / 200)),
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

  createHighlight(userId: string, articleId: string, payload: { content: string; colour: Highlight['colour']; note?: string; positionStart: number; positionEnd: number; }): Highlight {
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
    return this.highlights.filter((highlight) => highlight.userId === userId && (!articleId || highlight.articleId === articleId));
  }
}

class PrismaStore {
  private ensurePrisma() {
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error('DATABASE_URL is not configured');
    }
    return prisma;
  }

  async createRoom(userId: string, name: string, coverColor: string, description?: string): Promise<Room> {
    const client = this.ensurePrisma();
      const prisma = getPrisma();
      if (!prisma) throw new Error('Prisma not available');

      const room = await prisma.room.create({
      data: {
        userId,
        name,
        description: description ?? null,
        coverColor,
      },
    });

    return {
      id: room.id,
      userId: room.userId,
      name: room.name,
      description: room.description ?? undefined,
      coverColor: room.coverColor,
      mode: room.mode as 'reading',
      createdAt: room.createdAt.toISOString(),
    };
  }

  async listRooms(userId: string): Promise<Room[]> {
    const client = this.ensurePrisma();
      const prisma = getPrisma();
      if (!prisma) throw new Error('Prisma not available');

      const rooms = await prisma.room.findMany({ where: { userId } });
    return rooms.map((room) => ({
      id: room.id,
      userId: room.userId,
      name: room.name,
      description: room.description ?? undefined,
      coverColor: room.coverColor,
      mode: room.mode as 'reading',
      createdAt: room.createdAt.toISOString(),
    }));
  }

  async ingestArticle(
    userId: string,
    payload: {
      url: string;
      roomId?: string;
      title?: string;
      content?: string;
      author?: string;
    },
  ): Promise<Article> {
    const client = this.ensurePrisma();
    const article = await client.article.create({
      data: {
        userId,
        roomId: payload.roomId ?? null,
        title: payload.title ?? 'Untitled article',
        author: payload.author ?? null,
        sourceUrl: payload.url,
        content: payload.content ?? '',
        sourceType: 'url',
        wordCount: payload.content?.split(/\s+/).filter(Boolean).length ?? 0,
        readTimeMinutes: Math.max(1, Math.ceil((payload.content?.split(/\s+/).filter(Boolean).length ?? 1) / 200)),
      },
    });

    return {
      id: article.id,
      userId: article.userId,
      roomId: article.roomId ?? undefined,
      title: article.title,
      author: article.author ?? undefined,
      sourceUrl: article.sourceUrl,
      sourceType: article.sourceType,
      content: article.content,
      coverImage: article.coverImage ?? undefined,
      readingProgress: article.readingProgress,
      status: article.status as Article['status'],
      wordCount: article.wordCount,
      readTimeMinutes: article.readTimeMinutes,
      dateAccessed: article.dateAccessed.toISOString().slice(0, 10),
      createdAt: article.createdAt.toISOString(),
    };
  }

  async listArticles(userId: string): Promise<Article[]> {
    const client = this.ensurePrisma();
      const prisma = getPrisma();
      if (!prisma) throw new Error('Prisma not available');

      const articles = await prisma.article.findMany({ where: { userId } });
    return articles.map((article) => ({
      id: article.id,
      userId: article.userId,
      roomId: article.roomId ?? undefined,
      title: article.title,
      author: article.author ?? undefined,
      sourceUrl: article.sourceUrl,
      sourceType: article.sourceType,
      content: article.content,
      coverImage: article.coverImage ?? undefined,
      readingProgress: article.readingProgress,
      status: article.status as Article['status'],
      wordCount: article.wordCount,
      readTimeMinutes: article.readTimeMinutes,
      dateAccessed: article.dateAccessed.toISOString().slice(0, 10),
      createdAt: article.createdAt.toISOString(),
    }));
  }

  async getArticle(userId: string, articleId: string): Promise<Article | undefined> {
    const client = this.ensurePrisma();
      const prisma = getPrisma();
      if (!prisma) throw new Error('Prisma not available');

      const article = await prisma.article.findFirst({ where: { userId, id: articleId } });
    if (!article) {
      return undefined;
    }
    return {
      id: article.id,
      userId: article.userId,
      roomId: article.roomId ?? undefined,
      title: article.title,
      author: article.author ?? undefined,
      sourceUrl: article.sourceUrl,
      sourceType: article.sourceType,
      content: article.content,
      coverImage: article.coverImage ?? undefined,
      readingProgress: article.readingProgress,
      status: article.status as Article['status'],
      wordCount: article.wordCount,
      readTimeMinutes: article.readTimeMinutes,
      dateAccessed: article.dateAccessed.toISOString().slice(0, 10),
      createdAt: article.createdAt.toISOString(),
    };
  }

  async createHighlight(userId: string, articleId: string, payload: { content: string; colour: Highlight['colour']; note?: string; positionStart: number; positionEnd: number; }): Promise<Highlight> {
    const client = this.ensurePrisma();
      const prisma = getPrisma();
      if (!prisma) throw new Error('Prisma not available');

      const highlight = await prisma.highlight.create({
      data: {
        articleId,
        userId,
        content: payload.content,
        colour: payload.colour,
        note: payload.note ?? null,
        positionStart: payload.positionStart,
        positionEnd: payload.positionEnd,
      },
    });

    return {
      id: highlight.id,
      articleId: highlight.articleId,
      userId: highlight.userId,
      content: highlight.content,
      colour: highlight.colour as Highlight['colour'],
      note: highlight.note ?? undefined,
      positionStart: highlight.positionStart,
      positionEnd: highlight.positionEnd,
      createdAt: highlight.createdAt.toISOString(),
    };
  }

  async listHighlights(userId: string, articleId?: string): Promise<Highlight[]> {
    const client = this.ensurePrisma();
      const prisma = getPrisma();
      if (!prisma) throw new Error('Prisma not available');

      const highlights = await prisma.highlight.findMany({ where: { userId, ...(articleId ? { articleId } : {}) } });
    return highlights.map((highlight) => ({
      id: highlight.id,
      articleId: highlight.articleId,
      userId: highlight.userId,
      content: highlight.content,
      colour: highlight.colour as Highlight['colour'],
      note: highlight.note ?? undefined,
      positionStart: highlight.positionStart,
      positionEnd: highlight.positionEnd,
      createdAt: highlight.createdAt.toISOString(),
    }));
  }
}

class HybridStore {
  private memoryStore = new InMemoryStore();
  private prismaStore = new PrismaStore();
  private useDatabase = Boolean(process.env.DATABASE_URL);

  private async withFallback<T>(operation: () => Promise<T>, fallback: () => T): Promise<T> {
    if (!this.useDatabase) {
      return fallback();
    }

    try {
      return await operation();
    } catch {
      this.useDatabase = false;
      return fallback();
    }
  }

  async createRoom(userId: string, name: string, coverColor: string, description?: string): Promise<Room> {
    return this.withFallback(
      () => this.prismaStore.createRoom(userId, name, coverColor, description),
      () => this.memoryStore.createRoom(userId, name, coverColor, description),
    );
  }

  async listRooms(userId: string): Promise<Room[]> {
    return this.withFallback(
      () => this.prismaStore.listRooms(userId),
      () => this.memoryStore.listRooms(userId),
    );
  }

  async ingestArticle(userId: string, payload: { url: string; roomId?: string; title?: string; content?: string; author?: string; }): Promise<Article> {
    return this.withFallback(
      () => this.prismaStore.ingestArticle(userId, payload),
      () => this.memoryStore.ingestArticle(userId, payload),
    );
  }

  async listArticles(userId: string): Promise<Article[]> {
    return this.withFallback(
      () => this.prismaStore.listArticles(userId),
      () => this.memoryStore.listArticles(userId),
    );
  }

  async getArticle(userId: string, articleId: string): Promise<Article | undefined> {
    return this.withFallback(
      () => this.prismaStore.getArticle(userId, articleId),
      () => this.memoryStore.getArticle(userId, articleId),
    );
  }

  async createHighlight(userId: string, articleId: string, payload: { content: string; colour: Highlight['colour']; note?: string; positionStart: number; positionEnd: number; }): Promise<Highlight> {
    return this.withFallback(
      () => this.prismaStore.createHighlight(userId, articleId, payload),
      () => this.memoryStore.createHighlight(userId, articleId, payload),
    );
  }

  async listHighlights(userId: string, articleId?: string): Promise<Highlight[]> {
    return this.withFallback(
      () => this.prismaStore.listHighlights(userId, articleId),
      () => this.memoryStore.listHighlights(userId, articleId),
    );
  }
}

export const store = new HybridStore();
