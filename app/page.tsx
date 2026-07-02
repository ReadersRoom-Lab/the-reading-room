import Link from "next/link"
import { ArrowRight, BookOpen, Brain, FolderArchive } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TypewriterLogo } from "@/components/TypewriterLogo"
import { StreamingQuote } from "@/components/StreamingQuote"


export default async function LandingPage() {
  const { userId } = await auth()

  if (userId) {
    redirect("/home")
  }

  return (
    <div className="min-h-screen relative flex flex-col w-full overflow-hidden bg-[#1A1A1A]">
      {/* Background with subtle animation */}
      <div 
        className="absolute inset-0 z-0 animate-kenburns opacity-70" 
        style={{
          backgroundImage: "url('/library_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Subtle Grain Texture Overlay */}
      <div className="absolute inset-0 z-0 mix-blend-overlay opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')", backgroundRepeat: 'repeat' }} />
      
      {/* Dark Overlay to ensure white text readability */}
      <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[4px]" />

      <div className="relative z-10 flex-1 flex flex-col w-full">
        {/* Top Navigation Bar */}
        <header className="border-b border-white/10 bg-transparent">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold text-white drop-shadow-md">
            The Reading Rooms
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/sign-in" className="font-sans text-sm font-medium text-white/80 hover:text-white transition-colors">
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

      {/* Hero Section - Using flex to vertically center and reduce padding to prevent scroll */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 lg:px-12 py-8 flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-5 flex flex-col gap-8">
          <p className="font-sans text-xs font-bold tracking-[0.15em] text-white/70 uppercase animate-slide-up" style={{ animationDelay: '100ms' }}>
            {"Est. 2026 › A Digital Sanctuary"}
          </p>

          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <TypewriterLogo />
          </div>

          <p className="font-serif text-lg lg:text-xl text-white/90 leading-relaxed max-w-md drop-shadow-md animate-slide-up" style={{ animationDelay: '300ms' }}>
            Read. Archive. Think. Learn.{" "}
            <span className="italic">Turn articles into lasting knowledge.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <Link
              href="/sign-up"
              className="group inline-flex items-center justify-center gap-2 bg-white text-[#1A1A1A] font-sans text-sm font-semibold px-8 py-4 hover:bg-gray-100 transition-colors shadow-none rounded-none"
            >
              Start Reading Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
        <div className="lg:col-span-7 flex flex-col gap-px border border-[#E5E5E5] animate-slide-up" style={{ animationDelay: '500ms' }}>
          {/* Quote Panel */}
          <div className="bg-white border-b border-[#E5E5E5] p-8 lg:p-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <BookOpen className="w-6 h-6 text-[#747878] group-hover:text-[#1A1A1A] transition-colors duration-500 mb-6" />
              <StreamingQuote />
            </div>
          </div>

          {/* App Preview Mockup */}
          <div className="bg-gray-50/50 p-8 lg:p-12 relative overflow-hidden flex items-center justify-center border-t border-[#E5E5E5]">
            
            {/* Glow effect behind the mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] h-[300px] bg-white/80 blur-[80px] rounded-full pointer-events-none" />

            {/* The Mockup Window */}
            <div className="relative z-10 w-full max-w-[480px] bg-white border border-gray-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden transform hover:-translate-y-2 hover:shadow-[0_30px_50px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 ease-out group/mockup">
              
              {/* Mockup Topbar */}
              <div className="h-10 border-b border-gray-100 flex items-center justify-between px-4 bg-[#FDFBF7]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="font-sans text-[10px] text-gray-400 font-bold tracking-widest uppercase">The Reading Rooms</div>
                <div className="w-10"></div> {/* Spacer for centering */}
              </div>

              {/* Mockup Body */}
              <div className="p-8 pb-10 relative">
                <h4 className="font-heading font-bold text-xl text-[#1A1A1A] mb-4">
                  The Architecture of Thought
                </h4>
                
                <p className="font-serif text-sm leading-loose text-gray-600 mb-4 selection:bg-[#E4D7C5]/40">
                  When we interact with complex systems, our minds naturally seek to build <mark className="bg-[#E4D7C5]/40 text-black px-1 rounded border-b-2 border-[#E4D7C5]">structural scaffolding</mark>. This allows us to map new concepts onto existing frameworks.
                </p>
                <p className="font-serif text-sm leading-loose text-gray-600 selection:bg-[#E4D7C5]/40">
                  The most effective learning environments are those that <mark className="bg-[#D1D9D3]/40 text-black px-1 rounded border-b-2 border-[#D1D9D3] transition-colors group-hover/mockup:bg-[#D1D9D3]/80">encourage active synthesis</mark> rather than passive consumption. By highlighting and annotating, we transform the text into our own context.
                </p>

                {/* Floating Highlight Menu (pops up on hover) */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#E5E5E5] shadow-xl rounded-md p-1.5 flex gap-1.5 opacity-0 group-hover/mockup:opacity-100 group-hover/mockup:-translate-y-6 transition-all duration-500 ease-out pointer-events-none">
                  <div className="w-5 h-5 rounded-full bg-[#E4D7C5]" />
                  <div className="w-5 h-5 rounded-full bg-[#D1D9D3] scale-110 shadow-sm border border-black/10" />
                  <div className="w-5 h-5 rounded-full bg-[#E6D0D3]" />
                  <div className="w-5 h-5 rounded-full bg-[#D1D5E4]" />
                  <div className="w-[1px] h-5 bg-gray-200 mx-1" />
                  <div className="w-5 h-5 flex items-center justify-center text-[#1A1A1A]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                </div>
              </div>
              
              {/* Fade out bottom to indicate scrollable content */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-transparent">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-white/50 tracking-[0.03em]">
            © 2026 The Reading Rooms
          </p>
          <p className="font-serif text-xs italic text-white/40">
            Read deeply. Think clearly.
          </p>
        </div>
      </footer>
      </div>
    </div>
  )
}
