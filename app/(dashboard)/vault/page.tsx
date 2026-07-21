import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { VaultContent } from "@/components/VaultContent";

export default async function VaultPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });

  if (!user) {
    return null;
  }

  const vaultEntries = await prisma.vaultEntry.findMany({
    where: { user_id: user.id },
    include: {
      vaultTrails: {
        include: {
          article: true,
          room: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="flex flex-col w-full font-sans">
      <VaultContent initialEntries={vaultEntries} />
    </div>
  );
}
