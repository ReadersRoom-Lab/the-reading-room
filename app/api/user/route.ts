import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      user = await prisma.user.create({
        data: {
          clerk_id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Reader",
        },
      });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  let user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });

  if (user) {
    // Only allow updating name and tier for now
    const allowedData: Record<string, string> = {};
    if (data.name !== undefined) allowedData.name = data.name;
    if (data.tier !== undefined) allowedData.tier = data.tier;

    user = await prisma.user.update({
      where: { clerk_id: userId },
      data: allowedData,
    });
  } else {
    const clerkUser = await currentUser();
    if (clerkUser) {
      user = await prisma.user.create({
        data: {
          clerk_id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name:
            data.name ||
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            "Reader",
        },
      });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }

  return NextResponse.json(user);
}
