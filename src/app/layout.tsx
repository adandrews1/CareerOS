import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerOS",
  description: "Your personal operating system for your career",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-6">
            <span className="font-semibold">CareerOS</span>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/backlog" className="text-sm text-gray-600 hover:text-gray-900">
              Backlog
            </Link>
          </nav>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
