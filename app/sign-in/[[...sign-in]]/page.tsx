import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TypewriterLogo } from "@/components/TypewriterLogo";
import { DustMotes } from "@/components/DustMotes";

export default function SignInPage() {
  return (
    <div className="h-[100dvh] overflow-hidden flex w-full relative bg-black">
      {/* Full Page Background */}
      <div 
        className="absolute inset-0 z-0 animate-kenburns opacity-70" 
        style={{
          backgroundImage: "url('/library_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
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
      <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col relative z-20 bg-black/40 backdrop-blur-2xl border-l border-white/10 overflow-hidden">
        
        {/* Fireplace Glow - Centered at the bottom of the auth panel */}
        <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-0">
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-600/40 blur-[80px] rounded-full mix-blend-screen animate-fire-glow" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-amber-500/50 blur-[60px] rounded-full mix-blend-screen animate-fire-glow" style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[150px] h-[150px] bg-yellow-400/40 blur-[40px] rounded-full mix-blend-screen animate-fire-glow" style={{ animationDelay: '1s', animationDuration: '2s' }} />
        </div>

        {/* Mobile Header */}
        <header className="relative z-10 lg:hidden px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold text-[#FDFBF7]">
            The Reading Rooms
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 font-sans text-sm font-medium text-gray-400">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-[400px]">

          <SignIn
            forceRedirectUrl="/home"
            appearance={{
              variables: {
                colorBackground: 'transparent',
                colorInputBackground: 'transparent',
                colorText: '#FDFBF7',
                colorInputText: '#FDFBF7',
                colorTextSecondary: '#9ca3af',
              },
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none bg-transparent m-0 p-0",
                headerTitle: "font-heading text-2xl font-bold text-[#FDFBF7]",
                headerSubtitle: "font-sans text-sm text-gray-400",
                socialButtonsBlockButton: "rounded-none border border-white/20 bg-transparent text-[#FDFBF7] font-sans font-medium hover:bg-white/5 transition-colors shadow-none",
                socialButtonsBlockButtonText: "font-sans font-semibold text-sm",
                dividerLine: "bg-white/20",
                dividerText: "font-sans text-xs text-gray-500 uppercase tracking-widest",
                formFieldLabel: "font-sans text-xs font-bold uppercase tracking-wider text-gray-400",
                formFieldInput: "rounded-none border-white/20 bg-transparent text-white focus:border-[#FDFBF7] focus:ring-[#FDFBF7] font-sans text-sm",
                formButtonPrimary: "rounded-none bg-[#FDFBF7] text-[#1A1A1A] font-sans font-bold hover:bg-white transition-colors shadow-none py-3 text-sm",
                footerActionText: "font-sans text-sm text-gray-400",
                footerActionLink: "font-sans text-sm font-bold text-[#FDFBF7] hover:text-white",
                identityPreviewText: "font-sans text-sm font-semibold text-[#FDFBF7]",
                identityPreviewEditButtonIcon: "text-gray-400 hover:text-white"
              },
            }}
          />
        </div>
      </main>
      </div>
    </div>
  );
}
