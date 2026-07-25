"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReaderAudioPlayerProps {
  readonly textContent: string;
  readonly articleTitle: string;
  readonly onClose: () => void;
}

export function ReaderAudioPlayer({ textContent, articleTitle, onClose }: ReaderAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [isSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cleanTextRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    // Strip HTML tags for smooth audio narration
    const rawText = textContent
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    cleanTextRef.current = rawText;

    const utterance = new SpeechSynthesisUtterance(rawText);
    utterance.rate = rate;

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
  }, [textContent, rate]);

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

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-card border border-border px-4 py-3 shadow-xl rounded-xl text-xs text-muted-foreground">
        Audio Speech API is not supported in this browser.
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur border border-border shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 min-w-[340px] xs:min-w-[400px] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-primary animate-pulse" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold line-clamp-1 max-w-[160px]">{articleTitle}</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {progress}% read aloud
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
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
          className="h-8 w-8 rounded-full ml-1"
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
  );
}
