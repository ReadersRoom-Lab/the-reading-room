"use client";

import { useMemo } from "react";

interface ReadingHeatmapProps {
  readonly dailyActivity: Record<string, number>;
}

export function ReadingHeatmap({ dailyActivity }: ReadingHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const resultWeeks: Array<Array<{ dateStr: string; minutes: number; dayOfWeek: number }>> = [];
    const months: Array<{ label: string; weekIndex: number }> = [];

    // Calculate start date (Sunday 52 weeks ago)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    // Align to Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    let currentWeek: Array<{ dateStr: string; minutes: number; dayOfWeek: number }> = [];
    let lastMonth = -1;

    const iterDate = new Date(startDate);

    while (iterDate <= today || currentWeek.length > 0) {
      const dateStr = iterDate.toISOString().split("T")[0];
      const minutes = dailyActivity[dateStr] || 0;
      const day = iterDate.getDay();

      if (iterDate.getMonth() !== lastMonth && day === 0 && resultWeeks.length < 52) {
        lastMonth = iterDate.getMonth();
        const monthName = iterDate.toLocaleDateString("en-US", { month: "short" });
        months.push({ label: monthName, weekIndex: resultWeeks.length });
      }

      currentWeek.push({ dateStr, minutes, dayOfWeek: day });

      if (currentWeek.length === 7) {
        resultWeeks.push(currentWeek);
        currentWeek = [];
      }

      iterDate.setDate(iterDate.getDate() + 1);
      if (resultWeeks.length >= 52 && day === 6) break;
    }

    return { weeks: resultWeeks, monthLabels: months };
  }, [dailyActivity]);

  function getIntensityClass(minutes: number): string {
    if (minutes === 0) return "bg-[#F4F3F3] border-[#E5E5E5]";
    if (minutes <= 10) return "bg-[#E6C79C]/50 border-[#E6C79C]";
    if (minutes <= 25) return "bg-[#D17659]/70 border-[#D17659] text-white";
    return "bg-[#D17659] border-[#D17659] text-white";
  }

  return (
    <div className="bg-[#FAF9F5] border-2 border-[#1A1A1A] p-6 shadow-md font-sans">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5E5]">
        <div>
          <h3 className="font-heading font-bold text-lg text-[#1A1A1A]">Annual Reading Activity</h3>
          <p className="text-xs text-[#52525B]">365-day consistency heatmap</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">
          <span>Less</span>
          <div className="w-3 h-3 bg-[#F4F3F3] border border-[#E5E5E5]" title="0 mins" />
          <div className="w-3 h-3 bg-[#E6C79C]/50 border border-[#E6C79C]" title="1-10 mins" />
          <div className="w-3 h-3 bg-[#D17659]/70 border border-[#D17659]" title="11-25 mins" />
          <div className="w-3 h-3 bg-[#D17659] border border-[#D17659]" title="26+ mins" />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid Overflow Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          {/* Month labels */}
          <div className="flex text-[10px] font-bold uppercase tracking-wider text-[#BDBDBD] mb-2 pl-6">
            {monthLabels.map((m, idx) => (
              <span
                key={`${m.label}-${m.weekIndex}-${idx}`}
                style={{
                  marginLeft:
                    idx === 0
                      ? `${m.weekIndex * 13}px`
                      : `${(m.weekIndex - monthLabels[idx - 1].weekIndex) * 13 - 20}px`,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid Area: Day labels + 52 Column Weeks */}
          <div className="flex gap-1.5">
            {/* Day Labels */}
            <div className="flex flex-col justify-between text-[9px] font-bold text-[#BDBDBD] uppercase py-0.5 pr-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-1">
                  {week.map((cell) => (
                    <div
                      key={cell.dateStr}
                      className={`w-3 h-3 border rounded-none transition-all duration-150 group relative cursor-pointer ${getIntensityClass(
                        cell.minutes
                      )}`}
                      title={`${cell.dateStr}: ${cell.minutes} min read`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-20 whitespace-nowrap bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-1 shadow-lg pointer-events-none uppercase tracking-wider">
                        {cell.dateStr}: {cell.minutes} min read
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
