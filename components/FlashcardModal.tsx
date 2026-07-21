"use client";

import { useState, useEffect, useCallback } from "react";
import { X, RotateCw, Shuffle, BookOpen, Sparkles, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { secureRandom } from "@/lib/utils";

interface VaultTrail {
  article_id: string;
  room_id: string | null;
  article: { title: string };
  room: { name: string } | null;
}

interface VaultEntry {
  id: string;
  term: string;
  definition: string;
  pronunciation: string | null;
  etymology: string | null;
  example_sentence: string | null;
  created_at: string | Date;
  vaultTrails: VaultTrail[];
}

interface FlashcardModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly entries: VaultEntry[];
}

type RatingType = "again" | "hard" | "good" | "easy";

interface ReviewResult {
  entryId: string;
  term: string;
  rating: RatingType;
}

/** Fisher-Yates shuffle helper */
function shuffleDeck<T>(items: T[]): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

export function FlashcardModal({ isOpen, onClose, entries }: FlashcardModalProps) {
  const [deck, setDeck] = useState<VaultEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  // Initialize or reset deck
  const initDeck = useCallback((items: VaultEntry[], shouldShuffle = false) => {
    const list = shouldShuffle ? shuffleDeck(items) : [...items];
    setDeck(list);
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults([]);
    setIsCompleted(false);
  }, []);

  // Adjust state during render when isOpen prop transitions to true
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setDeck(entries);
      setCurrentIndex(0);
      setIsFlipped(false);
      setResults([]);
      setIsCompleted(false);
    }
  }

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    (rating: RatingType) => {
      if (deck.length === 0 || currentIndex >= deck.length) return;

      const current = deck[currentIndex];
      setResults((prev) => [...prev, { entryId: current.id, term: current.term, rating }]);

      if (currentIndex + 1 < deck.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    },
    [deck, currentIndex]
  );

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handleFlip();
        return;
      }

      if (!isFlipped) return;

      if (e.key === "1") handleRate("again");
      else if (e.key === "2") handleRate("hard");
      else if (e.key === "3") handleRate("good");
      else if (e.key === "4") handleRate("easy");
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCompleted, isFlipped, handleFlip, handleRate, onClose]);

  if (!isOpen) return null;

  const currentCard = deck[currentIndex];
  const totalCards = deck.length;

  const renderSummaryScreen = () => {
    const againCount = results.filter((r) => r.rating === "again").length;
    const hardCount = results.filter((r) => r.rating === "hard").length;
    const goodCount = results.filter((r) => r.rating === "good").length;
    const easyCount = results.filter((r) => r.rating === "easy").length;

    const masteredCount = goodCount + easyCount;
    const accuracyPct = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-[#F4F3F3] border border-[#E5E5E5] flex items-center justify-center rounded-full">
          <Award className="w-8 h-8 text-[#1A1A1A]" />
        </div>

        <div>
          <h3 className="font-heading text-2xl font-bold text-[#1A1A1A]">Session Complete!</h3>
          <p className="text-sm text-[#52525B] mt-1 font-serif">
            You reviewed {totalCards} {totalCards === 1 ? "word" : "words"} with {accuracyPct}%
            recall mastery.
          </p>
        </div>

        {/* Stats Breakdown */}
        <div className="grid grid-cols-4 gap-3 w-full max-w-md my-2">
          <div className="p-3 bg-red-50 border border-red-200 text-center">
            <div className="text-lg font-bold text-red-700">{againCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
              Again
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 text-center">
            <div className="text-lg font-bold text-amber-700">{hardCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
              Hard
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 text-center">
            <div className="text-lg font-bold text-blue-700">{goodCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              Good
            </div>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-lg font-bold text-emerald-700">{easyCount}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Easy
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {againCount > 0 && (
            <Button
              onClick={() => {
                const failedIds = new Set(
                  results.filter((r) => r.rating === "again").map((r) => r.entryId)
                );
                initDeck(
                  entries.filter((e) => failedIds.has(e.id)),
                  false
                );
              }}
              className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none h-10 px-5 text-xs font-bold uppercase tracking-wider gap-2"
            >
              <RotateCw className="w-3.5 h-3.5" /> Practice {againCount} Failed Words
            </Button>
          )}
          <Button
            onClick={() => initDeck(entries, true)}
            variant="outline"
            className="border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F4F3F3] rounded-none h-10 px-5 text-xs font-bold uppercase tracking-wider gap-2"
          >
            <Shuffle className="w-3.5 h-3.5" /> Restart Full Deck
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-[#52525B] hover:text-[#1A1A1A] rounded-none h-10 px-4 text-xs font-bold uppercase tracking-wider"
          >
            Done
          </Button>
        </div>
      </div>
    );
  };

  const renderCardFront = () => (
    <div className="flex flex-col items-center space-y-4 my-auto animate-in fade-in duration-200">
      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#BDBDBD]">
        Vocabulary Word
      </span>
      <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
        {currentCard.term}
      </h2>
      {currentCard.pronunciation && (
        <span className="text-sm font-mono text-[#52525B] bg-[#F4F3F3] px-2.5 py-1 rounded-sm">
          {currentCard.pronunciation}
        </span>
      )}
      <p className="text-xs text-[#BDBDBD] pt-4 font-sans italic">
        (Click or press Space to reveal definition)
      </p>
    </div>
  );

  const renderCardBack = () => {
    const hasEtymology =
      currentCard.etymology &&
      !currentCard.etymology.toLowerCase().startsWith("etymology information not available");

    return (
      <div className="flex flex-col items-center space-y-4 my-auto animate-in fade-in duration-200 w-full max-w-lg">
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#BDBDBD]">
          Definition & Context
        </span>

        <h3 className="font-heading text-2xl font-bold text-[#1A1A1A]">{currentCard.term}</h3>

        <p className="font-source-serif text-lg text-[#333] leading-relaxed">
          {currentCard.definition}
        </p>

        {currentCard.example_sentence && (
          <p className="font-source-serif italic text-sm text-[#52525B] border-l-2 border-[#E5E5E5] pl-3 py-0.5 text-left">
            &ldquo;{currentCard.example_sentence}&rdquo;
          </p>
        )}

        {hasEtymology && (
          <div className="text-xs text-[#52525B] bg-[#FCFBF8] border border-[#E5E5E5] p-2.5 text-left w-full">
            <span className="font-bold uppercase tracking-wider text-[9px] text-[#BDBDBD] block mb-0.5">
              Etymology
            </span>
            {currentCard.etymology}
          </div>
        )}

        {currentCard.vaultTrails?.[0]?.article && (
          <div className="flex items-center gap-1.5 text-xs text-[#52525B] pt-1">
            <BookOpen className="w-3.5 h-3.5 text-[#BDBDBD]" />
            <span>Source: {currentCard.vaultTrails[0].article.title}</span>
          </div>
        )}
      </div>
    );
  };

  const renderPracticeCard = () => (
    <div className="flex flex-col items-center justify-center flex-1 space-y-6">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-[#BDBDBD]">
        Card {currentIndex + 1} of {totalCards}
      </div>

      {/* Card Container */}
      <button
        type="button"
        onClick={handleFlip}
        className="w-full min-h-[260px] bg-white border border-[#E5E5E5] p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative group text-left"
        aria-label={isFlipped ? "Flip to front" : "Flip to reveal definition"}
      >
        <div className="absolute top-4 right-4 text-[#BDBDBD] group-hover:text-[#1A1A1A] transition-colors flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider">
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? "Show Term" : "Flip"}</span>
        </div>

        {isFlipped ? renderCardBack() : renderCardFront()}
      </button>

      {/* Rating Controls */}
      {isFlipped ? (
        <div className="flex flex-col items-center gap-2 w-full animate-in fade-in duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#BDBDBD]">
            How well did you recall this term? (Keys 1 - 4)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
            <Button
              onClick={() => handleRate("again")}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-none h-11 text-xs font-bold uppercase tracking-wider flex flex-col justify-center gap-0.5"
            >
              <span>1. Again</span>
              <span className="text-[9px] font-normal opacity-80 lowercase">Review again</span>
            </Button>
            <Button
              onClick={() => handleRate("hard")}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-none h-11 text-xs font-bold uppercase tracking-wider flex flex-col justify-center gap-0.5"
            >
              <span>2. Hard</span>
              <span className="text-[9px] font-normal opacity-80 lowercase">Struggled</span>
            </Button>
            <Button
              onClick={() => handleRate("good")}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-none h-11 text-xs font-bold uppercase tracking-wider flex flex-col justify-center gap-0.5"
            >
              <span>3. Good</span>
              <span className="text-[9px] font-normal opacity-80 lowercase">Recalled</span>
            </Button>
            <Button
              onClick={() => handleRate("easy")}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-none h-11 text-xs font-bold uppercase tracking-wider flex flex-col justify-center gap-0.5"
            >
              <span>4. Easy</span>
              <span className="text-[9px] font-normal opacity-80 lowercase">Instant</span>
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleFlip}
          className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none h-11 px-8 text-xs font-bold uppercase tracking-wider gap-2 shadow-sm"
        >
          Reveal Definition <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  const renderMainContent = () => {
    if (isCompleted) {
      return renderSummaryScreen();
    }
    if (currentCard) {
      return renderPracticeCard();
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-sans animate-in fade-in duration-200">
      <div className="bg-[#FCFBF8] border border-[#E5E5E5] w-full max-w-2xl rounded-none shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#E5E5E5] bg-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
            <span className="font-heading font-bold text-base text-[#1A1A1A]">
              Active Recall Practice
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && totalCards > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => initDeck(entries, true)}
                className="h-8 px-2.5 text-xs text-[#52525B] hover:text-[#1A1A1A] gap-1.5 rounded-none"
                title="Shuffle deck"
              >
                <Shuffle className="w-3.5 h-3.5" /> Shuffle
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#52525B] hover:text-[#1A1A1A] transition-colors rounded-none"
              aria-label="Close practice mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!isCompleted && totalCards > 0 && (
          <div className="w-full bg-[#E5E5E5] h-1.5 relative">
            <div
              className="bg-[#1A1A1A] h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center overflow-y-auto min-h-[360px]">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}
