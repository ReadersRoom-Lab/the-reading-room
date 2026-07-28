"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, X, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReaderAudioPlayerProps {
  readonly textContent: string;
  readonly articleTitle: string;
  readonly onClose: () => void;
  /** When true, bumps the player above the mobile sanctuary bar (sm:hidden) */
  readonly hasBottomBar?: boolean;
}

export function ReaderAudioPlayer({
  textContent,
  articleTitle,
  onClose,
  hasBottomBar = false,
}: ReaderAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cleanTextRef = useRef<string>("");

  // Load available voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((v) => v.lang.startsWith("en"));
      const voiceList = englishVoices.length > 0 ? englishVoices : availableVoices;
      setVoices(voiceList);
      if (voiceList.length > 0 && !selectedVoice) {
        setSelectedVoice(voiceList[0].name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    // Strip HTML tags for smooth audio narration
    const rawText = textContent
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    cleanTextRef.current = rawText;

    const utterance = new SpeechSynthesisUtterance(rawText);
    utterance.rate = rate;

    if (selectedVoice && voices.length > 0) {
      const match = voices.find((v) => v.name === selectedVoice);
      if (match) utterance.voice = match;
    }

    utterance.onboundary = (event) => {
      if (event.name === "word" && rawText.length > 0) {
        const charIdx = event.charIndex;
        const currentProgress = Math.min(100, Math.round((charIdx / rawText.length) * 100));
        setProgress(currentProgress);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [textContent, rate, selectedVoice, voices]);

  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = rate;
    }
  }, [rate]);

  const togglePlay = () => {
    if (!isSupported || typeof window === "undefined") return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.cancel();
        if (utteranceRef.current) {
          window.speechSynthesis.speak(utteranceRef.current);
        }
      }
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
    setRate(rates[nextIdx]);
  };

  const handleScrub = (targetPct: number) => {
    if (typeof window === "undefined" || !cleanTextRef.current) return;
    window.speechSynthesis.cancel();
    const rawText = cleanTextRef.current;
    const startChar = Math.floor((rawText.length * targetPct) / 100);
    const subText = rawText.slice(startChar);

    const utterance = new SpeechSynthesisUtterance(subText);
    utterance.rate = rate;
    if (selectedVoice && voices.length > 0) {
      const match = voices.find((v) => v.name === selectedVoice);
      if (match) utterance.voice = match;
    }

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const charIdx = startChar + event.charIndex;
        const currentProgress = Math.min(100, Math.round((charIdx / rawText.length) * 100));
        setProgress(currentProgress);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    utteranceRef.current = utterance;
    setProgress(targetPct);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-card border border-border px-4 py-3 shadow-xl rounded-xl text-xs text-[#52525B]">
        Audio Speech API is not supported in this browser.
      </div>
    );
  }

  // On mobile, push up above the sanctuary bar (which is at bottom-4, so add 56px clearance)
  const bottomClass = hasBottomBar ? "bottom-[88px] sm:bottom-6" : "bottom-6";

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur border border-border shadow-2xl rounded-2xl p-4 flex flex-col gap-2.5 min-w-[320px] sm:min-w-[460px] animate-in fade-in slide-in-from-bottom-4 ${bottomClass}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-primary animate-pulse shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold line-clamp-1 max-w-[140px] sm:max-w-[200px]">
              {articleTitle}
            </span>
            <span className="text-[10px] text-[#52525B] font-mono">{progress}% read aloud</span>
          </div>
        </div>

        {/* Voice Selector */}
        {voices.length > 0 && (
          <div className="flex items-center gap-1 bg-muted/60 border border-border px-2 py-1 rounded-md">
            <Mic className="w-3 h-3 text-[#52525B]" />
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-transparent text-[10px] font-medium text-foreground focus:outline-none max-w-[110px] truncate cursor-pointer"
            >
              {voices.slice(0, 8).map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name.replace(/Google|Microsoft|Apple|Desktop/g, "").trim()}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full cursor-pointer"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
                setProgress(0);
              }
            }}
            title="Restart audio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="default"
            size="icon"
            className="h-9 w-9 rounded-full shadow-md cursor-pointer"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>

          <button
            type="button"
            onClick={handleSpeedChange}
            className="text-xs font-mono font-bold px-2 py-1 bg-muted hover:bg-accent rounded-md border border-border transition-colors cursor-pointer"
            title="Change playback speed"
          >
            {rate}x
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full ml-1 cursor-pointer"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Interactive Timeline Scrubber */}
      <div className="flex items-center gap-2 pt-1 border-t border-border/50">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => handleScrub(Number(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          title="Scrub audio position"
        />
      </div>
    </div>
  );
}
