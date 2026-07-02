import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Reading Rooms",
  description: "A digital sanctuary for thoughtful reading and research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1A1A1A",
          colorText: "#1A1A1A",
          colorBackground: "#FFFFFF",
          fontFamily: "var(--font-inter)",
          borderRadius: "0px",
        },
        elements: {
          card: "!shadow-none !border !border-[#E5E5E5] !bg-white !rounded-none p-4 lg:p-8",
          headerTitle: "!font-heading !text-2xl !font-bold !text-[#1A1A1A]",
          headerSubtitle: "!font-sans !text-sm !text-[#747878]",
          formButtonPrimary: "!bg-[#1A1A1A] hover:!bg-[#333333] !text-[#F9F7F2] !font-sans !font-semibold !rounded-none !py-3",
          socialButtonsBlockButton: "!border !border-[#E5E5E5] hover:!bg-gray-50 !rounded-none !py-3 !font-sans !font-medium !text-[#1A1A1A]",
          formFieldInput: "!border-[#E5E5E5] focus:!border-[#1A1A1A] !rounded-none !bg-[#F9F7F2]/50 !py-3 !font-sans",
          formFieldLabel: "!font-sans !font-medium !text-[#1A1A1A]",
          dividerLine: "!bg-[#E5E5E5]",
          dividerText: "!font-sans !text-[#747878]",
          footerActionText: "!font-sans !text-[#747878]",
          footerActionLink: "!font-sans !font-semibold !text-[#1A1A1A] hover:!text-[#333333]",
          identityPreviewText: "!font-sans !text-[#1A1A1A]",
          identityPreviewEditButton: "!text-[#747878] hover:!text-[#1A1A1A]",
        }
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${sourceSerif.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col text-foreground bg-background">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
