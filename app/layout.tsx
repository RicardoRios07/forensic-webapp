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
  title: "DVWA Monitor Forense",
  description:
    "Panel de análisis forense en tiempo real para contenedores Docker con DVWA. Detecta inyección SQL, inyección de comandos, fuerza bruta e inclusión de archivos.",
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
    <html lang="es" className="dark">
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
