"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Type, Loader2, BookOpen, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { DictionaryPopover } from "@/components/DictionaryPopover";
import { ConceptSlideOver } from "@/components/ConceptSlideOver";
import { TextSelectionMenu } from "@/components/TextSelectionMenu";
import { EditHighlightPopover } from "@/components/EditHighlightPopover";
import { ExportArticleButton } from "@/components/ExportArticleButton";
import { ReaderTableOfContents } from "@/components/ReaderTableOfContents";
import { ShareDialog } from "@/components/ShareDialog";
import { logger } from "@/lib/logger";
import { formatArticleContentHtml, cleanArticleTitle } from "@/lib/reader-utils";

type HighlightType = {
  id: string;
  article_id: string;
  content: string;
  colour: string;
  note?: string | null;
  annotation_type?: string | null;
  position_start: number;
  position_end: number;
};

type FontFamily = "serif" | "sans";
type FontSize = "sm" | "base" | "lg" | "xl";
type ViewMode = "reader" | "native";
type SelectionType = { text: string; rect: DOMRect; contextSnippet: string } | null;
type ConceptType = { term: string; definition: string; contextSnippet: string } | null;
type EditingHighlightType = { highlight: HighlightType; rect: DOMRect } | null;

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const { article, loading, highlights, setHighlights, progress, setProgress } =
    useFetchArticle(articleId);

  // Settings & View Mode
  const [userViewMode, setUserViewMode] = useState<ViewMode | null>(null);
  const [fontFamily, setFontFamily] = useState<FontFamily>("serif");
  const [fontSize, setFontSize] = useState<FontSize>("base");

  const isPdfOrFile = Boolean(
    article &&
    (article.source_type === "pdf" ||
      Boolean(article.file_url) ||
      article.source_url?.startsWith("upload://") ||
      article.default_share_mode === "native")
  );

  const viewMode: ViewMode = userViewMode ?? (isPdfOrFile ? "native" : "reader");
  const setViewMode = (mode: ViewMode) => setUserViewMode(mode);

  const [showDictionary, setShowDictionary] = useState(false);
  const { activeSelection, setActiveSelection, handleMouseUp } = useTextSelection(showDictionary);
  const [concept, setConcept] = useState<{
    term: string;
    definition: string;
    contextSnippet: string;
  } | null>(null);
  const [editingHighlight, setEditingHighlight] = useState<{
    highlight: HighlightType;
    rect: DOMRect;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const highlightedHtml = useMemo(() => {
    if (!article) return { __html: "" };
    return formatArticleContentHtml(
      article.content || article.textContent || "",
      highlights,
      article.title
    );
  }, [article, highlights]);

  const handleScroll = useArticleScrollProgress(
    scrollRef,
    progress,
    setProgress,
    article,
    articleId
  );

  useContainerEvents(
    scrollRef,
    handleMouseUp,
    highlights,
    editingHighlight,
    setEditingHighlight,
    setActiveSelection
  );

  useReaderKeyboardShortcuts(article, setHighlights, setActiveSelection, setConcept);

  const { handleCreateHighlight, handleUpdateHighlight, handleDeleteHighlight } =
    useHighlightManager(
      article,
      activeSelection,
      setHighlights,
      setActiveSelection,
      setEditingHighlight
    );

  const handleSaveConcept = (word: string, definition: string) => {
    setShowDictionary(false);
    setActiveSelection(null);
    setConcept({
      term: word,
      definition,
      contextSnippet: activeSelection?.contextSnippet || "",
    });
  };

  useStreakLogger(articleId);
  const { swipeToast, handleTouchStart, handleTouchEnd } = useReaderSwipeNavigation(router);

  const typographyClass = getProseTypographyClass(fontFamily, fontSize);
  const readTimeMinutes = article?.read_time_minutes
    ? Number(article.read_time_minutes)
    : undefined;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <Button onClick={() => router.push("/library")}>Back to Library</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <ReaderHeader
        title={article.title}
        author={article.author}
        viewMode={viewMode}
        setViewMode={setViewMode}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        articleId={article.id}
        progress={progress}
        readTimeMinutes={readTimeMinutes}
        htmlContent={article.content || ""}
        scrollRef={scrollRef}
        onBack={() => router.push("/library")}
      />

      <Progress value={progress} className="h-1 rounded-none bg-muted/50" />

      <div className="flex flex-1 overflow-hidden relative">
        {viewMode === "native" ? (
          <NativeDocumentViewer article={article} />
        ) : (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`flex-1 overflow-y-auto px-6 py-12 scroll-smooth ${concept ? "md:mr-[400px]" : ""}`}
          >
            {swipeToast && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white text-xs font-bold px-4 py-2 shadow-lg tracking-wider uppercase animate-in fade-in zoom-in-95 pointer-events-none">
                {swipeToast}
              </div>
            )}
            <article className={typographyClass}>
              {article.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.cover_image}
                  alt="Cover"
                  className="w-full h-64 object-cover rounded-xl mb-8"
                />
              )}
              <h1 className="font-heading mb-8">{cleanArticleTitle(article.title)}</h1>
              <div dangerouslySetInnerHTML={highlightedHtml} />
            </article>
          </div>
        )}

        <ReaderPopovers
          activeSelection={activeSelection}
          showDictionary={showDictionary}
          concept={concept}
          editingHighlight={editingHighlight}
          articleId={article.id}
          roomId={article.room_id}
          onHighlight={handleCreateHighlight}
          onDefine={() => setShowDictionary(true)}
          onSaveConcept={handleSaveConcept}
          onCloseDictionary={() => {
            setShowDictionary(false);
            setActiveSelection(null);
            globalThis.getSelection()?.removeAllRanges();
          }}
          onCloseEditing={() => setEditingHighlight(null)}
          onUpdateHighlight={handleUpdateHighlight}
          onDeleteHighlight={handleDeleteHighlight}
          onCloseConcept={() => setConcept(null)}
        />
      </div>
    </div>
  );
}

function getProseTypographyClass(fontFamily: FontFamily, fontSize: FontSize): string {
  const fontClass = fontFamily === "serif" ? "font-serif" : "font-sans";
  const sizeMap: Record<FontSize, string> = {
    sm: "prose-sm",
    base: "prose-base",
    lg: "prose-lg",
    xl: "prose-xl",
  };
  return `mx-auto max-w-3xl prose prose-stone dark:prose-invert ${fontClass} ${sizeMap[fontSize] || "prose-base"} prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-6 prose-img:rounded-xl prose-img:shadow-md prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/60 prose-pre:rounded-lg prose-mark:bg-[#FCD116]/40 dark:prose-mark:bg-[#FCD116]/30 prose-mark:rounded-sm prose-mark:px-1 prose-mark:py-0.5`;
}

function NativeDocumentViewer({ article }: Readonly<{ article: Record<string, string> }>) {
  const isUpload =
    article.source_url?.startsWith("upload://") || article.source_url?.startsWith("file://");
  const iframeSrc = `/api/articles/${article.id}/raw`;

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/20">
      <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-card text-xs text-[#52525B]">
        <span>
          Viewing in native format:{" "}
          <strong className="text-foreground font-medium">{article.title}</strong>
        </span>
        {article.source_url && !isUpload && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline font-medium"
          >
            Open Original Source
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <div className="flex-1 w-full h-full relative">
        <iframe src={iframeSrc} title={article.title} className="w-full h-full border-0 bg-white" />
      </div>
    </div>
  );
}

function AppearanceDropdown({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
}: Readonly<{
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
}>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
        <Type className="w-4 h-4" />
        <span className="hidden sm:inline">Appearance</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Font Family</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setFontFamily("serif")}>
            <span className={`font-serif ${fontFamily === "serif" ? "font-bold" : ""}`}>Serif</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontFamily("sans")}>
            <span className={`font-sans ${fontFamily === "sans" ? "font-bold" : ""}`}>
              Sans-serif
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Font Size</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setFontSize("sm")}>
            <span className={fontSize === "sm" ? "font-bold" : ""}>Small</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontSize("base")}>
            <span className={fontSize === "base" ? "font-bold" : ""}>Medium</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontSize("lg")}>
            <span className={fontSize === "lg" ? "font-bold" : ""}>Large</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontSize("xl")}>
            <span className={fontSize === "xl" ? "font-bold" : ""}>Extra Large</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function useReaderKeyboardShortcuts(
  article: Record<string, string> | null,
  setHighlights: React.Dispatch<React.SetStateAction<HighlightType[]>>,
  setActiveSelection: (val: SelectionType) => void,
  setConcept: (val: ConceptType) => void
) {
  useEffect(() => {
    const createShortcutHighlight = async (articleId: string, content: string) => {
      try {
        const res = await fetch("/api/highlights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            article_id: articleId,
            content,
            colour: "ochre",
          }),
        });
        const newHighlight = await res.json();
        if (newHighlight?.id) {
          setHighlights((prev) => [newHighlight, ...prev]);
          setActiveSelection(null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      const sel = globalThis.getSelection();
      const selectedText = sel ? sel.toString().trim() : "";

      if (e.key.toLowerCase() === "h" && selectedText && article) {
        e.preventDefault();
        createShortcutHighlight(article.id, selectedText);
      } else if (e.key.toLowerCase() === "s" && selectedText) {
        e.preventDefault();
        let snippet = selectedText;
        if (sel?.anchorNode?.parentElement) {
          snippet = sel.anchorNode.parentElement.textContent || selectedText;
        }
        setConcept({
          term: selectedText,
          definition: "Searching term context...",
          contextSnippet: snippet,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [article, setHighlights, setActiveSelection, setConcept]);
}

function useContainerEvents(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  handleMouseUp: () => void,
  highlights: HighlightType[],
  editingHighlight: EditingHighlightType,
  setEditingHighlight: (val: EditingHighlightType) => void,
  setActiveSelection: (val: SelectionType) => void
) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onMouseUpContainer = () => {
      handleMouseUp();
    };

    const onClickContainer = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("mark");
      if (target?.dataset.highlightId) {
        const id = target.dataset.highlightId;
        const highlight = highlights.find((h) => h.id === id);
        if (highlight) {
          const rect = target.getBoundingClientRect();
          setEditingHighlight({ highlight, rect });
          setActiveSelection(null);
          globalThis.getSelection()?.removeAllRanges();
          return;
        }
      }

      if (editingHighlight) {
        setEditingHighlight(null);
      }
    };

    container.addEventListener("mouseup", onMouseUpContainer);
    container.addEventListener("click", onClickContainer);
    return () => {
      container.removeEventListener("mouseup", onMouseUpContainer);
      container.removeEventListener("click", onClickContainer);
    };
  }, [
    scrollRef,
    handleMouseUp,
    highlights,
    editingHighlight,
    setEditingHighlight,
    setActiveSelection,
  ]);
}

function useFetchArticle(articleId: string) {
  const [article, setArticle] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState<HighlightType[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
          setProgress(data.reading_progress || 0);
        }
        const hlRes = await fetch(`/api/highlights?articleId=${articleId}`);
        if (hlRes.ok) {
          setHighlights(await hlRes.json());
        }
      } catch (err) {
        logger.error("Error fetching article or highlights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  return { article, setArticle, loading, highlights, setHighlights, progress, setProgress };
}

function useArticleScrollProgress(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  progress: number,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  article: Record<string, string> | null,
  articleId: string
) {
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const totalScrollableDistance = scrollHeight - clientHeight;
    if (totalScrollableDistance <= 0) return;
    const currentProgress = Math.round((scrollTop / totalScrollableDistance) * 100);
    if (currentProgress > progress) {
      setProgress(Math.min(100, currentProgress));
    }
  }, [scrollRef, progress, setProgress]);

  useEffect(() => {
    return () => {
      if (article && progress > Number(article.reading_progress || 0)) {
        fetch(`/api/articles/${articleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reading_progress: progress,
            status: progress >= 95 ? "finished" : "in-progress",
          }),
        }).catch(console.error);
      }
    };
  }, [progress, articleId, article]);

  return handleScroll;
}

function useHighlightManager(
  article: Record<string, string> | null,
  activeSelection: SelectionType,
  setHighlights: React.Dispatch<React.SetStateAction<HighlightType[]>>,
  setActiveSelection: (val: SelectionType) => void,
  setEditingHighlight: (val: EditingHighlightType) => void
) {
  const handleCreateHighlight = async (color: string) => {
    if (!activeSelection || !article) return;

    const newHighlight = {
      article_id: article.id,
      content: activeSelection.text,
      colour: color,
      position_start: 0,
      position_end: 0,
    };

    const tempId = Date.now().toString();
    setHighlights((prev) => [...prev, { ...newHighlight, id: tempId }]);
    setActiveSelection(null);
    globalThis.getSelection()?.removeAllRanges();

    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHighlight),
      });
      if (res.ok) {
        const saved = await res.json();
        setHighlights((prev) => prev.map((h) => (h.id === tempId ? saved : h)));
      } else {
        setHighlights((prev) => prev.filter((h) => h.id !== tempId));
      }
    } catch (e) {
      logger.error(e);
      setHighlights((prev) => prev.filter((h) => h.id !== tempId));
    }
  };

  const handleUpdateHighlight = async (id: string, data: Partial<HighlightType>) => {
    setHighlights((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)));
    try {
      await fetch(`/api/highlights/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (e) {
      logger.error("Failed to update highlight", e);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    setEditingHighlight(null);
    try {
      await fetch(`/api/highlights/${id}`, { method: "DELETE" });
    } catch (e) {
      logger.error("Failed to delete highlight", e);
    }
  };

  return { handleCreateHighlight, handleUpdateHighlight, handleDeleteHighlight };
}

function useTextSelection(showDictionary: boolean) {
  const [activeSelection, setActiveSelection] = useState<{
    text: string;
    rect: DOMRect;
    contextSnippet: string;
  } | null>(null);

  const handleMouseUp = useCallback(() => {
    if (showDictionary) return;

    setTimeout(() => {
      const sel = globalThis.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        const text = sel.toString().trim();
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        let contextSnippet = "";
        const node = sel.anchorNode?.parentElement;
        contextSnippet = node?.textContent || "";
        if (contextSnippet.length > 200) {
          contextSnippet = contextSnippet.substring(0, 200) + "...";
        }

        setActiveSelection({ text, rect, contextSnippet });
      } else {
        setActiveSelection(null);
      }
    }, 10);
  }, [showDictionary]);

  return { activeSelection, setActiveSelection, handleMouseUp };
}

function ReaderHeader({
  title,
  author,
  viewMode,
  setViewMode,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  articleId,
  progress,
  readTimeMinutes,
  htmlContent,
  scrollRef,
  onBack,
}: Readonly<{
  title: string;
  author?: string | null;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  articleId: string;
  progress: number;
  readTimeMinutes?: number;
  htmlContent: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
}>) {
  const minutesLeft = Math.max(1, Math.ceil(((readTimeMinutes || 5) * (100 - progress)) / 100));

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur z-10 shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="font-heading font-semibold text-sm sm:text-base md:text-lg line-clamp-1 max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            {author && (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-sm">
                {author}
              </span>
            )}
            <span className="text-[10px] font-semibold text-[#D17659] bg-[#D17659]/10 px-1.5 py-0.5 rounded-sm">
              {progress >= 100 ? "Finished" : `${minutesLeft} min left`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {viewMode === "reader" && (
          <ReaderTableOfContents htmlContent={htmlContent} scrollRef={scrollRef} />
        )}

        <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
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
            <span>Reader</span>
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
            <span>Native</span>
          </button>
        </div>

        {viewMode === "reader" && (
          <AppearanceDropdown
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        )}

        <ShareDialog type="article" id={articleId} title={title} compact />
        <ExportArticleButton articleId={articleId} articleTitle={title} />
      </div>
    </header>
  );
}

function ReaderPopovers({
  activeSelection,
  showDictionary,
  concept,
  editingHighlight,
  articleId,
  roomId,
  onHighlight,
  onDefine,
  onSaveConcept,
  onCloseDictionary,
  onCloseEditing,
  onUpdateHighlight,
  onDeleteHighlight,
  onCloseConcept,
}: Readonly<{
  activeSelection: { text: string; rect: DOMRect; contextSnippet: string } | null;
  showDictionary: boolean;
  concept: { term: string; definition: string; contextSnippet: string } | null;
  editingHighlight: { highlight: HighlightType; rect: DOMRect } | null;
  articleId: string;
  roomId?: string | null;
  onHighlight: (color: string) => void;
  onDefine: () => void;
  onSaveConcept: (term: string, snippet: string) => void;
  onCloseDictionary: () => void;
  onCloseEditing: () => void;
  onUpdateHighlight: (id: string, data: Partial<HighlightType>) => void;
  onDeleteHighlight: (id: string) => void;
  onCloseConcept: () => void;
}>) {
  return (
    <>
      {activeSelection && !showDictionary && !concept && (
        <TextSelectionMenu
          rect={activeSelection.rect}
          onHighlight={onHighlight}
          onDefine={onDefine}
          onSaveConcept={() => onSaveConcept(activeSelection.text, activeSelection.contextSnippet)}
        />
      )}

      {showDictionary && activeSelection && (
        <DictionaryPopover
          word={activeSelection.text}
          rect={activeSelection.rect}
          onClose={onCloseDictionary}
          onSave={(w, d) => onSaveConcept(w, d)}
          onHighlight={() => {
            onCloseDictionary();
            onHighlight("ochre");
          }}
        />
      )}

      {editingHighlight && (
        <EditHighlightPopover
          highlight={editingHighlight.highlight}
          rect={editingHighlight.rect}
          onClose={onCloseEditing}
          onUpdate={onUpdateHighlight}
          onDelete={onDeleteHighlight}
          onDefine={() => {
            onDefine();
          }}
          onSaveConcept={() => {
            onSaveConcept(
              editingHighlight.highlight.content,
              editingHighlight.highlight.note || ""
            );
          }}
        />
      )}

      {concept && (
        <ConceptSlideOver
          term={concept.term}
          definition={concept.definition}
          contextSnippet={concept.contextSnippet}
          articleId={articleId}
          roomId={roomId ?? null}
          onClose={onCloseConcept}
        />
      )}
    </>
  );
}

function useStreakLogger(articleId: string) {
  useEffect(() => {
    if (!articleId) return;

    const interval = setInterval(() => {
      fetch("/api/user/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutesRead: 1 }),
      }).catch((err) => logger.error("Failed to log reading streak minute:", err));
    }, 60000);

    return () => clearInterval(interval);
  }, [articleId]);
}

function useReaderSwipeNavigation(router: ReturnType<typeof useRouter>) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeToast, setSwipeToast] = useState<string | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 75 && Math.abs(deltaY) < 50) {
      if (deltaX < 0) {
        setSwipeToast("Returning to Library →");
        setTimeout(() => router.push("/library"), 300);
      } else {
        setSwipeToast("← Navigating Back");
        setTimeout(() => router.back(), 300);
      }
    }
  };

  return { swipeToast, handleTouchStart, handleTouchEnd };
}
