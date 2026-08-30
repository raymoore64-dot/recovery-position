import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import NavLinks from "@/components/NavLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Recovery Position",
  description: "Your roster runs your life. Might as well let it run something useful too.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <header className="bg-navy text-ink relative overflow-hidden">
          <div className="moonbleed" />
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between relative z-10">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/icon.svg" alt="" width={38} height={38} />
              <span
                style={{ fontFamily: "var(--font-display-semibold)" }}
                className="text-xl tracking-tight"
              >
                The Recovery Position
              </span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">{children}</main>
        <footer className="max-w-3xl w-full mx-auto px-5 py-6 text-xs text-ink/40">
          <span style={{ fontFamily: "var(--font-display-italic)" }}>
            Your roster runs your life. Might as well let it run something useful too.
          </span>
        </footer>
      </body>
    </html>
  );
}
