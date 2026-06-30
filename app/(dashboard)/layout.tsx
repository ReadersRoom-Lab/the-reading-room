import { SaveArticleDialog } from "@/components/SaveArticleDialog";
import { Home, Library, LayoutGrid, BookMarked, User } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <aside className="w-64 border-r border-border bg-sidebar shrink-0 p-6 flex flex-col gap-4">
        <div className="font-heading font-bold text-xl mb-6 text-sidebar-primary">
          The Reading Room
        </div>
        
        <SaveArticleDialog />

        <nav className="flex flex-col gap-1 font-sans">
          <Link href="/home" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link href="/library" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Library className="w-4 h-4" /> Library
          </Link>
          <Link href="/rooms" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <LayoutGrid className="w-4 h-4" /> My Rooms
          </Link>
          <Link href="/vault" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-zinc-900 text-zinc-50 transition-colors">
            <BookMarked className="w-4 h-4" /> Vault
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mt-2">
            <User className="w-4 h-4" /> Profile
          </Link>
        </nav>
      </aside>
      
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-8">
          {children}
        </div>
      </main>
    </>
  );
}
