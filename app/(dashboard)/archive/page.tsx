import { Archive } from "lucide-react";

export default function ArchivePage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <h1 className="text-4xl font-heading font-bold">Archive</h1>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border rounded-xl bg-card">
        <Archive className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-heading font-semibold mb-2">Nothing in the archive</h2>
        <p className="text-muted-foreground max-w-sm text-center">Finished articles and deleted items will appear here.</p>
      </div>
    </div>
  );
}
