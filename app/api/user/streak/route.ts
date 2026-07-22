import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isYesterday(d1: Date, d2: Date): boolean {
  const yesterday = new Date(d2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d1, yesterday);
}

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

    const now = new Date();
    let streakCount = user.streak_count || 0;
    let readingMinutesToday = user.reading_minutes_today || 0;

    if (user.last_read_date) {
      const lastRead = new Date(user.last_read_date);
      // Reset today's minutes if last read date was before today
      if (!isSameDay(lastRead, now)) {
        readingMinutesToday = 0;
      }
      // Reset streak count if last read date was before yesterday and not today
      if (!isSameDay(lastRead, now) && !isYesterday(lastRead, now)) {
        streakCount = 0;
      }
    }

    return NextResponse.json(
      {
        streakCount,
        dailyGoalMinutes: user.daily_goal_minutes || 15,
        readingMinutesToday,
        lastReadDate: user.last_read_date,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error fetching streak data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = await req.json().catch(() => ({}));
    const minutesRead =
      typeof body.minutesRead === "number" && body.minutesRead > 0 ? body.minutesRead : 1;

    const now = new Date();
    let newStreak = user.streak_count || 0;
    let newTodayMinutes = user.reading_minutes_today || 0;

    if (!user.last_read_date) {
      newStreak = 1;
      newTodayMinutes = minutesRead;
    } else {
      const lastRead = new Date(user.last_read_date);
      if (isSameDay(lastRead, now)) {
        newTodayMinutes += minutesRead;
      } else if (isYesterday(lastRead, now)) {
        newStreak += 1;
        newTodayMinutes = minutesRead;
      } else {
        newStreak = 1;
        newTodayMinutes = minutesRead;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        streak_count: newStreak,
        reading_minutes_today: newTodayMinutes,
        last_read_date: now,
      },
    });

    return NextResponse.json(
      {
        streakCount: updatedUser.streak_count,
        dailyGoalMinutes: updatedUser.daily_goal_minutes,
        readingMinutesToday: updatedUser.reading_minutes_today,
        lastReadDate: updatedUser.last_read_date,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error updating reading streak:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
