import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TypewriterLogo } from "@/components/TypewriterLogo";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Side: Animated Background (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#1A1A1A]">
        <div 
          className="absolute inset-0 z-0 animate-kenburns opacity-70" 
          style={{
            backgroundImage: "url('/library_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 z-10 bg-black/30" />
        
        {/* Back Button over image */}
        <div className="absolute top-8 left-8 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-sm font-bold text-white hover:text-white/80 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Logo in center */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <TypewriterLogo />
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col bg-white">
        {/* Mobile Header */}
        <header className="lg:hidden px-6 py-6 border-b border-[#E5E5E5] flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold text-[#1A1A1A]">
            The Reading Rooms
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 font-sans text-sm font-medium text-[#747878]">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[400px]">

          <SignIn
            forceRedirectUrl="/home"
          />
        </div>
      </main>
      </div>
    </div>
  );
}
