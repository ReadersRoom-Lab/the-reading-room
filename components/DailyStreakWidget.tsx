"use client";

import { useEffect, useState } from "react";
import { Flame, CheckCircle2, Clock, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface StreakData {
  streakCount: number;
  dailyGoalMinutes: number;
  readingMinutesToday: number;
  lastReadDate: string | null;
}

export function DailyStreakWidget({ initialData }: Readonly<{ initialData?: StreakData | null }>) {
  const [data, setData] = useState<StreakData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    if (!initialData) {
      fetch("/api/user/streak")
        .then((res) => res.json())
        .then((resData) => {
          if (!resData.error) {
            setData(resData);
          }
        })
        .catch((err) => console.error("Failed to load streak data:", err))
        .finally(() => setLoading(false));
    }
  }, [initialData]);

  const streakCount = data?.streakCount || 0;
  const goalMinutes = data?.dailyGoalMinutes || 15;
  const minutesToday = data?.readingMinutesToday || 0;
  const pct = Math.min(100, Math.round((minutesToday / goalMinutes) * 100));

  const handleUpdateGoal = async (newGoal: number) => {
    setIsSavingGoal(true);
    try {
      const res = await fetch("/api/user/streak", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGoalMinutes: newGoal }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData((prev) =>
          prev ? { ...prev, dailyGoalMinutes: updated.dailyGoalMinutes } : updated
        );
        toast.success(`Daily reading goal updated to ${newGoal} minutes!`);
      }
    } catch (err) {
      toast.error("Failed to update daily reading goal");
      console.error(err);
    } finally {
      setIsSavingGoal(false);
      setIsEditingGoal(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FAF9F5] border-2 border-[#1A1A1A] p-5 shadow-sm font-sans animate-pulse min-h-[140px]" />
    );
  }

  return (
    <div className="bg-[#FAF9F5] border-2 border-[#1A1A1A] p-5 shadow-md font-sans relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D17659]/15 border border-[#D17659] flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#D17659] fill-[#D17659]" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-[#1A1A1A] leading-tight flex items-center gap-1.5">
              {streakCount} {streakCount === 1 ? "Day" : "Days"} Streak
            </h3>
            <p className="text-[10px] text-[#52525B] font-medium uppercase tracking-wider flex items-center gap-1">
              Daily Reading Goal ({goalMinutes} min)
              <button
                type="button"
                onClick={() => setIsEditingGoal((prev) => !prev)}
                className="text-[#D17659] hover:text-[#1A1A1A] transition-colors cursor-pointer ml-1"
                title="Edit Daily Reading Goal"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-[#1A1A1A] text-[#F9F7F2]">
          {pct >= 100 ? "GOAL REACHED!" : `${minutesToday}/${goalMinutes} MIN`}
        </span>
      </div>

      {/* Goal Edit Selector Drawer */}
      {isEditingGoal && (
        <div className="mb-3 p-3 bg-white border border-[#E5E5E5] flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Select Daily Target:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {[10, 15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                disabled={isSavingGoal}
                onClick={() => handleUpdateGoal(mins)}
                className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                  goalMinutes === mins
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-[#FAF9F5] text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]"
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Goal Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-[#1A1A1A] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#52525B]" /> Today&apos;s Reading
          </span>
          <span className="font-bold text-[#D17659] text-xs">{pct}%</span>
        </div>

        <div className="w-full bg-[#E5E5E5] h-2.5 rounded-none overflow-hidden">
          <div
            className="bg-[#D17659] h-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Weekly Activity Dot Indicators */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E5E5E5] text-[10px] font-medium text-[#52525B]">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={`${day}-${i}`} className="flex flex-col items-center gap-1">
            <span>{day}</span>
            <div
              className={`w-3.5 h-3.5 rounded-none border flex items-center justify-center ${
                i < Math.min(7, streakCount)
                  ? "bg-[#D17659] border-[#D17659] text-white"
                  : "bg-white border-[#E5E5E5]"
              }`}
            >
              {i < Math.min(7, streakCount) && <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
