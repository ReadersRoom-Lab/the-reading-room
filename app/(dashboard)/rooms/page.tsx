import { Library } from "lucide-react";

export default function RoomsPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <h1 className="text-4xl font-heading font-bold">My Rooms</h1>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border rounded-xl bg-card">
        <Library className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-heading font-semibold mb-2">No rooms created yet</h2>
        <p className="text-muted-foreground max-w-sm text-center">Rooms are themed shelves where you can organize your saved articles.</p>
      </div>
    </div>
  );
}
