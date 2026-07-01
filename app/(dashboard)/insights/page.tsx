"use client"

import { useChat } from 'ai/react'
import { Sparkles, Send, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function InsightsPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full">

      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#E5E5E5] mb-6">
        <div className="w-10 h-10 border border-[#E5E5E5] bg-white flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#1A1A1A]" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#1A1A1A]">Synthesis Engine</h1>
          <p className="font-serif text-sm text-[#747878]">Ask questions and draw connections across your entire library.</p>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-[360px] border border-[#E5E5E5] bg-white p-12">
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
                      : 'bg-white border border-[#E5E5E5] text-[#1A1A1A] prose prose-sm'
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-0 border border-[#E5E5E5] bg-white items-center shrink-0">
        <Input 
          value={input} 
          onChange={handleInputChange} 
          placeholder="Ask your library a question..."
          className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-5 h-14 shadow-none font-sans text-sm text-[#1A1A1A] placeholder:text-[#BDBDBD]"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="h-14 w-14 shrink-0 bg-[#1A1A1A] hover:bg-[#333] text-[#F9F7F2] border-l border-[#E5E5E5] rounded-none shadow-none"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
