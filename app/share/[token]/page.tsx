"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BookOpen, FileText, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SharedArticleData {
  id: string;
  title: string;
  author: string | null;
  source_url: string;
  source_type: string;
  content: string;
  cover_image: string | null;
  file_url: string | null;
  read_time_minutes: number;
  word_count: number;
  default_share_mode: "reader" | "native";
  owner: string;
  created_at: string;
  highlights?: Array<{
    id: string;
    content: string;
    colour: string;
    note?: string | null;
  }>;
}

interface SharedRoomData {
  id: string;
  name: string;
  description: string | null;
  cover_color: string;
  owner: string;
  articles: Array<{
    id: string;
    title: string;
    author: string | null;
    source_url: string;
    read_time_minutes: number;
  }>;
}

interface SharedLibraryData {
  owner: string;
  articles: Array<{
    id: string;
    title: string;
    author: string | null;
    source_url: string;
    read_time_minutes: number;
  }>;
}

type SharePayload =
  | { type: "article"; data: SharedArticleData }
  | { type: "room"; data: SharedRoomData }
  | { type: "library"; data: SharedLibraryData };

export default function SharedViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const initialView = searchParams.get("view");

  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"reader" | "native">("reader");

  useEffect(() => {
    async function fetchShare() {
      try {
        setLoading(true);
        const res = await fetch(`/api/share/${token}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Shared resource not found");
        }
        const data: SharePayload = await res.json();
        setPayload(data);

        if (data.type === "article") {
          if (initialView === "native" || initialView === "reader") {
            setViewMode(initialView);
          } else {
            setViewMode(data.data.default_share_mode || "reader");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load share link");
      } finally {
        setLoading(false);
      }
    }
    fetchShare();
  }, [token, initialView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-bold font-heading mb-2">Share Link Expired or Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error || "This link may have been revoked by the owner."}
        </p>
        <Link href="/">
          <Button variant="outline">Go to ReadrSpace Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Shared Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-heading font-extrabold text-lg text-primary">
            ReadrSpace
          </Link>
          <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
            Shared View
          </Badge>
        </div>

        {payload.type === "article" && (
          <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setViewMode("reader")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === "reader"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reader Version</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("native")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === "native"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Native Version</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {payload.type === "article" && (
          <SharedArticleView article={payload.data} viewMode={viewMode} />
        )}
        {payload.type === "room" && <SharedRoomView room={payload.data} />}
        {payload.type === "library" && <SharedLibraryView library={payload.data} />}
      </main>
    </div>
  );
}

function SharedArticleView({
  article,
  viewMode,
}: Readonly<{
  article: SharedArticleData;
  viewMode: "reader" | "native";
}>) {
  if (viewMode === "native") {
    const isUpload =
      article.source_url?.startsWith("upload://") || article.source_url?.startsWith("file://");
    const iframeSrc = article.file_url || (isUpload ? "" : article.source_url);

    return (
      <div className="w-full h-[calc(100vh-65px)] flex flex-col bg-muted/20">
        <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-card text-xs text-[#52525B]">
          <span>
            Viewing native version: <strong className="text-foreground">{article.title}</strong>
          </span>
          {article.source_url && !isUpload && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Open Original Source <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <iframe src={iframeSrc} title={article.title} className="w-full h-full border-0 bg-white" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8 border-b border-border pb-6">
        <p className="text-xs text-muted-foreground mb-2">
          Shared by <strong className="text-foreground font-semibold">{article.owner}</strong> •{" "}
          {article.read_time_minutes} min read
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">{article.title}</h1>
        {article.author && (
          <p className="text-sm text-muted-foreground mb-4">By {article.author}</p>
        )}
      </div>

      <article className="prose prose-stone dark:prose-invert max-w-none font-serif">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>

      {article.highlights && article.highlights.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-heading text-lg font-bold mb-4">
            Highlighted Passages ({article.highlights.length})
          </h3>
          <div className="flex flex-col gap-3">
            {article.highlights.map((h) => (
              <blockquote
                key={h.id}
                className="p-4 border-l-4 border-amber-500 bg-muted/30 text-sm"
              >
                <p className="font-medium text-foreground mb-1">“{h.content}”</p>
                {h.note && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Note:</strong> {h.note}
                  </p>
                )}
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SharedRoomView({ room }: Readonly<{ room: SharedRoomData }>) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="border-b border-border pb-6 mb-8">
        <p className="text-xs text-muted-foreground mb-1">Reading Room shared by {room.owner}</p>
        <h1 className="font-heading text-3xl font-bold">{room.name}</h1>
        {room.description && (
          <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
        )}
      </div>

      <h2 className="font-heading text-xl font-semibold mb-4">
        Articles in Room ({room.articles.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {room.articles.map((art) => (
          <div key={art.id} className="p-4 border border-border bg-card rounded-none">
            <h3 className="font-heading font-bold text-base mb-1">{art.title}</h3>
            {art.author && <p className="text-xs text-muted-foreground mb-2">By {art.author}</p>}
            <p className="text-xs text-muted-foreground">{art.read_time_minutes} min read</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SharedLibraryView({ library }: Readonly<{ library: SharedLibraryData }>) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="border-b border-border pb-6 mb-8">
        <p className="text-xs text-muted-foreground mb-1">Library shared by {library.owner}</p>
        <h1 className="font-heading text-3xl font-bold">{library.owner}&apos;s Reading Library</h1>
      </div>

      <h2 className="font-heading text-xl font-semibold mb-4">
        Saved Articles ({library.articles.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {library.articles.map((art) => (
          <div key={art.id} className="p-4 border border-border bg-card rounded-none">
            <h3 className="font-heading font-bold text-base mb-1">{art.title}</h3>
            {art.author && <p className="text-xs text-muted-foreground mb-2">By {art.author}</p>}
            <p className="text-xs text-muted-foreground">{art.read_time_minutes} min read</p>
          </div>
        ))}
      </div>
    </div>
  );
}
