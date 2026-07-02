import { Download, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ChromeExtensionPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="font-heading text-5xl font-bold text-[#1A1A1A] mb-4">Browser Extension</h1>
        <p className="font-serif text-xl text-[#444748] leading-relaxed">
          The best way to save articles to your library. Bypasses paywalls and anti-bot protections by saving exactly what you see on your screen.
        </p>
      </div>

      <div className="border border-[#E5E5E5] bg-white p-10 mb-12">
        <h2 className="font-heading text-3xl font-bold text-[#1A1A1A] mb-8">Installation Guide</h2>
        
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2">Open Extension Settings</h3>
              <p className="font-sans text-[#747878] mb-3">Copy and paste this URL into your Chrome address bar:</p>
              <code className="bg-[#F4F3F3] text-[#1A1A1A] px-3 py-1.5 rounded text-sm font-mono block w-fit">
                chrome://extensions/
              </code>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2">Enable Developer Mode</h3>
              <p className="font-sans text-[#747878]">
                Find the <strong className="text-[#1A1A1A]">Developer mode</strong> toggle switch in the top right corner of the extensions page and turn it on.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2">Load the Extension</h3>
              <p className="font-sans text-[#747878] mb-4">
                Click the <strong className="text-[#1A1A1A]">Load unpacked</strong> button in the top left and select the <code className="bg-[#F4F3F3] text-sm px-1.5 py-0.5 rounded">chrome-extension</code> folder located in this project&apos;s directory:
              </p>
              <div className="bg-[#F4F3F3] p-4 rounded-md flex items-center gap-3">
                <Download className="w-5 h-5 text-[#747878]" />
                <span className="font-mono text-sm text-[#1A1A1A]">d:\the-reading-room\chrome-extension</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2">You&apos;re all set!</h3>
              <p className="font-sans text-[#747878]">
                Pin the extension to your toolbar. Next time you hit a paywall or want to save a great article, just click the icon!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Link href="/home" className="flex items-center gap-2 font-sans text-sm font-bold tracking-widest text-[#1A1A1A] uppercase hover:text-[#747878] transition-colors">
          Return Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
