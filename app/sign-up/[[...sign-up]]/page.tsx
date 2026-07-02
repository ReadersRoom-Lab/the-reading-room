import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TypewriterLogo } from "@/components/TypewriterLogo";
import { DustMotes } from "@/components/DustMotes";

export default function SignUpPage() {
  return (
    <div className="h-[100dvh] overflow-hidden flex w-full bg-[#1A1A1A]">
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
        <div className="absolute inset-0 z-10 bg-black/40" />
        <DustMotes />
        
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
      <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col bg-[#1A1A1A] relative z-20 border-l border-white/10 overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold text-[#FDFBF7]">
            The Reading Rooms
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 font-sans text-sm font-medium text-gray-400">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-[max-content]">
          <div className="w-full max-w-[400px]">

          <SignUp
            forceRedirectUrl="/onboarding"
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
