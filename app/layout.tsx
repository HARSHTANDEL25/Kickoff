import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "./components/layout/Navigation";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "KickOff — Your Football Hub",
  description: "Live scores, news, transfers, standings — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-screen antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
