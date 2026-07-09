import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { startOfDay, format, subDays, differenceInDays } from "date-fns";

function getCurrentStreak(activeDaysSorted: Date[]): number {
  const today = startOfDay(new Date());
  const lastActiveDay = startOfDay(activeDaysSorted[0]);
  const diffFromToday = differenceInDays(today, lastActiveDay);

  if (diffFromToday > 1) return 0;

  let tempStreak = 1;
  for (let i = 0; i < activeDaysSorted.length - 1; i++) {
    const currentDay = startOfDay(activeDaysSorted[i]);
    const prevDay = startOfDay(activeDaysSorted[i + 1]);
    const diff = differenceInDays(currentDay, prevDay);

    if (diff === 1) {
      tempStreak++;
    } else if (diff > 1) {
      break;
    }
  }
  return tempStreak;
}

function getLongestStreak(activeDaysSorted: Date[]): number {
  const activeDaysAsc = [...activeDaysSorted].reverse();
  let tempStreak = 1;
  let longestStreak = 1;

  for (let i = 0; i < activeDaysAsc.length - 1; i++) {
    const currentDay = startOfDay(activeDaysAsc[i]);
    const nextDay = startOfDay(activeDaysAsc[i + 1]);
    const diff = differenceInDays(nextDay, currentDay);

    if (diff === 1) {
      tempStreak++;
    } else if (diff > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  return Math.max(longestStreak, tempStreak);
}

function calculateStreaks(activeDaysSorted: Date[]) {
  if (activeDaysSorted.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  return {
    currentStreak: getCurrentStreak(activeDaysSorted),
    longestStreak: getLongestStreak(activeDaysSorted),
  };
}

function calculateGrowthData(vaultEntries: { created_at: string | Date }[]) {
  const growthData: { date: string; count: number }[] = [];
  let cumulativeCount = 0;
  const thirtyDaysAgo = subDays(new Date(), 30);

  vaultEntries.forEach((entry) => {
    if (new Date(entry.created_at) < thirtyDaysAgo) {
      cumulativeCount++;
    }
  });

  for (let i = 30; i >= 0; i--) {
    const dateObj = subDays(new Date(), i);
    const dateStr = format(dateObj, "yyyy-MM-dd");
    const dailyCount = vaultEntries.filter(
      (entry) => format(new Date(entry.created_at), "yyyy-MM-dd") === dateStr
    ).length;
    cumulativeCount += dailyCount;
    growthData.push({
      date: format(dateObj, "MMM dd"),
      count: cumulativeCount,
    });
  }
  return growthData;
}

function computeActivity(user: {
  articles: { created_at: Date | string }[];
  highlights: { created_at: Date | string }[];
  vaultEntries: { created_at: Date | string }[];
}) {
  const activityDates: string[] = [];

  user.articles.forEach((a) => activityDates.push(format(new Date(a.created_at), "yyyy-MM-dd")));
  user.highlights.forEach((h) => activityDates.push(format(new Date(h.created_at), "yyyy-MM-dd")));
  user.vaultEntries.forEach((v) =>
    activityDates.push(format(new Date(v.created_at), "yyyy-MM-dd"))
  );

  const activityCounts: Record<string, number> = {};
  activityDates.forEach((date) => {
    activityCounts[date] = (activityCounts[date] || 0) + 1;
  });

  return { activityDates, activityCounts };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            status: true,
            created_at: true,
            word_count: true,
          },
        },
        highlights: {
          select: {
            id: true,
            created_at: true,
          },
        },
        vaultEntries: {
          select: {
            id: true,
            created_at: true,
          },
        },
        rooms: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { articles: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // --- Compute Daily Activity Heatmap ---
    const { activityDates, activityCounts } = computeActivity(user);

    // --- Compute Reading Streaks ---
    const activeDaysSorted = Array.from(new Set(activityDates))
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    const { currentStreak, longestStreak } = calculateStreaks(activeDaysSorted);

    // --- Compute Knowledge Growth (Past 30 Days Cumulative) ---
    const growthData = calculateGrowthData(user.vaultEntries);

    // --- Most Active Rooms ---
    const roomsData = user.rooms
      .map((r: any) => ({
        name: r.name,
        articleCount: r._count.articles,
      }))
      .sort((a: any, b: any) => b.articleCount - a.articleCount)
      .slice(0, 5);

    return NextResponse.json({
      streaks: {
        current: currentStreak,
        longest: longestStreak,
      },
      activity: activityCounts,
      knowledgeGrowth: growthData,
      activeRooms: roomsData,
      totals: {
        articles: user.articles.length,
        highlights: user.highlights.length,
        vault: user.vaultEntries.length,
      },
    });
  } catch (error) {
    logger.error("Error compiling insights stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
