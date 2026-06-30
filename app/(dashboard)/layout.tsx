import { SaveArticleDialog } from "@/components/SaveArticleDialog";

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

        <nav className="flex flex-col gap-2 font-sans">
          <a href="/" className="hover:bg-primary/10 px-3 py-2 rounded-md transition-colors">Home</a>
          <a href="/library" className="hover:bg-primary/10 px-3 py-2 rounded-md transition-colors">Library</a>
          <a href="/rooms" className="hover:bg-primary/10 px-3 py-2 rounded-md transition-colors">My Rooms</a>
          <a href="/vault" className="hover:bg-primary/10 px-3 py-2 rounded-md transition-colors">Vault</a>
          <a href="/archive" className="hover:bg-primary/10 px-3 py-2 rounded-md transition-colors">Archive</a>
          <a href="/insights" className="hover:bg-primary/10 px-3 py-2 rounded-md transition-colors">Insights</a>
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
