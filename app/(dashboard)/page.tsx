import { BookOpen, Bookmark, Library, PenTool, Sparkles, BookA, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-heading font-bold">Good morning, Reader.</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <SectionSkeleton title="Continue Reading" icon={<BookOpen className="w-5 h-5 text-muted-foreground" />} message="You have no articles in progress. Save an article to start reading." />
          <SectionSkeleton title="Recently Saved" icon={<Bookmark className="w-5 h-5 text-muted-foreground" />} message="Your library is empty. Save something interesting from the web." />
          <SectionSkeleton title="My Rooms" icon={<Library className="w-5 h-5 text-muted-foreground" />} message="Create a room to organize your reading by theme." />
          <SectionSkeleton title="Highlights Review" icon={<PenTool className="w-5 h-5 text-muted-foreground" />} message="Highlight text while reading to see your notes here." />
        </div>

        {/* Sidebar Column */}
        <div className="flex flex-col gap-6">
          <SectionSkeleton title="Today's Rediscovery" icon={<Sparkles className="w-5 h-5 text-muted-foreground" />} message="Old highlights and insights will surface here over time." />
          <SectionSkeleton title="Vocabulary From Reading" icon={<BookA className="w-5 h-5 text-muted-foreground" />} message="Save words you want to remember to your Vault." />
          <SectionSkeleton title="Weekly Progress" icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />} message="Read your first article to start tracking your reading habit." />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ title, icon, message }: { title: string, icon: React.ReactNode, message: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center px-4 rounded-md border border-dashed border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
