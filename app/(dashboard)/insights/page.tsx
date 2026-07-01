"use client"

import { useState, useEffect, useMemo } from 'react'
import { useChat } from 'ai/react'
import { Sparkles, Send, User, Flame, BookOpen, Highlighter, Library, Calendar, TrendingUp, FolderOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, subDays } from 'date-fns'

type StatsType = {
  streaks: {
    current: number
    longest: number
  }
  activity: Record<string, number>
  knowledgeGrowth: { date: string, count: number }[]
  activeRooms: { name: string, articleCount: number }[]
  totals: {
    articles: number
    highlights: number
    vault: number
  }
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'chat'>('analytics')
  const [stats, setStats] = useState<StatsType | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  useEffect(() => {
    fetch('/api/insights/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data)
      })
      .catch(console.error)
      .finally(() => setStatsLoading(false))
  }, [])

  // Generate 365 days of activity cells
  const heatmapDays = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const day = subDays(today, i)
      const dayStr = format(day, 'yyyy-MM-dd')
      const count = stats?.activity?.[dayStr] || 0
      days.push({ day, dayStr, count })
    }
    return days
  }, [stats])

  // Group heatmap days into 53 weeks (columns)
  const heatmapWeeks = useMemo(() => {
    const weeks: typeof heatmapDays[] = []
    let currentWeek: typeof heatmapDays = []
    
    heatmapDays.forEach(day => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    return weeks
  }, [heatmapDays])

  // SVG Line Chart coordinates calculation for Knowledge Growth
  const growthChartPoints = useMemo(() => {
    if (!stats?.knowledgeGrowth || stats.knowledgeGrowth.length === 0) return ""
    const data = stats.knowledgeGrowth
    const max = Math.max(...data.map(d => d.count), 1)
    const min = Math.min(...data.map(d => d.count), 0)
    const range = max - min
    
    const width = 600
    const height = 180
    const padding = 20
    
    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((d.count - min) / range) * (height - 2 * padding)
      return `${x},${y}`
    })
    
    return points.join(" ")
  }, [stats])

  const maxRoomArticles = useMemo(() => {
    if (!stats?.activeRooms || stats.activeRooms.length === 0) return 0
    return Math.max(...stats.activeRooms.map(r => r.articleCount), 1)
  }, [stats])

  return (
    <div className="flex flex-col min-h-screen w-full font-sans pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5] mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-[#E5E5E5] bg-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#1A1A1A]" />
          </div>
          <div>
            <h1 className="font-heading text-4xl font-bold text-[#1A1A1A]">Insights Studio</h1>
            <p className="font-serif text-sm text-[#747878]">Reflect on your reading activity, vocabulary vault growth, and search library links.</p>
          </div>
        </div>

        {/* Tabs Toggle */}
        <div className="flex border border-[#E5E5E5] bg-[#F9F7F2] p-1 gap-1">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'analytics' 
                ? 'bg-[#1A1A1A] text-white' 
                : 'text-[#444748] hover:text-[#1A1A1A] hover:bg-[#E5E5E5]'
            }`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'chat' 
                ? 'bg-[#1A1A1A] text-white' 
                : 'text-[#444748] hover:text-[#1A1A1A] hover:bg-[#E5E5E5]'
            }`}
          >
            Synthesis Engine
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        statsLoading ? (
          // Loading Skeletons
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-32 bg-white border border-[#E5E5E5]"></div>
            <div className="h-32 bg-white border border-[#E5E5E5]"></div>
            <div className="h-32 bg-white border border-[#E5E5E5]"></div>
            <div className="md:col-span-3 h-52 bg-white border border-[#E5E5E5]"></div>
            <div className="md:col-span-2 h-72 bg-white border border-[#E5E5E5]"></div>
            <div className="h-72 bg-white border border-[#E5E5E5]"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            
            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* Streak Card */}
              <div className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute right-4 top-4 text-orange-500 opacity-20">
                  <Flame className="w-12 h-12" />
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Current Streak</div>
                <div className="text-4xl font-heading font-bold text-[#1A1A1A] flex items-baseline gap-1">
                  {stats?.streaks?.current} <span className="text-sm font-sans font-medium text-muted-foreground">days</span>
                </div>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>Longest streak: {stats?.streaks?.longest} days</span>
                </div>
              </div>

              {/* Total Articles Card */}
              <div className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between shadow-sm">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Articles</div>
                <div className="text-4xl font-heading font-bold text-[#1A1A1A]">
                  {stats?.totals?.articles}
                </div>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
                  <span>Saved in your personal library</span>
                </div>
              </div>

              {/* Total Highlights Card */}
              <div className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between shadow-sm">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Highlights</div>
                <div className="text-4xl font-heading font-bold text-[#1A1A1A]">
                  {stats?.totals?.highlights}
                </div>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border flex items-center gap-1.5">
                  <Highlighter className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
                  <span>Key ideas highlighted in texts</span>
                </div>
              </div>

              {/* Total Concepts Card */}
              <div className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between shadow-sm">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Vocabulary Vault</div>
                <div className="text-4xl font-heading font-bold text-[#1A1A1A]">
                  {stats?.totals?.vault}
                </div>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border flex items-center gap-1.5">
                  <Library className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
                  <span>Words and concepts logged</span>
                </div>
              </div>

            </div>

            {/* Heatmap Section */}
            <div className="bg-white border border-[#E5E5E5] p-8 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6 border-b border-[#E5E5E5] pb-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-heading text-lg font-bold text-[#1A1A1A]">Reading Activity Heatmap</h3>
              </div>
              
              <div className="overflow-x-auto w-full pb-2">
                <div className="flex gap-[3px] min-w-[700px] justify-between">
                  {heatmapWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dIdx) => {
                        let cellBg = 'bg-[#FCFBF8] border border-[#E5E5E5]'
                        if (day.count === 1) cellBg = 'bg-[#E6C79C]/30 border border-[#E6C79C]/40'
                        else if (day.count === 2) cellBg = 'bg-[#E6C79C]/60 border border-[#E6C79C]/70'
                        else if (day.count >= 3) cellBg = 'bg-[#E6C79C] border border-[#E6C79C]'
                        
                        return (
                          <div 
                            key={dIdx} 
                            className={`w-3.5 h-3.5 cursor-pointer transition-colors ${cellBg}`}
                            title={`${day.dayStr}: ${day.count} activities`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end items-center gap-2 mt-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                <span>Less</span>
                <div className="w-3 h-3 bg-[#FCFBF8] border border-[#E5E5E5]" />
                <div className="w-3 h-3 bg-[#E6C79C]/30 border border-[#E6C79C]/40" />
                <div className="w-3 h-3 bg-[#E6C79C]/60 border border-[#E6C79C]/70" />
                <div className="w-3 h-3 bg-[#E6C79C] border border-[#E6C79C]" />
                <span>More</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Knowledge Growth Line Chart */}
              <div className="bg-white border border-[#E5E5E5] p-8 shadow-sm md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6 border-b border-[#E5E5E5] pb-4">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-heading text-lg font-bold text-[#1A1A1A]">Vocabulary Vault Growth</h3>
                  </div>
                  
                  {stats?.knowledgeGrowth && stats.knowledgeGrowth.length > 0 ? (
                    <div className="w-full flex flex-col py-4 relative">
                      <svg viewBox="0 0 600 180" className="w-full h-auto overflow-visible">
                        <defs>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E6C79C" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#E6C79C" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Grid lines */}
                        <line x1="20" y1="20" x2="580" y2="20" stroke="#F1F1F1" strokeWidth="1" />
                        <line x1="20" y1="90" x2="580" y2="90" stroke="#F1F1F1" strokeWidth="1" />
                        <line x1="20" y1="160" x2="580" y2="160" stroke="#E5E5E5" strokeWidth="1" />
                        
                        {/* Area Fill */}
                        <polygon
                          points={`20,160 ${growthChartPoints} 580,160`}
                          fill="url(#growthGradient)"
                        />
                        
                        {/* Connection Line */}
                        <polyline
                          fill="none"
                          stroke="#E6C79C"
                          strokeWidth="3"
                          points={growthChartPoints}
                        />
                      </svg>
                      
                      {/* X-Axis dates labels */}
                      <div className="flex justify-between w-full text-[10px] text-muted-foreground font-semibold px-4 mt-2">
                        <span>{stats.knowledgeGrowth[0]?.date}</span>
                        <span>{stats.knowledgeGrowth[Math.floor(stats.knowledgeGrowth.length / 2)]?.date}</span>
                        <span>{stats.knowledgeGrowth[stats.knowledgeGrowth.length - 1]?.date}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-12 text-center">No concept growth logged yet.</div>
                  )}
                </div>
              </div>

              {/* Most Active Rooms Bar Chart */}
              <div className="bg-white border border-[#E5E5E5] p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6 border-b border-[#E5E5E5] pb-4">
                    <FolderOpen className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-heading text-lg font-bold text-[#1A1A1A]">Most Active Rooms</h3>
                  </div>

                  {stats?.activeRooms && stats.activeRooms.length > 0 ? (
                    <div className="flex flex-col gap-5 py-2">
                      {stats.activeRooms.map((room, idx) => {
                        const widthPct = (room.articleCount / maxRoomArticles) * 100
                        return (
                          <div key={idx} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs font-semibold text-[#1A1A1A]">
                              <span className="line-clamp-1 max-w-[70%]">{room.name}</span>
                              <span className="text-muted-foreground">{room.articleCount} articles</span>
                            </div>
                            <div className="w-full bg-[#FCFBF8] border border-border h-4 relative">
                              <div 
                                className="bg-[#E6C79C] h-full transition-all duration-500" 
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-12 text-center">No rooms with articles found.</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )
      ) : (
        /* Synthesis Engine AI Chat UI */
        <div className="flex flex-col h-[calc(100vh-14rem)] w-full animate-in fade-in duration-300">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="flex flex-col gap-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center min-h-[360px] border border-[#E5E5E5] bg-white p-12 animate-in zoom-in-95 duration-200">
                  <Sparkles className="w-8 h-8 text-[#BDBDBD] mb-4" />
                  <p className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-2">What would you like to explore?</p>
                  <p className="font-sans text-sm text-[#747878] max-w-md">
                    Try asking for a summary of your recent articles, or finding connections between your saved concepts.
                  </p>
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 border border-[#E5E5E5] bg-white flex items-center justify-center shrink-0 mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
                      </div>
                    )}
                    
                    <div 
                      className={`px-5 py-3 max-w-[80%] text-sm font-sans leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-[#1A1A1A] text-[#F9F7F2]' 
                          : 'bg-white border border-[#E5E5E5] text-[#1A1A1A] prose prose-sm shadow-sm'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }} />
                      )}
                    </div>

                    {m.role === 'user' && (
                      <div className="w-7 h-7 border border-[#E5E5E5] bg-[#1A1A1A] flex items-center justify-center shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 text-[#F9F7F2]" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-7 h-7 border border-[#E5E5E5] bg-white flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A] animate-pulse" />
                  </div>
                  <div className="px-5 py-3 bg-white border border-[#E5E5E5] text-[#747878] text-sm font-sans">
                    <span className="animate-pulse">Synthesizing...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Chat Input form */}
          <form onSubmit={handleSubmit} className="flex gap-0 border border-[#E5E5E5] bg-white items-center shrink-0">
            <Input 
              value={input} 
              onChange={handleInputChange} 
              placeholder="Ask your library a question..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-5 h-14 shadow-none font-sans text-sm text-[#1A1A1A] placeholder:text-[#BDBDBD] rounded-none"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="h-14 w-14 shrink-0 bg-[#1A1A1A] hover:bg-[#333] text-[#F9F7F2] border-l border-[#E5E5E5] rounded-none shadow-none cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
