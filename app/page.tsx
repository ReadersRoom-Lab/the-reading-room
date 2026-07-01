import Link from "next/link"
import { ArrowRight, BookOpen, Brain, FolderArchive } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col w-full">

      {/* Top Navigation Bar */}
      <header className="border-b border-[#E5E5E5] bg-[#F9F7F2]">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between">
          <span className="font-heading text-lg font-semibold text-[#1A1A1A] tracking-tight">
            The Reading Room
          </span>
          <nav className="flex items-center gap-8">
            <Link href="/sign-in" className="font-sans text-sm text-[#747878] hover:text-[#1A1A1A] transition-colors">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="font-sans text-sm font-medium bg-[#1A1A1A] text-[#F9F7F2] px-5 py-2 hover:bg-[#333] transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Using flex to vertically center and reduce padding to prevent scroll */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 lg:px-12 py-8 flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-5 flex flex-col gap-8">
          <p className="font-sans text-xs font-medium tracking-[0.15em] text-[#747878] uppercase">
            Est. 2026 &nbsp;›&nbsp; A Digital Sanctuary
          </p>

          <h1 className="font-heading text-5xl lg:text-7xl font-bold text-[#1A1A1A] leading-[1.05] tracking-tight">
            The<br />Reading Room
          </h1>

          <p className="font-serif text-lg lg:text-xl text-[#444748] leading-relaxed max-w-md">
            Read. Archive. Think. Learn.{" "}
            <span className="italic">Turn articles into lasting knowledge.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-[#F9F7F2] font-sans text-sm font-semibold px-8 py-4 hover:bg-[#333] transition-colors"
            >
              Start Reading Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 border border-[#1A1A1A] text-[#1A1A1A] font-sans text-sm font-semibold px-8 py-4 hover:bg-[#E5E5E5] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Column: Feature Panels */}
        <div className="lg:col-span-7 flex flex-col gap-px border border-[#E5E5E5]">
          {/* Quote Panel */}
          <div className="bg-white border-b border-[#E5E5E5] p-8 lg:p-12">
            <BookOpen className="w-6 h-6 text-[#747878] mb-6" />
            <blockquote className="font-serif text-xl lg:text-2xl text-[#1A1A1A] leading-relaxed italic mb-6">
              &ldquo;A library is not a luxury but one of the necessities of life.&rdquo;
            </blockquote>
            <p className="font-sans text-xs tracking-[0.05em] text-[#747878] uppercase font-medium">
              Henry Ward Beecher
            </p>
          </div>

          {/* Three-column features */}
          <div className="grid sm:grid-cols-3 gap-px bg-[#E5E5E5]">
            <div className="bg-white p-6 lg:p-8">
              <FolderArchive className="w-5 h-5 text-[#747878] mb-5" />
              <h3 className="font-heading text-base font-bold text-[#1A1A1A] mb-2">Archive</h3>
              <p className="font-sans text-sm text-[#444748] leading-relaxed">
                Build a personal, lasting vault of knowledge.
              </p>
            </div>
            <div className="bg-white p-6 lg:p-8">
              <Brain className="w-5 h-5 text-[#747878] mb-5" />
              <h3 className="font-heading text-base font-bold text-[#1A1A1A] mb-2">Think</h3>
              <p className="font-sans text-sm text-[#444748] leading-relaxed">
                Structural scaffolding for deep intellectual exploration.
              </p>
            </div>
            <div className="bg-white p-6 lg:p-8">
              <BookOpen className="w-5 h-5 text-[#747878] mb-5" />
              <h3 className="font-heading text-base font-bold text-[#1A1A1A] mb-2">Learn</h3>
              <p className="font-sans text-sm text-[#444748] leading-relaxed">
                Transform passive reading into active understanding.
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E5] bg-[#F9F7F2]">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-[#747878] tracking-[0.03em]">
            © 2026 The Reading Room
          </p>
          <p className="font-serif text-xs italic text-[#BDBDBD]">
            Read deeply. Think clearly.
          </p>
        </div>
      </footer>
    </div>
  )
}
