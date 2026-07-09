import "@/lib/env";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
      ui={ui}
      appearance={{
        variables: {
          colorPrimary: "#1A1A1A",
          colorForeground: "#1A1A1A",
          colorBackground: "#FFFFFF",
          fontFamily: "var(--font-inter)",
          borderRadius: "0px",
        },
        elements: {
          card: {
            boxShadow: "none",
            border: "1px solid #E5E5E5",
            backgroundColor: "#FFFFFF",
            borderRadius: "0px",
          },
          headerTitle: {
            fontFamily: "var(--font-source-serif)",
            fontSize: "1.5rem",
            color: "#1A1A1A",
          },
          headerSubtitle: {
            fontFamily: "var(--font-inter)",
            color: "#52525B",
          },
          formButtonPrimary: {
            backgroundColor: "#1A1A1A",
            color: "#F9F7F2",
            borderRadius: "0px",
            textTransform: "none",
            fontWeight: "600",
            fontFamily: "var(--font-inter)",
          },
          socialButtonsBlockButton: {
            borderRadius: "0px",
            border: "1px solid #E5E5E5",
            fontFamily: "var(--font-inter)",
            color: "#1A1A1A",
          },
          formFieldInput: {
            borderRadius: "0px",
            borderColor: "#E5E5E5",
            backgroundColor: "#FDFBF7",
            fontFamily: "var(--font-inter)",
          },
          formFieldLabel: {
            fontFamily: "var(--font-inter)",
            fontWeight: "500",
            color: "#1A1A1A",
          },
          dividerLine: {
            background: "#E5E5E5",
          },
          dividerText: {
            fontFamily: "var(--font-inter)",
            color: "#52525B",
          },
          footerActionText: {
            fontFamily: "var(--font-inter)",
            color: "#52525B",
          },
          footerActionLink: {
            fontFamily: "var(--font-inter)",
            fontWeight: "600",
            color: "#1A1A1A",
          },
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${sourceSerif.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <body className="min-h-screen flex flex-col text-foreground bg-background">
          {children}
          <Toaster />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
