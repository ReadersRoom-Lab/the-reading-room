import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { TypewriterLogo } from "@/components/TypewriterLogo";
import { StreamingQuote } from "@/components/StreamingQuote";
import { LandingMockup } from "@/components/LandingMockup";
import { DustMotes } from "@/components/DustMotes";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="h-[100dvh] relative flex w-full overflow-hidden bg-[#1A1A1A]">
      {/* Background with subtle animation */}
      <div className="absolute inset-0 z-0 animate-kenburns opacity-70">
        <Image
          src="/library_bg.png"
          alt="Library Background"
          fill
          priority
          sizes="100vw"
          quality={75}
          className="object-cover object-center"
        />
      </div>
      {/* Subtle Grain Texture Overlay */}
      <div
        className="absolute inset-0 z-0 mix-blend-overlay opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Dark Overlay to ensure white text readability */}
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[4px]" />

      {/* Floating Dust Particles */}
      <DustMotes />

      <div className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Top Navigation Bar */}
        <header className="border-b border-white/10 bg-transparent flex-none">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between w-full">
            <Link href="/" className="font-heading text-xl font-bold text-white drop-shadow-md">
              ReadrSpace
            </Link>
            <nav className="flex items-center gap-4 sm:gap-8">
              <Link
                href="/sign-in"
                className="font-sans text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="font-sans text-sm font-semibold bg-white text-[#1A1A1A] px-5 py-2 hover:bg-gray-100 transition-colors shadow-none rounded-none"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main
          role="main"
          className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 lg:py-12 flex flex-col"
        >
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <p
                className="font-sans text-xs font-bold tracking-[0.15em] text-white/70 uppercase animate-slide-up"
                style={{ animationDelay: "100ms" }}
              >
                {"Est. 2026 › A Digital Sanctuary"}
              </p>

              <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
                <TypewriterLogo />
              </div>

              <p
                className="font-serif text-lg lg:text-xl text-white/90 leading-relaxed max-w-md drop-shadow-md animate-slide-up"
                style={{ animationDelay: "300ms" }}
              >
                Read. Archive. Think. Learn.{" "}
                <span className="italic">Turn articles into lasting knowledge.</span>
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up"
                style={{ animationDelay: "400ms" }}
              >
                <Link
                  href="/sign-up"
                  className="group relative inline-flex items-center justify-center gap-2 bg-white text-[#1A1A1A] font-sans text-sm font-semibold px-8 py-4 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 rounded-none overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-200/50 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10 flex items-center gap-2">
                    Start Reading Free{" "}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-sans text-sm font-semibold px-8 py-4 hover:bg-white/10 hover:border-white transition-colors backdrop-blur-sm shadow-none rounded-none"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Column: Feature Panels */}
            <div
              className="lg:col-span-7 flex flex-col gap-px border border-[#E5E5E5] animate-slide-up bg-white rounded-lg overflow-hidden shadow-2xl"
              style={{ animationDelay: "500ms" }}
            >
              {/* Quote Panel */}
              <div className="bg-white border-b border-[#E5E5E5] p-6 lg:p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <BookOpen className="w-5 h-5 text-[#52525B] group-hover:text-[#1A1A1A] transition-colors duration-500 mb-4" />
                  <StreamingQuote />
                </div>
              </div>

              {/* App Preview Mockup */}
              <LandingMockup />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-transparent flex-none">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <p className="font-sans text-xs text-white/50 tracking-[0.03em]">© 2026 ReadrSpace</p>
            <p className="font-serif text-xs italic text-white/40">Read deeply. Think clearly.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
