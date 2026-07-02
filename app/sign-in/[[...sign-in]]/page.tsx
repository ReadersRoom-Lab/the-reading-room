import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
        
        {/* Fireplace Glow - Centered at the bottom of the auth panel, expanded to cover most of the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none z-0">
          <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-600/40 blur-[120px] rounded-[100%] mix-blend-screen animate-fire-glow" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/50 blur-[90px] rounded-[100%] mix-blend-screen animate-fire-glow" style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-yellow-400/40 blur-[60px] rounded-[100%] mix-blend-screen animate-fire-glow" style={{ animationDelay: '1s', animationDuration: '2s' }} />
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

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto auth-container">
          <div className="w-full max-w-[400px] animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>

          <SignIn
            forceRedirectUrl="/home"
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: 'transparent',
                colorInputBackground: 'transparent',
                colorText: '#FDFBF7',
                colorInputText: '#FDFBF7',
                colorTextSecondary: '#9ca3af',
                colorPrimary: '#FDFBF7',
              },
              elements: {
                rootBox: "w-full",
                card: { backgroundColor: 'transparent', border: 'none', boxShadow: 'none', padding: '0px' },
                footer: { background: 'transparent' },
                headerTitle: { color: '#FDFBF7', fontFamily: 'var(--font-source-serif)', fontSize: '1.75rem', fontWeight: 'bold', letterSpacing: '-0.02em' },
                headerSubtitle: { color: '#9ca3af', fontFamily: 'var(--font-inter)', fontSize: '0.875rem' },
                formFieldLabelRow: { marginBottom: '8px' },
                formFieldLabel: { 
                  color: '#BDBDBD', 
                  fontFamily: 'var(--font-inter)', 
                  fontSize: '11px', 
                  letterSpacing: '0.1em', 
                  textTransform: 'uppercase',
                  fontWeight: '600'
                },
                formFieldInput: { backgroundColor: 'rgba(0, 0, 0, 0.2)', color: '#FDFBF7', borderColor: 'rgba(255, 255, 255, 0.15)' },
                formButtonPrimary: { backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#111111', border: 'none', borderRadius: '0px', fontWeight: 'bold' },
                socialButtonsBlockButton: { color: '#FDFBF7', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0px' },
                socialButtonsBlockButtonText: { color: '#FDFBF7', fontWeight: '500' },
                dividerText: { color: '#C4A882', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' },
                dividerLine: { background: 'rgba(196, 168, 130, 0.2)' },
                footerActionText: { color: '#9ca3af' },
                formFieldInputShowPasswordButton: { color: '#9ca3af' },
                identityPreviewText: { color: '#FDFBF7', fontWeight: 'bold' },
                identityPreviewEditButtonIcon: { color: '#9ca3af' }
              },
            }}
          />
        </div>
      </main>
      </div>
    </div>
  );
}
