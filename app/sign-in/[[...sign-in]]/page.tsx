import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        <div className="absolute inset-0 z-10 bg-black/10" />
        
        {/* Logo over image */}
        <div className="absolute top-8 left-10 z-20">
          <Link
            href="/"
            className="font-heading text-2xl font-bold text-white hover:opacity-80 transition-opacity drop-shadow-md"
          >
            The Reading Room
          </Link>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden px-6 py-6 border-b border-[#E5E5E5]">
          <Link
            href="/"
            className="font-heading text-xl font-bold text-[#1A1A1A]"
          >
            The Reading Room
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[400px]">

          <SignIn
            forceRedirectUrl="/home"
            appearance={{
              variables: {
                colorPrimary: "#1A1A1A",
                colorBackground: "#FFFFFF",
                fontFamily: "var(--font-inter)",
                borderRadius: "0px",
              },
              elements: {
                card: "border border-[#E5E5E5] shadow-none bg-white",
                headerTitle: "font-heading font-bold text-xl text-[#1A1A1A]",
                headerSubtitle: "font-sans text-sm text-[#747878]",
                socialButtonsBlockButton: "border border-[#E5E5E5] hover:bg-[#F4F3F3] text-[#1A1A1A] rounded-none shadow-none",
                formButtonPrimary: "bg-[#1A1A1A] hover:bg-[#333] text-[#F9F7F2] rounded-none shadow-none font-sans font-semibold",
                formFieldInput: "border border-[#BDBDBD] rounded-none focus:border-[#1A1A1A] focus:ring-0 bg-white font-sans",
                formFieldLabel: "font-sans text-sm font-medium text-[#1A1A1A]",
                footerActionText: "font-sans text-sm text-[#747878]",
                footerActionLink: "font-sans text-sm font-semibold text-[#1A1A1A] underline hover:no-underline",
              }
            }}
          />
        </div>
      </main>
      </div>
    </div>
  );
}
