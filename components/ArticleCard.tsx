"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { getArticleSourceDomain } from "@/lib/article-utils";
import { RoomAssignDropdown } from "./RoomAssignDropdown";

export interface ArticleProps {
  article: {
    id: string;
    title: string;
    author: string | null;
    source_url: string;
    source_type?: string;
    cover_image: string | null;
    read_time_minutes: number;
    reading_progress: number;
    status: string;
    room_id?: string | null;
  };
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
}

export function ArticleCard({ article, isSelected = false, onSelect }: Readonly<ArticleProps>) {
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) return null;

  const domain = getArticleSourceDomain(article.source_url, article.source_type, article.title);

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:bg-[#F4F3F3] transition-colors border border-[#E5E5E5] bg-white rounded-none shadow-none relative group">
      {article.cover_image && (
        <Link href={`/read/${article.id}`} className="h-40 w-full overflow-hidden bg-muted block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </Link>
      )}
      <CardHeader className="flex-1 pb-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex gap-2 items-center flex-wrap">
            {onSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(e);
                }}
                className="cursor-pointer p-0.5 hover:opacity-80 transition-opacity focus-visible:outline-none"
                title={isSelected ? "Deselect article" : "Select article"}
                aria-label={isSelected ? "Deselect article" : "Select article"}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-[#1A1A1A]" />
                ) : (
                  <Square className="w-4 h-4 text-[#52525B]" />
                )}
              </button>
            )}
            <Badge
              variant="secondary"
              className="text-[10px] font-semibold tracking-widest uppercase"
            >
              {domain}
            </Badge>
            {article.status === "finished" && (
              <Badge className="text-[10px] font-semibold tracking-widest uppercase bg-emerald-800 hover:bg-emerald-900 text-white">
                Finished
              </Badge>
            )}
          </div>
          <RoomAssignDropdown
            articleId={article.id}
            currentRoomId={article.room_id}
            onDeleteSuccess={() => setIsDeleted(true)}
          />
        </div>
        <Link href={`/read/${article.id}`} className="block group-hover:underline">
          <CardTitle className="line-clamp-2 leading-tight text-lg font-heading">
            {article.title}
          </CardTitle>
        </Link>
        {article.author && <p className="text-sm text-[#52525B] line-clamp-1">{article.author}</p>}
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Link href={`/read/${article.id}`} className="block">
          <div className="flex items-center text-xs text-[#52525B] mb-3">
            <Clock className="w-3 h-3 mr-1" />
            <span>{article.read_time_minutes} min read</span>
          </div>

          {article.reading_progress > 0 && article.status !== "finished" && (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1 text-[#52525B]">
                <span>Progress</span>
                <span>{article.reading_progress}%</span>
              </div>
              <Progress
                value={article.reading_progress}
                className="h-1.5"
                aria-label="Reading progress"
                title="Reading progress"
              />
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
