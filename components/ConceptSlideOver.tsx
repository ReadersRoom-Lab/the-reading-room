import { useState, useRef, useEffect } from "react";
import { X, Bookmark, Edit3, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

interface ConceptSlideOverProps {
  term: string;
  definition?: string;
  contextSnippet: string;
  articleId: string;
  roomId: string | null;
  onClose: () => void;
}

export function ConceptSlideOver({
  term,
  definition = "",
  contextSnippet,
  articleId,
  roomId,
  onClose,
}: Readonly<ConceptSlideOverProps>) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [definitionText, setDefinitionText] = useState(definition);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [etymology, setEtymology] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");

  useEffect(() => {
    // If no definition is provided, fetch it from Wikipedia
    if (!definition) {
      const fetchWikipediaConcept = async () => {
        setIsFetching(true);
        try {
          const res = await fetch(
            `/api/vault/lookup/concept?term=${encodeURIComponent(term)}&passage=${encodeURIComponent(contextSnippet)}`
          );
          if (res.ok) {
            const data = await res.json();
            setDefinitionText(data.definition || "");
            setThumbnailUrl(data.thumbnail || "");
            setSourceUrl(data.sourceUrl || "");
            setEtymology(data.etymology || "");
            setPronunciation(data.pronunciation || "");
            setExampleSentence(data.exampleSentence || "");
          } else {
            setDefinitionText("No Wikipedia article or definition was found for this concept.");
          }
        } catch (err) {
          logger.error("Error fetching Wikipedia concept", err);
          setDefinitionText("An error occurred while fetching the definition.");
        } finally {
          setIsFetching(false);
        }
      };
      fetchWikipediaConcept();
    }
  }, [term, definition, contextSnippet]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term,
          definition: definitionText,
          passage: contextSnippet,
          article_id: articleId,
          room_id: roomId,
          type: "concept",
          user_note: note,
          etymology,
          pronunciation,
          example_sentence: exampleSentence,
        }),
      });
      if (res.ok) {
        toast.success("Saved to Vocabulary Vault");
        router.refresh();
        onClose();
      } else {
        toast.error("Failed to save to Vault");
      }
    } catch (e: unknown) {
      logger.error(e);
      toast.error("Error saving to Vault");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] border-l border-border bg-[#FCFBF8] shrink-0 flex flex-col animate-in slide-in-from-right-full z-20 shadow-2xl font-sans">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        <span className="inline-block px-2 py-1 border border-[#D17659] text-[#D17659] text-[9px] font-bold tracking-widest uppercase mb-4">
          Concept
        </span>

        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-4xl font-heading font-bold text-[#1a1a1a]">{term}</h2>
          {pronunciation && (
            <span className="text-xs font-mono text-[#8C8C8C]">{pronunciation}</span>
          )}
        </div>

        {isFetching ? (
          <div className="space-y-4 animate-pulse mb-10">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        ) : (
          <>
            {thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt={term}
                className="w-full h-48 object-cover rounded-lg border border-border/50 mb-6 shadow-sm"
              />
            )}

            <p className="text-[#333] font-source-serif text-lg leading-relaxed mb-4">
              {definitionText || "Definition not provided."}
            </p>

            {etymology && (
              <div className="bg-[#FAF9F5] border border-[#E6C79C]/30 p-4 mb-4 text-xs font-sans text-[#52525B]">
                <span className="block font-bold text-[#E6C79C] uppercase tracking-wider text-[9px] mb-1 font-sans">
                  Origin & Etymology
                </span>
                <p className="leading-relaxed font-source-serif italic text-xs text-[#333]">
                  {etymology}
                </p>
              </div>
            )}

            {sourceUrl && (
              <div className="mb-10">
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary underline transition-colors"
                >
                  Read more on Wikipedia <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </>
        )}

        <div className="mb-10">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">
            Context in Article
          </p>
          <div className="p-6 bg-white border border-border/50 text-[#1a1a1a] font-source-serif italic text-sm leading-relaxed shadow-sm">
            &quot;{contextSnippet}&quot;
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">
            Add Note
          </p>
          <textarea
            ref={noteInputRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[100px] p-4 text-sm bg-white border border-input focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] font-source-serif"
            placeholder="Your thoughts..."
            disabled={isFetching}
          />
        </div>
      </div>

      <div className="p-6 border-t border-border bg-white mt-auto flex flex-col gap-3">
        <Button
          className="w-full h-12 text-base font-semibold bg-[#1a1a1a] text-white hover:bg-[#444444] hover:text-white rounded-none transition-colors"
          onClick={handleSave}
          disabled={loading || isFetching}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Bookmark className="w-5 h-5 mr-2" />
          )}
          Save to Vault
        </Button>
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            className="w-full h-10 text-sm font-semibold rounded-none border-border hover:bg-muted text-muted-foreground"
            onClick={() => noteInputRef.current?.focus()}
            disabled={isFetching}
          >
            <Edit3 className="w-4 h-4 mr-2" /> Add Note
          </Button>
        </div>
      </div>
    </aside>
  );
}
