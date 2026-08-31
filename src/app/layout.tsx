import type { Metadata } from "next";
import NavLinks from "@/components/NavLinks";
import MobileTabBar from "@/components/MobileTabBar";
import HeaderBrand from "@/components/HeaderBrand";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Recovery Position",
  description: "Your roster runs your life. Might as well let it run something useful too.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recovery",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#1b1315",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <header className="bg-navy text-ink relative overflow-hidden">
          <div className="moonbleed" />
          <div className="max-w-3xl mx-auto px-4 sm:px-5 py-4 flex items-center justify-between relative z-10">
            <HeaderBrand />
            <NavLinks />
          </div>
        </header>
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-5 py-6 sm:py-10 pb-24 sm:pb-10">
          {children}
        </main>
        <footer className="hidden sm:block max-w-3xl w-full mx-auto px-5 py-6 text-xs text-ink/40">
          <span style={{ fontFamily: "var(--font-display-italic)" }}>
            Your roster runs your life. Might as well let it run something useful too.
          </span>
        </footer>
        <MobileTabBar />
      </body>
    </html>
  );
}
