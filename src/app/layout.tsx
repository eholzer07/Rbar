import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/components/providers";
import NotificationBell from "@/components/notification-bell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rbar",
  description: "Find bars showing your team's game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 flex h-16 items-center border-b border-neutral-200 bg-white px-4 gap-6 dark:border-neutral-800 dark:bg-neutral-950">
          <Link href="/" className="font-bold text-neutral-900 dark:text-white">Rbar</Link>
          <nav className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/search" className="hover:text-neutral-900 dark:hover:text-white">Search</Link>
            <Link href="/teams" className="hover:text-neutral-900 dark:hover:text-white">My Teams</Link>
            <Link href="/feed" className="hover:text-neutral-900 dark:hover:text-white">Feed</Link>
            <NotificationBell />
            <Link href="/profile" className="hover:text-neutral-900 dark:hover:text-white">Profile</Link>
          </nav>
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
