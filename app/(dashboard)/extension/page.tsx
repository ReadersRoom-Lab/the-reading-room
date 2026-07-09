"use client"

import { useState } from "react"
import { Download, Puzzle, CheckCircle, Settings, Copy, Check } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Download & Unzip",
    description: 'Click "Download Extension" below. Once downloaded, extract (unzip) the folder to a permanent location on your computer.',
  },
  {
    number: "02",
    icon: Puzzle,
    title: "Load in Chrome",
    description: 'In Chrome, type the following into the address bar and press Enter:',
    code: 'chrome://extensions',
    codeNote: 'Enable "Developer mode" (top-right toggle), then click "Load unpacked" and select the unzipped folder.',
  },
  {
    number: "03",
    icon: Settings,
    title: "Set your app URL",
    description: 'Right-click the Reading Room icon in your Chrome toolbar → click "Options". Enter this page\'s URL and click Save.',
    code: window !== undefined ? window.location.origin : '',
    codeNote: 'This tells the extension where to send saved articles.',
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Start saving!",
    description: "Browse any article or web page, click the Reading Room icon, and hit Save. It will appear in your Library instantly.",
  },
]

function CopyCode({ code }: Readonly<{ code: string }>) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-2 mt-2 bg-[#1A1A1A] text-[#F9F7F2] px-3 py-2 font-mono text-xs w-fit max-w-full">
      <span className="truncate">{code}</span>
      <button onClick={copy} className="shrink-0 ml-1 hover:opacity-70 transition-opacity" aria-label="Copy">
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

export default function ExtensionPage() {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    window.location.href = '/extension.zip'
    setTimeout(() => setDownloading(false), 3000)
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
          <p className="text-sm text-[#52525B] font-sans">Chrome · Developer Mode install</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#333] px-5 py-2.5 text-sm font-medium font-sans transition-colors shrink-0 disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Downloading...' : 'Download Extension'}
        </button>
      </div>

      {/* Steps */}
      <div className="mb-10">
        <h2 className="font-heading font-bold text-xl text-[#1A1A1A] mb-6">Install in 4 simple steps</h2>
        <div className="flex flex-col">
          {[
            {
              number: "01", icon: Download, title: "Download & Unzip",
              description: 'Click "Download Extension" above. Once downloaded, extract (unzip) the folder to a permanent location on your computer.',
            },
            {
              number: "02", icon: Puzzle, title: "Open Chrome Extensions",
              description: 'Type this into your Chrome address bar and press Enter:',
              code: 'chrome://extensions',
              codeNote: 'Enable "Developer mode" toggle (top-right), click "Load unpacked", and select the unzipped folder.',
            },
            {
              number: "03", icon: Settings, title: "Connect your Workspace",
              description: 'Click the Reading Room extension icon in your Chrome toolbar while visiting this dashboard. Click "Connect Workspace" to pair them.',
            },
            {
              number: "04", icon: CheckCircle, title: "Start saving!",
              description: "Browse any web page, click the Reading Room extension icon, and hit Save. The article will appear in your Library instantly.",
            },
          ].map((step, i, arr) => {
            return (
              <div key={step.number} className="flex gap-5 pb-8 last:pb-0 relative">
                {i < arr.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-[#E5E5E5]" />
                )}
                <div className="shrink-0 w-10 h-10 border border-[#E5E5E5] bg-[#F9F7F2] flex items-center justify-center z-10">
                  <span className="font-mono text-xs font-bold text-[#BDBDBD]">{step.number}</span>
                </div>
                <div className="flex flex-col gap-1 pt-2 min-w-0">
                  <p className="font-sans font-semibold text-sm text-[#1A1A1A]">{step.title}</p>
                  <p className="font-sans text-sm text-[#52525B] leading-relaxed">{step.description}</p>
                  {step.code && <CopyCode code={step.code} />}
                  {step.codeNote && (
                    <p className="font-sans text-xs text-[#52525B] leading-relaxed mt-1">{step.codeNote}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <div className="border border-dashed border-[#E5E5E5] p-5 bg-[#F9F7F2]">
        <p className="text-xs font-sans font-medium tracking-[0.1em] text-[#BDBDBD] uppercase mb-1">Coming soon</p>
        <p className="text-sm text-[#52525B] font-sans">
          We're working on publishing to the Chrome Web Store so installation becomes one click. Stay tuned!
        </p>
      </div>
    </div>
  )
}
