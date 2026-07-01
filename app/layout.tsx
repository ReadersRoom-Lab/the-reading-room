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
  title: "The Reading Room",
  description: "Read. Archive. Think. Learn.",
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
          colorPrimary: "#2C2825",
          colorBackground: "#FDFBF7",
          fontFamily: "var(--font-sans)",
          borderRadius: "0.5rem",
        },
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
