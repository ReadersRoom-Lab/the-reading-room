import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Fetch user articles & tag breakdown
    const articles = await prisma.article.findMany({
      where: { user_id: user.id },
      select: {
        id: true,
        status: true,
        word_count: true,
        read_time_minutes: true,
        tags: true,
        created_at: true,
        updated_at: true,
      },
    });

    const totalArticles = articles.length;
    const completedArticles = articles.filter(
      (a) => a.status === "archived" || a.status === "read"
    ).length;
    const totalWordsRead = articles.reduce((sum, a) => sum + (a.word_count || 0), 0);
    const avgWpm = 220; // Standard average reading speed benchmark

    // Calculate tag distribution
    const tagCounts: Record<string, number> = {};
    articles.forEach((a) => {
      if (Array.isArray(a.tags)) {
        a.tags.forEach((t) => {
          const formatted = t.startsWith("#") ? t : `#${t}`;
          tagCounts[formatted] = (tagCounts[formatted] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 2. Generate 365-day activity heatmap data
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 364); // Past 365 days

    const dailyActivity: Record<string, number> = {};

    // Populate article creation/reading activity dates
    articles.forEach((a) => {
      const dateKey = new Date(a.updated_at).toISOString().split("T")[0];
      dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + (a.read_time_minutes || 5);
    });

    // Also include today's reading minutes if logged
    const todayKey = now.toISOString().split("T")[0];
    if (user.reading_minutes_today > 0) {
      dailyActivity[todayKey] = Math.max(dailyActivity[todayKey] || 0, user.reading_minutes_today);
    }

    return NextResponse.json(
      {
        streakCount: user.streak_count || 0,
        dailyGoalMinutes: user.daily_goal_minutes || 15,
        readingMinutesToday: user.reading_minutes_today || 0,
        totalArticles,
        completedArticles,
        totalWordsRead,
        avgWpm,
        topTags,
        dailyActivity,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error fetching insights stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
