import React from "react"
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const _jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "DVWA Forensic Monitor",
  description:
    "Real-time forensic analysis dashboard for Docker containers running DVWA. Detect SQL injection, command injection, brute force, and file inclusion attacks.",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${_inter.variable} ${_jetbrainsMono.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            className: "bg-card text-card-foreground border-border",
          }}
        />
      </body>
    </html>
  );
}
