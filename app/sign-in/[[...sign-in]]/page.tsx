import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TypewriterLogo } from "@/components/TypewriterLogo";
import { DustMotes } from "@/components/DustMotes";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="h-[100dvh] overflow-hidden flex w-full relative bg-black">
      {/* Full Page Background */}
      <div className="absolute inset-0 z-0 animate-kenburns opacity-70">
        <Image
          src="/library_sketch_bg.png"
          alt="Library Background"
          fill
          priority
          quality={75}
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 z-10 bg-black/50" />
      <div className="absolute inset-0 z-10 pointer-events-none"><DustMotes /></div>

      {/* Left Side: Logo (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 relative z-20">
        
        {/* Back Button */}
        <div className="absolute top-8 left-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-sm font-bold text-white hover:text-white/80 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <TypewriterLogo />
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col relative z-20 bg-white/95 backdrop-blur-xl border-l border-white/20 overflow-hidden shadow-2xl">
        
        {/* Mobile Header */}
        <header className="relative z-10 lg:hidden px-6 py-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold text-gray-900">
            The Reading Rooms
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 font-sans text-sm font-medium text-gray-500">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-[400px] animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <SignIn forceRedirectUrl="/home" />
          </div>
        </main>
      </div>
    </div>
  );
}
