"use client"

import { useChat } from 'ai/react'
import { Sparkles, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function InsightsPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="w-10 h-10 bg-[#D17659]/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#D17659]" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold">Synthesis Engine</h1>
          <p className="text-muted-foreground font-source-serif">Ask questions and draw connections across your entire library.</p>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 opacity-60">
              <Sparkles className="w-12 h-12 mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">What would you like to explore?</p>
              <p className="text-muted-foreground max-w-md mt-2">
                Try asking for a summary of your recent articles, or finding connections between your saved concepts.
              </p>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#D17659]/20 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-[#D17659]" />
                  </div>
                )}
                
                <div 
                  className={`rounded-2xl px-5 py-3 max-w-[80%] ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted text-foreground rounded-tl-sm border border-border prose prose-sm dark:prose-invert'
                  }`}
                >
                  {m.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }} />
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#D17659]/20 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-[#D17659] animate-pulse" />
              </div>
              <div className="rounded-2xl px-5 py-3 bg-muted text-muted-foreground rounded-tl-sm border border-border">
                <span className="animate-pulse">Synthesizing...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2 p-2 bg-muted rounded-full border border-border items-center shrink-0 shadow-sm mt-auto">
        <Input 
          value={input} 
          onChange={handleInputChange} 
          placeholder="Ask your library a question..."
          className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-12 shadow-none"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="rounded-full h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
