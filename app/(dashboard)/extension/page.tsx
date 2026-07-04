import { Download, Package, Settings, CheckCircle, ExternalLink, Puzzle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Browser Extension – The Reading Room",
  description: "Install the Reading Room browser extension to save articles directly from any web page.",
}

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Download the Extension",
    description: 'Click the "Download Extension" button below to download a .zip file containing the extension files.',
  },
  {
    number: "02",
    icon: Package,
    title: "Unzip the File",
    description: "Extract the downloaded zip file to a permanent folder on your computer — somewhere you won't accidentally delete it.",
  },
  {
    number: "03",
    icon: Puzzle,
    title: "Open Chrome Extensions",
    description: 'In Chrome, navigate to chrome://extensions or go to Menu → More Tools → Extensions. Enable "Developer mode" using the toggle in the top right.',
  },
  {
    number: "04",
    icon: Package,
    title: 'Click "Load unpacked"',
    description: 'Click the "Load unpacked" button that appears after enabling Developer mode. Select the folder you unzipped in step 2.',
  },
  {
    number: "05",
    icon: Settings,
    title: "Configure the Extension",
    description: 'Right-click the extension icon and click "Options". Enter your Reading Room URL (this page\'s domain) and save.',
  },
  {
    number: "06",
    icon: CheckCircle,
    title: "Start Saving!",
    description: "Browse any article or web page, click the Reading Room icon in your toolbar, and hit Save. It will appear in your Library instantly.",
  },
]

export default function ExtensionPage() {
  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-sans font-medium tracking-[0.14em] text-[#BDBDBD] uppercase mb-3">
          Browser Extension
        </p>
        <h1 className="font-heading font-bold text-3xl text-[#1A1A1A] leading-tight tracking-tight mb-4">
          Save articles from anywhere
        </h1>
        <p className="text-[#52525B] font-sans text-base leading-relaxed max-w-xl">
          Install the Reading Room extension for Chrome to clip any article, blog post, or research paper directly into your library with a single click — no copy-pasting URLs needed.
        </p>
      </div>

      {/* Download CTA */}
      <div className="border border-[#E5E5E5] bg-white p-6 mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="font-heading font-bold text-lg text-[#1A1A1A] mb-1">Reading Room Extension</p>
          <p className="text-sm text-[#52525B] font-sans">Chrome · Manifest V3 · Developer Mode Install</p>
        </div>
        <a
          href="/extension.zip"
          download
          className="inline-flex items-center gap-2 bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#333] px-5 py-2.5 text-sm font-medium font-sans transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Download .zip
        </a>
      </div>

      {/* Steps */}
      <div className="mb-10">
        <h2 className="font-heading font-bold text-xl text-[#1A1A1A] mb-6">Installation steps</h2>
        <div className="flex flex-col gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex gap-5 pb-8 last:pb-0 relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[19px] top-10 w-px bg-[#E5E5E5]" style={{ bottom: 0 }} />
                )}
                {/* Number badge */}
                <div className="shrink-0 w-10 h-10 border border-[#E5E5E5] bg-[#F9F7F2] flex items-center justify-center z-10">
                  <span className="font-mono text-xs font-bold text-[#BDBDBD]">{step.number}</span>
                </div>
                {/* Content */}
                <div className="flex flex-col gap-1 pt-2">
                  <p className="font-sans font-semibold text-sm text-[#1A1A1A]">{step.title}</p>
                  <p className="font-sans text-sm text-[#52525B] leading-relaxed">{step.description}</p>
                  {/* Special action for step 3 */}
                  {i === 2 && (
                    <a
                      href="chrome://extensions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1A1A1A] underline underline-offset-2 mt-1"
                    >
                      Open chrome://extensions <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Note about web store */}
      <div className="border border-dashed border-[#E5E5E5] p-5 bg-[#F9F7F2]">
        <p className="text-xs font-sans font-medium tracking-[0.1em] text-[#BDBDBD] uppercase mb-1">Coming soon</p>
        <p className="text-sm text-[#52525B] font-sans">
          We're working on publishing this extension to the Chrome Web Store so installation becomes one click. Stay tuned!
        </p>
      </div>
    </div>
  )
}
