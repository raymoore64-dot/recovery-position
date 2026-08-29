import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Recovery Position",
  description: "Your roster runs your life. Might as well let it run something useful too.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <header className="bg-navy text-paper">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/icon.svg" alt="" width={32} height={32} />
              <span
                style={{ fontFamily: "var(--font-display-semibold)" }}
                className="text-lg"
              >
                The Recovery Position
              </span>
            </Link>
            <nav className="flex gap-5 text-sm font-medium">
              <Link href="/" className="hover:text-amber transition-colors">
                Today
              </Link>
              <Link href="/roster" className="hover:text-amber transition-colors">
                Roster
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
