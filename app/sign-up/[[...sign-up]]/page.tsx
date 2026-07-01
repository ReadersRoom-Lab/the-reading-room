import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col w-full">

      {/* Top bar */}
      <header className="border-b border-[#E5E5E5] px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-sans text-sm text-[#747878] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          The Reading Room
        </Link>
      </header>

      {/* Centered auth card */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-[#1A1A1A] mb-2">Create your room</h1>
            <p className="font-sans text-sm text-[#747878]">Start building your personal reading sanctuary.</p>
          </div>

          <SignUp
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
