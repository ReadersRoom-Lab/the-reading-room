"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, CheckCircle2, Edit3, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export interface RediscoveryItem {
  id: string;
  type: "vault" | "highlight";
  termOrText: string;
  definitionOrNote: string;
  pronunciation?: string | null;
  etymology?: string | null;
  articleTitle?: string;
  articleId?: string;
  created_at: Date | string;
  user_note?: string | null;
}

interface TodaysRediscoveryCardProps {
  initialItem: RediscoveryItem | null;
}

export function TodaysRediscoveryCard({ initialItem }: Readonly<TodaysRediscoveryCardProps>) {
  const [item, setItem] = useState<RediscoveryItem | null>(initialItem);
  const [loading, setLoading] = useState(false);
  const [isMastered, setIsMastered] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(initialItem?.user_note || "");
  const [savingNote, setSavingNote] = useState(false);

  const handleShuffle = async () => {
    setLoading(true);
    setEditingNote(false);
    try {
      const url = item
        ? `/api/insights/rediscovery?excludeId=${encodeURIComponent(item.id)}`
        : "/api/insights/rediscovery";
      const res = await fetch(url);
      const data = await res.json();
      if (data.item) {
        setItem(data.item);
        setNoteText(data.item.user_note || "");
        setIsMastered(false);
      }
    } catch (err) {
      console.error("Failed to shuffle rediscovery item:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!item) return;
    setSavingNote(true);
    try {
      await fetch("/api/insights/rediscovery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          type: item.type,
          user_note: noteText,
        }),
      });
      setItem((prev) => (prev ? { ...prev, user_note: noteText } : null));
      setEditingNote(false);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  if (!item) {
    return (
      <div className="bg-[#FAF9F5] border border-[#E5E5E5] p-8 text-center font-sans">
        <Sparkles className="w-6 h-6 text-[#E6C79C] mx-auto mb-2" />
        <h3 className="font-heading font-bold text-base text-[#1A1A1A] mb-1">
          Your Rediscovery Vault is Empty
        </h3>
        <p className="text-xs text-[#52525B]">
          Highlight text and look up vocabulary terms while reading to build your memory collection!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5] border-2 border-[#1A1A1A] p-6 font-sans relative shadow-md">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 bg-[#1A1A1A] text-[#F9F7F2]">
            TODAY&apos;S REDISCOVERY
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#E6C79C]/30 text-[#1A1A1A]">
            {item.type === "vault" ? "VOCABULARY" : "HIGHLIGHT"}
          </span>
        </div>

        <button
          onClick={handleShuffle}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] hover:text-black transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Shuffle
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-heading text-2xl font-bold text-[#1A1A1A]">{item.termOrText}</h3>
          {item.pronunciation && (
            <span className="text-xs font-mono text-[#8C8C8C] block mt-0.5">
              {item.pronunciation}
            </span>
          )}
        </div>

        {/* Definition / Passage Box */}
        <div className="bg-white border border-[#E6C79C]/50 p-4 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E6C79C]" />
          <p className="font-source-serif italic text-sm text-[#1A1A1A] leading-relaxed">
            {item.definitionOrNote}
          </p>
        </div>

        {/* Etymology preview if available */}
        {item.etymology && (
          <p className="text-xs font-source-serif text-[#52525B]">
            <strong className="font-sans font-bold text-[#E6C79C] uppercase text-[9px] mr-1">
              Origin:
            </strong>
            {item.etymology}
          </p>
        )}

        {/* Article Context */}
        {item.articleTitle && (
          <div className="flex items-center justify-between text-xs text-[#52525B] pt-2 border-t border-[#E5E5E5] mt-1">
            <span className="truncate max-w-[70%]">
              From: <strong className="font-heading text-[#1A1A1A]">{item.articleTitle}</strong>
            </span>
            <span className="text-[10px] text-[#8C8C8C]">
              Saved {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* User Note Section */}
        {editingNote ? (
          <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#E5E5E5]">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your memory note or context..."
              className="w-full text-xs p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNote(false)}
                className="px-3 py-1 text-xs font-medium text-[#52525B]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="px-3 py-1 text-xs font-semibold bg-[#1A1A1A] text-white rounded-none"
              >
                {savingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2">
            {item.user_note ? (
              <div className="flex items-center gap-1.5 text-xs text-[#333] bg-[#E6C79C]/10 px-2.5 py-1 border border-[#E6C79C]/30">
                <MessageSquare className="w-3.5 h-3.5 text-[#E6C79C]" />
                <span>{item.user_note}</span>
                <button
                  onClick={() => setEditingNote(true)}
                  className="ml-2 text-[10px] text-[#8C8C8C] hover:text-[#1A1A1A]"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingNote(true)}
                className="flex items-center gap-1 text-xs text-[#8C8C8C] hover:text-[#1A1A1A]"
              >
                <Edit3 className="w-3.5 h-3.5" /> Add memory note...
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMastered(!isMastered)}
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 transition-colors ${
                  isMastered
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-[#8C8C8C] hover:text-[#1A1A1A]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isMastered ? "Mastered" : "Mark Mastered"}
              </button>

              {item.articleId && (
                <Link
                  href={`/read/${item.articleId}`}
                  className="flex items-center gap-1 text-xs font-semibold text-[#1A1A1A] hover:underline"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
