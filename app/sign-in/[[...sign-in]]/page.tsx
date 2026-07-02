import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col w-full">

      {/* Top bar */}
      <header className="absolute top-0 left-0 px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-sans text-sm text-[#747878] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      {/* Centered auth card */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl tracking-tight font-bold text-[#1A1A1A]">
            The Reading Room
          </h1>
        </div>
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-2">Welcome back</h2>
            <p className="font-sans text-sm text-[#747878]">Sign in to continue to your reading room.</p>
          </div>

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
  );
}
