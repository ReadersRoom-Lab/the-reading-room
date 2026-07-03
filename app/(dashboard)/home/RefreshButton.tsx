"use client"

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <button 
      onClick={handleRefresh}
      className="font-sans text-[11px] font-medium tracking-[0.15em] text-[#52525B] uppercase mb-5 flex items-center gap-2 hover:text-[#1A1A1A] transition-colors cursor-pointer"
    >
      <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> 
      Today&apos;s Rediscovery
    </button>
  )
}
