"use client"

import { useState } from "react"
import { Download, Puzzle, CheckCircle, Loader2 } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Download & Unzip",
    description: 'Click "Download Extension" below. Once downloaded, extract (unzip) the folder to a permanent location on your computer — somewhere you won\'t accidentally delete it.',
  },
  {
    number: "02",
    icon: Puzzle,
    title: "Load in Chrome",
    description: 'Open Chrome and go to chrome://extensions. Enable "Developer mode" with the toggle in the top-right corner, then click "Load unpacked" and select the unzipped folder.',
    link: { label: 'Open chrome://extensions →', href: 'chrome://extensions' },
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Start saving!",
    description: "That's it — no setup needed. Browse any article or web page, click the Reading Room icon in your toolbar, and hit Save. It will appear in your Library instantly.",
  },
]

export default function ExtensionPage() {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch('/api/extension/download')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error: ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reading-room-extension.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-sans font-medium tracking-[0.14em] text-[#BDBDBD] uppercase mb-3">
          Browser Extension
        </p>
        <h1 className="font-heading font-bold text-3xl text-[#1A1A1A] leading-tight tracking-tight mb-4">
          Save articles from anywhere
        </h1>
        <p className="text-[#52525B] font-sans text-base leading-relaxed">
          Clip any article, blog post, or research paper directly into your library with a single click — no copy-pasting URLs needed.
        </p>
      </div>

      {/* Download CTA */}
      <div className="border border-[#E5E5E5] bg-white p-6 mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="font-heading font-bold text-lg text-[#1A1A1A] mb-1">Reading Room Extension</p>
          <p className="text-sm text-[#52525B] font-sans">Chrome · Pre-configured · Ready to install</p>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#333] px-5 py-2.5 text-sm font-medium font-sans transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>
          ) : (
            <><Download className="w-4 h-4" /> Download Extension</>
          )}
        </button>
      </div>

      {/* Steps */}
      <div className="mb-10">
        <h2 className="font-heading font-bold text-xl text-[#1A1A1A] mb-6">Install in 3 steps</h2>
        <div className="flex flex-col">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex gap-5 pb-8 last:pb-0 relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-[#E5E5E5]" />
                )}
                <div className="shrink-0 w-10 h-10 border border-[#E5E5E5] bg-[#F9F7F2] flex items-center justify-center z-10">
                  <span className="font-mono text-xs font-bold text-[#BDBDBD]">{step.number}</span>
                </div>
                <div className="flex flex-col gap-1 pt-2">
                  <p className="font-sans font-semibold text-sm text-[#1A1A1A]">{step.title}</p>
                  <p className="font-sans text-sm text-[#52525B] leading-relaxed">{step.description}</p>
                  {step.link && (
                    <a
                      href={step.link.href}
                      className="text-xs font-medium text-[#1A1A1A] underline underline-offset-2 mt-1 w-fit"
                    >
                      {step.link.label}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <div className="border border-dashed border-[#E5E5E5] p-5 bg-[#F9F7F2]">
        <p className="text-xs font-sans font-medium tracking-[0.1em] text-[#BDBDBD] uppercase mb-1">Why Developer Mode?</p>
        <p className="text-sm text-[#52525B] font-sans">
          Chrome requires Developer Mode to install extensions not yet published to the Web Store. We're working on a one-click Chrome Web Store listing — stay tuned!
        </p>
      </div>
    </div>
  )
}
