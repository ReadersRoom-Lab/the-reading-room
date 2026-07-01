import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center pt-32 px-6">
      <main className="flex flex-col items-center text-center max-w-4xl w-full">
        <p className="text-sm font-semibold tracking-widest text-[#9A8F82] uppercase mb-8">
          Est. 2024 — A Digital Sanctuary
        </p>
        
        <h1 className="text-6xl md:text-7xl font-heading font-bold text-[#1a1a1a] mb-6">
          The Reading Room
        </h1>
        
        <p className="text-2xl font-source-serif text-[#333333] mb-2">
          Read. Archive. Think. Learn.
        </p>
        <p className="text-xl font-source-serif italic text-[#666666] mb-12">
          Turn articles into lasting knowledge.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full justify-center max-w-lg">
          <Link href="/sign-up" className="flex-1">
            <Button className="w-full h-14 text-base font-semibold bg-[#1a1a1a] text-white hover:bg-black rounded-none">
              Start Reading Free
            </Button>
          </Link>
          <Link href="/pro" className="flex-1">
            <Button variant="outline" className="w-full h-14 text-base font-semibold border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-zinc-100 rounded-none bg-transparent">
              Explore Pro
            </Button>
          </Link>
        </div>

        <div className="w-full h-px bg-zinc-200 mb-16" />

        <div className="grid md:grid-cols-2 gap-16 text-left mb-24 w-full">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#9A8F82] uppercase mb-4">
              01 / Discourse
            </p>
            <p className="font-source-serif text-xl italic text-[#444] leading-relaxed">
              &quot;A library is not a luxury but one of the necessities of life.&quot;
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#9A8F82] uppercase mb-4">
              02 / Mission
            </p>
            <p className="font-source-serif text-xl text-[#444] leading-relaxed">
              We provide the structural scaffolding for deep intellectual exploration in an age of fragmented attention.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
