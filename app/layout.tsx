import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 Configuration Viewport (Couleur dyal status bar f téléphone)
export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 🚀 Configuration Metadata w PWA Manifest
export const metadata: Metadata = {
  title: "DimaCard | Smart Business Card",
  description: "La nouvelle génération de cartes de visite digitales au Maroc.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DimaCard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      {/* 🟢 Zidna suppressHydrationWarning w jem3na l'fonts kamlin */}
      <body 
        className={`${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}