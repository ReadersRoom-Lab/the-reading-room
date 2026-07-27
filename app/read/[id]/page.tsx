"use client";

import { Tooltip } from "@/components/ui/tooltip";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Type,
  Loader2,
  BookOpen,
  FileText,
  ExternalLink,
  Volume2,
  Sparkles,
  Keyboard,
  Globe,
  Clock,
  BookCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";
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
import { ReaderAudioPlayer } from "@/components/ReaderAudioPlayer";
import { ImageLightboxModal } from "@/components/ImageLightboxModal";
import { ReaderShortcutsModal } from "@/components/ReaderShortcutsModal";
import { logger } from "@/lib/logger";
import {
  formatArticleContentHtml,
  cleanArticleTitle,
  getArticleSourceDomain,
} from "@/lib/reader-utils";

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

type FontFamily = "serif" | "sans" | "mono";
type FontSize = "sm" | "base" | "lg" | "xl";
type LineHeight = "compact" | "normal" | "relaxed";
type ThemeMode = "paper" | "sepia" | "mint" | "dark" | "oled";
type WidthMode = "compact" | "classic" | "wide";
type ViewMode = "reader" | "native";
type SelectionType = { text: string; rect: DOMRect; contextSnippet: string } | null;
type ConceptType = { term: string; definition: string; contextSnippet: string } | null;
type EditingHighlightType = { highlight: HighlightType; rect: DOMRect } | null;

interface ReaderShortcutsParams {
  article: Record<string, string> | null;
  setHighlights: React.Dispatch<React.SetStateAction<HighlightType[]>>;
  setActiveSelection: (val: SelectionType) => void;
  setConcept: (val: ConceptType) => void;
  setIsBionic: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  setViewMode: (v: ViewMode) => void;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const { article, loading, highlights, setHighlights, progress, setProgress } =
    useFetchArticle(articleId);

  // Appearance & Reader Preferences
  const [userViewMode, setUserViewMode] = useState<ViewMode | null>(null);
  const [fontFamily, setFontFamily] = useState<FontFamily>("serif");
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [lineHeight, setLineHeight] = useState<LineHeight>("normal");
  const [themeMode, setThemeMode] = useState<ThemeMode>("paper");
  const [widthMode, setWidthMode] = useState<WidthMode>("classic");
  const [isBionic, setIsBionic] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Audio & Interactive Modals
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const isPdfOrFile = Boolean(
    article &&
    (article.source_type === "pdf" ||
      Boolean(article.file_url) ||
      article.source_url?.startsWith("upload://") ||
      article.default_share_mode === "native")
  );

  let defaultViewMode: ViewMode = "reader";
  if (isPdfOrFile) {
    defaultViewMode = "native";
  }
  const viewMode: ViewMode = userViewMode ?? defaultViewMode;
  const setViewMode = (mode: ViewMode) => setUserViewMode(mode);

  const [showDictionary, setShowDictionary] = useState(false);
  const { activeSelection, setActiveSelection, handleMouseUp } = useTextSelection(showDictionary);
  const [concept, setConcept] = useState<ConceptType>(null);
  const [editingHighlight, setEditingHighlight] = useState<EditingHighlightType>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const highlightedHtml = useMemo(() => {
    if (!article) return { __html: "" };
    return formatArticleContentHtml(
      article.content || article.textContent || "",
      highlights,
      article.title,
      isBionic
    );
  }, [article, highlights, isBionic]);

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
    setActiveSelection,
    setLightboxSrc
  );

  useReaderKeyboardShortcuts({
    article,
    setHighlights,
    setActiveSelection,
    setConcept,
    setIsBionic,
    setIsFocusMode,
    setThemeMode,
    setViewMode,
    setShowShortcuts,
  });

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

  const proseClass = getProseTypographyClass(fontFamily, fontSize, widthMode, lineHeight);
  const themeContainerClass = getThemeContainerClass(themeMode);
  const sourceDomain = article ? getArticleSourceDomain(article.source_url) : null;
  const wordCount = article?.word_count ? Number(article.word_count) : 0;
  const computedReadTime = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 5;
  const readTimeMinutes = article?.read_time_minutes
    ? Number(article.read_time_minutes)
    : computedReadTime;

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
    <div
      className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${themeContainerClass}`}
    >
      {!isFocusMode && (
        <ReaderHeader
          title={article.title}
          author={article.author}
          viewMode={viewMode}
          setViewMode={setViewMode}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          widthMode={widthMode}
          setWidthMode={setWidthMode}
          isBionic={isBionic}
          setIsBionic={setIsBionic}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          showAudioPlayer={showAudioPlayer}
          setShowAudioPlayer={setShowAudioPlayer}
          setShowShortcuts={setShowShortcuts}
          articleId={article.id}
          progress={progress}
          readTimeMinutes={readTimeMinutes}
          htmlContent={article.content || ""}
          scrollRef={scrollRef}
          onBack={() => router.push("/library")}
        />
      )}

      {isFocusMode && (
        <div className="fixed top-3 right-4 z-50 animate-in fade-in">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsFocusMode(false)}
            className="h-8 px-3 text-xs font-semibold gap-1.5 shadow-xl bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#333] border-0 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus (F)</span>
          </Button>
        </div>
      )}

      <Progress value={progress} className="h-1 rounded-none bg-muted/30" />

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

            <article className={proseClass}>
              {/* Editorial Header Card */}
              <div className="mb-10 pb-8 border-b border-border/40">
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium">
                  {sourceDomain && (
                    <span className="inline-flex items-center gap-1 bg-[#1A1A1A]/10 text-[#1A1A1A] px-2.5 py-1 rounded-md">
                      <Globe className="w-3 h-3" />
                      {sourceDomain}
                    </span>
                  )}
                  {readTimeMinutes && (
                    <span className="inline-flex items-center gap-1 bg-[#F0EDEA] px-2.5 py-1 rounded-md text-[#52525B]">
                      <Clock className="w-3 h-3" />
                      {readTimeMinutes} min read
                    </span>
                  )}
                  {progress > 0 && (
                    <span className="inline-flex items-center gap-1 bg-[#F0EDEA] px-2.5 py-1 rounded-md text-[#52525B] font-mono">
                      <BookCheck className="w-3 h-3" />
                      {progress}% complete
                    </span>
                  )}
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4 text-inherit">
                  {cleanArticleTitle(article.title)}
                </h1>

                {article.author && (
                  <p className="text-base font-medium italic text-[#52525B]">By {article.author}</p>
                )}
              </div>

              {article.cover_image && (
                <button
                  type="button"
                  onClick={() => setLightboxSrc(article.cover_image)}
                  className="w-full mb-12 rounded-2xl overflow-hidden shadow-xl cursor-pointer hover:opacity-95 transition-opacity border-0 p-0 text-left bg-transparent block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.cover_image}
                    alt="Cover graphic"
                    className="w-full h-72 object-cover rounded-2xl"
                  />
                </button>
              )}

              <div dangerouslySetInnerHTML={highlightedHtml} />
            </article>
          </div>
        )}

        <ReaderPopovers
          activeSelection={activeSelection}
          concept={concept}
          editingHighlight={editingHighlight}
          showDictionary={showDictionary}
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

        {/* Mobile Sanctuary Bottom Bar */}
        {viewMode === "reader" && !isFocusMode && (
          <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 bg-background/95 backdrop-blur border border-border/80 shadow-xl rounded-full px-4 py-2 flex items-center justify-around">
            <Button
              variant={showAudioPlayer ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2 text-xs flex items-center gap-1 cursor-pointer rounded-full"
              onClick={() => setShowAudioPlayer((prev) => !prev)}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio</span>
            </Button>
            <ReaderTableOfContents htmlContent={article.content || ""} scrollRef={scrollRef} />
            <Button
              variant={isBionic ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2 text-xs flex items-center gap-1 cursor-pointer rounded-full"
              onClick={() => setIsBionic((prev) => !prev)}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isBionic ? "Bionic On" : "Bionic"}</span>
            </Button>
            <Button
              variant={isFocusMode ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2 text-xs flex items-center gap-1 cursor-pointer rounded-full"
              onClick={() => setIsFocusMode(true)}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Focus</span>
            </Button>
          </div>
        )}

        {showAudioPlayer && (
          <ReaderAudioPlayer
            textContent={article.content || article.textContent || ""}
            articleTitle={article.title}
            onClose={() => setShowAudioPlayer(false)}
            hasBottomBar={viewMode === "reader" && !isFocusMode}
          />
        )}

        {lightboxSrc && (
          <ImageLightboxModal src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        )}

        <ReaderShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    </div>
  );
}

function getThemeContainerClass(theme: ThemeMode): string {
  switch (theme) {
    case "sepia":
      return "bg-[#F4ECD8] text-[#433422]";
    case "mint":
      return "bg-[#ECFDF5] text-[#064E3B]";
    case "dark":
      return "bg-[#18181B] text-[#E4E4E7]";
    case "oled":
      return "bg-[#09090B] text-[#F1F5F9]";
    case "paper":
    default:
      return "bg-[#FAF9F6] text-[#242424]";
  }
}

function getProseTypographyClass(
  fontFamily: FontFamily,
  fontSize: FontSize,
  width: WidthMode,
  lineHeight: LineHeight = "normal"
): string {
  const fontClass =
    fontFamily === "serif" ? "font-serif" : fontFamily === "mono" ? "font-mono" : "font-sans";

  const widthMap: Record<WidthMode, string> = {
    compact: "max-w-xl",
    classic: "max-w-2xl",
    wide: "max-w-3xl",
  };

  const sizeMap: Record<FontSize, string> = {
    sm: "prose-sm text-[16px]",
    base: "prose-base text-[18px]",
    lg: "prose-lg text-[20px]",
    xl: "prose-xl text-[22px]",
  };

  const leadingMap: Record<LineHeight, string> = {
    compact: "prose-p:leading-[1.5]",
    normal: "prose-p:leading-[1.85]",
    relaxed: "prose-p:leading-[2.2]",
  };

  return `mx-auto ${widthMap[width]} prose ${fontClass} ${sizeMap[fontSize]} prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight ${leadingMap[lineHeight]} prose-p:mb-8 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-8 prose-img:rounded-2xl prose-img:shadow-lg prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/60 prose-pre:rounded-xl prose-mark:bg-[#FCD116]/40 dark:prose-mark:bg-[#FCD116]/30 prose-mark:rounded-sm prose-mark:px-1 prose-mark:py-0.5`;
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

function ThemeButtons({
  themeMode,
  setThemeMode,
}: Readonly<{
  themeMode: ThemeMode;
  setThemeMode: (t: ThemeMode) => void;
}>) {
  const themes: { id: ThemeMode; label: string; bg: string; text: string }[] = [
    { id: "paper", label: "Paper", bg: "bg-[#FAF9F6]", text: "text-[#242424]" },
    { id: "sepia", label: "Sepia", bg: "bg-[#F4ECD8]", text: "text-[#433422]" },
    { id: "mint", label: "Mint", bg: "bg-[#ECFDF5]", text: "text-[#064E3B]" },
    { id: "dark", label: "Dark", bg: "bg-[#18181B]", text: "text-[#E4E4E7]" },
    { id: "oled", label: "OLED", bg: "bg-[#09090B]", text: "text-[#F1F5F9]" },
  ];

  return (
    <div className="grid grid-cols-5 gap-1.5 p-1 mb-2">
      {themes.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setThemeMode(t.id)}
          className={`h-7 rounded-md border text-[11px] font-medium flex items-center justify-center ${t.bg} ${t.text} cursor-pointer ${
            themeMode === t.id ? "border-primary ring-1 ring-primary font-bold" : "border-border"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function WidthButtons({
  widthMode,
  setWidthMode,
}: Readonly<{
  widthMode: WidthMode;
  setWidthMode: (w: WidthMode) => void;
}>) {
  const widths: { id: WidthMode; label: string }[] = [
    { id: "compact", label: "Compact" },
    { id: "classic", label: "Classic" },
    { id: "wide", label: "Wide" },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 p-1 mb-2">
      {widths.map((w) => (
        <button
          key={w.id}
          type="button"
          onClick={() => setWidthMode(w.id)}
          className={`h-7 rounded text-[11px] font-medium border cursor-pointer ${
            widthMode === w.id
              ? "bg-primary text-primary-foreground font-bold"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}

function AppearanceDropdown({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  themeMode,
  setThemeMode,
  widthMode,
  setWidthMode,
  isBionic,
  setIsBionic,
}: Readonly<{
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  lineHeight: LineHeight;
  setLineHeight: (l: LineHeight) => void;
  themeMode: ThemeMode;
  setThemeMode: (t: ThemeMode) => void;
  widthMode: WidthMode;
  setWidthMode: (w: WidthMode) => void;
  isBionic: boolean;
  setIsBionic: React.Dispatch<React.SetStateAction<boolean>>;
}>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title="Appearance settings"
        aria-label="Appearance settings"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer"
      >
        <Type className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Theme
          </DropdownMenuLabel>
          <ThemeButtons themeMode={themeMode} setThemeMode={setThemeMode} />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Font Family
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setFontFamily("serif")}>
            <span
              className={`font-serif ${fontFamily === "serif" ? "font-bold text-primary" : ""}`}
            >
              Serif (Source Serif)
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontFamily("sans")}>
            <span className={`font-sans ${fontFamily === "sans" ? "font-bold text-primary" : ""}`}>
              Sans (Inter)
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontFamily("mono")}>
            <span className={`font-mono ${fontFamily === "mono" ? "font-bold text-primary" : ""}`}>
              Mono (Geist)
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Column Width
          </DropdownMenuLabel>
          <WidthButtons widthMode={widthMode} setWidthMode={setWidthMode} />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Font Size
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setFontSize("sm")}>
            <span className={fontSize === "sm" ? "font-bold text-primary" : ""}>Small (16px)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontSize("base")}>
            <span className={fontSize === "base" ? "font-bold text-primary" : ""}>
              Medium (18px)
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontSize("lg")}>
            <span className={fontSize === "lg" ? "font-bold text-primary" : ""}>Large (20px)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontSize("xl")}>
            <span className={fontSize === "xl" ? "font-bold text-primary" : ""}>
              Extra Large (22px)
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Line Spacing
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setLineHeight("compact")}>
            <span className={lineHeight === "compact" ? "font-bold text-primary" : ""}>
              Compact (1.5)
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLineHeight("normal")}>
            <span className={lineHeight === "normal" ? "font-bold text-primary" : ""}>
              Normal (1.85)
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLineHeight("relaxed")}>
            <span className={lineHeight === "relaxed" ? "font-bold text-primary" : ""}>
              Relaxed (2.2)
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setIsBionic((prev) => !prev)}>
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Bionic Reading Mode
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isBionic ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {isBionic ? "ON" : "OFF"}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function handleSingleHotkeys(
  key: string,
  params: {
    setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBionic: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
    setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
    setViewMode: (v: ViewMode) => void;
  }
): boolean {
  if (key === "?") {
    params.setShowShortcuts((prev) => !prev);
    return true;
  }

  if (key === "f") {
    params.setIsFocusMode((prev) => !prev);
    return true;
  }

  if (key === "b") {
    params.setIsBionic((prev) => !prev);
    return true;
  }

  if (key === "t") {
    const themes: ThemeMode[] = ["paper", "sepia", "mint", "dark", "oled"];
    params.setThemeMode((prev) => themes[(themes.indexOf(prev) + 1) % themes.length]);
    return true;
  }

  if (key === "n") {
    params.setViewMode("native");
    return true;
  }

  return false;
}

function useReaderKeyboardShortcuts(params: Readonly<ReaderShortcutsParams>) {
  const {
    article,
    setHighlights,
    setActiveSelection,
    setConcept,
    setIsBionic,
    setIsFocusMode,
    setThemeMode,
    setViewMode,
    setShowShortcuts,
  } = params;

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
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const lowerKey = e.key.toLowerCase();
      const isPlainKey = !e.ctrlKey && !e.metaKey;

      if (
        isPlainKey &&
        handleSingleHotkeys(lowerKey, {
          setShowShortcuts,
          setIsBionic,
          setIsFocusMode,
          setThemeMode,
          setViewMode,
        })
      ) {
        e.preventDefault();
        return;
      }

      const sel = globalThis.getSelection();
      const selectedText = sel ? sel.toString().trim() : "";
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (lowerKey === "h" && (isCmdOrCtrl || selectedText) && article && selectedText) {
        e.preventDefault();
        createShortcutHighlight(article.id, selectedText);
      } else if (lowerKey === "s" && (isCmdOrCtrl || selectedText) && selectedText) {
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
  }, [
    article,
    setHighlights,
    setActiveSelection,
    setConcept,
    setIsBionic,
    setIsFocusMode,
    setThemeMode,
    setViewMode,
    setShowShortcuts,
  ]);
}

function processContainerClick(
  e: MouseEvent,
  highlights: HighlightType[],
  editingHighlight: EditingHighlightType,
  setEditingHighlight: (val: EditingHighlightType) => void,
  setActiveSelection: (val: SelectionType) => void,
  setLightboxSrc: (src: string | null) => void
) {
  const target = e.target as HTMLElement;

  if (target.tagName === "IMG" && (target as HTMLImageElement).src) {
    setLightboxSrc((target as HTMLImageElement).src);
    return;
  }

  const markTarget = target.closest("mark");
  if (markTarget?.dataset.highlightId) {
    const id = markTarget.dataset.highlightId;
    const highlight = highlights.find((h) => h.id === id);
    if (highlight) {
      const rect = markTarget.getBoundingClientRect();
      setEditingHighlight({ highlight, rect });
      setActiveSelection(null);
      globalThis.getSelection()?.removeAllRanges();
      return;
    }
  }

  if (editingHighlight) {
    setEditingHighlight(null);
  }
}

function useContainerEvents(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  handleMouseUp: () => void,
  highlights: HighlightType[],
  editingHighlight: EditingHighlightType,
  setEditingHighlight: (val: EditingHighlightType) => void,
  setActiveSelection: (val: SelectionType) => void,
  setLightboxSrc: (src: string | null) => void
) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onMouseUpContainer = () => handleMouseUp();
    const onClickContainer = (e: MouseEvent) => {
      processContainerClick(
        e,
        highlights,
        editingHighlight,
        setEditingHighlight,
        setActiveSelection,
        setLightboxSrc
      );
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
    setLightboxSrc,
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
  const initialRestoredRef = useRef(false);

  // Restore scroll position to saved reading progress on load
  useEffect(() => {
    if (!initialRestoredRef.current && article && scrollRef.current) {
      const savedProg = Number(article.reading_progress || 0);
      if (savedProg > 0) {
        const timer = setTimeout(() => {
          if (scrollRef.current) {
            const { scrollHeight, clientHeight } = scrollRef.current;
            const totalScrollableDistance = scrollHeight - clientHeight;
            if (totalScrollableDistance > 0) {
              scrollRef.current.scrollTop = Math.round((savedProg / 100) * totalScrollableDistance);
              initialRestoredRef.current = true;
            }
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [article, scrollRef]);

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
  lineHeight,
  setLineHeight,
  themeMode,
  setThemeMode,
  widthMode,
  setWidthMode,
  isBionic,
  setIsBionic,
  isFocusMode,
  setIsFocusMode,
  showAudioPlayer,
  setShowAudioPlayer,
  setShowShortcuts,
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
  lineHeight: LineHeight;
  setLineHeight: (l: LineHeight) => void;
  themeMode: ThemeMode;
  setThemeMode: (t: ThemeMode) => void;
  widthMode: WidthMode;
  setWidthMode: (w: WidthMode) => void;
  isBionic: boolean;
  setIsBionic: React.Dispatch<React.SetStateAction<boolean>>;
  isFocusMode: boolean;
  setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
  showAudioPlayer: boolean;
  setShowAudioPlayer: React.Dispatch<React.SetStateAction<boolean>>;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  articleId: string;
  progress: number;
  readTimeMinutes?: number;
  htmlContent: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
}>) {
  const minutesLeft = Math.max(1, Math.ceil(((readTimeMinutes || 5) * (100 - progress)) / 100));

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur z-10 shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="font-heading font-semibold text-sm sm:text-base md:text-lg line-clamp-1 max-w-[120px] sm:max-w-xs md:max-w-md">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            {author && (
              <span className="text-xs text-[#52525B] line-clamp-1 max-w-[120px] sm:max-w-xs md:max-w-sm">
                {author}
              </span>
            )}
            <span className="text-[10px] font-semibold text-[#D17659] bg-[#D17659]/10 px-1.5 py-0.5 rounded-sm">
              {progress >= 100 ? "Finished" : `${minutesLeft} min left`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {viewMode === "reader" && (
          <>
            <Tooltip
              content={showAudioPlayer ? "Stop Audio" : "Listen (Audio)"}
              side="bottom"
              className="hidden sm:inline-flex"
            >
              <Button
                type="button"
                variant={showAudioPlayer ? "default" : "outline"}
                size="icon"
                className="h-9 w-9 cursor-pointer"
                onClick={() => setShowAudioPlayer((prev) => !prev)}
                aria-label={showAudioPlayer ? "Stop audio" : "Listen to article"}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip
              content={isBionic ? "Bionic ON — click to disable" : "Bionic Reading Mode (B)"}
              side="bottom"
              className="hidden md:inline-flex"
            >
              <Button
                type="button"
                variant={isBionic ? "default" : "outline"}
                size="icon"
                className="h-9 w-9 cursor-pointer"
                onClick={() => setIsBionic((prev) => !prev)}
                aria-label="Toggle Bionic Reading Mode"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
              </Button>
            </Tooltip>

            <ReaderTableOfContents htmlContent={htmlContent} scrollRef={scrollRef} />
          </>
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
            lineHeight={lineHeight}
            setLineHeight={setLineHeight}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            widthMode={widthMode}
            setWidthMode={setWidthMode}
            isBionic={isBionic}
            setIsBionic={setIsBionic}
          />
        )}

        <Tooltip
          content={isFocusMode ? "Exit Focus Mode (F)" : "Focus Mode (F)"}
          side="bottom"
          className="hidden sm:inline-flex"
        >
          <Button
            type="button"
            variant={isFocusMode ? "default" : "outline"}
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={() => setIsFocusMode((prev) => !prev)}
            aria-label="Toggle Focus Mode"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Keyboard Shortcuts (?)" side="bottom" className="hidden lg:inline-flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={() => setShowShortcuts(true)}
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </Button>
        </Tooltip>

        <ShareDialog type="article" id={articleId} title={title} compact />
        <ExportArticleButton articleId={articleId} articleTitle={title} />
      </div>
    </header>
  );
}

function useStreakLogger(articleId: string) {
  useEffect(() => {
    fetch("/api/user/streak", { method: "POST" }).catch(console.error);
  }, [articleId]);
}

function useReaderSwipeNavigation(router: ReturnType<typeof useRouter>) {
  const touchStartX = useRef<number | null>(null);
  const [swipeToast, setSwipeToast] = useState<string | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;

    if (diff > 120) {
      setSwipeToast("Returning to Library...");
      setTimeout(() => router.push("/library"), 400);
    }
    touchStartX.current = null;
  };

  return { swipeToast, handleTouchStart, handleTouchEnd };
}

function ReaderPopovers({
  activeSelection,
  concept,
  editingHighlight,
  showDictionary,
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
  activeSelection: SelectionType;
  concept: ConceptType;
  editingHighlight: EditingHighlightType;
  showDictionary: boolean;
  articleId: string;
  roomId?: string | null;
  onHighlight: (color: string) => void;
  onDefine: () => void;
  onSaveConcept: (word: string, definition: string) => void;
  onCloseDictionary: () => void;
  onCloseEditing: () => void;
  onUpdateHighlight: (id: string, data: Partial<HighlightType>) => void;
  onDeleteHighlight: (id: string) => void;
  onCloseConcept: () => void;
}>) {
  return (
    <>
      {activeSelection && !showDictionary && (
        <TextSelectionMenu
          rect={activeSelection.rect}
          onHighlight={onHighlight}
          onDefine={onDefine}
          onSaveConcept={() => onSaveConcept(activeSelection.text, "")}
        />
      )}
      {activeSelection && showDictionary && (
        <DictionaryPopover
          word={activeSelection.text}
          rect={activeSelection.rect}
          onClose={onCloseDictionary}
          onSave={onSaveConcept}
          onHighlight={() => onHighlight("ochre")}
        />
      )}
      {concept && (
        <ConceptSlideOver
          term={concept.term}
          definition={concept.definition}
          contextSnippet={concept.contextSnippet}
          onClose={onCloseConcept}
          articleId={articleId}
          roomId={roomId ?? null}
        />
      )}
      {editingHighlight && (
        <EditHighlightPopover
          highlight={editingHighlight.highlight}
          rect={editingHighlight.rect}
          onClose={onCloseEditing}
          onUpdate={onUpdateHighlight}
          onDelete={onDeleteHighlight}
        />
      )}
    </>
  );
}
