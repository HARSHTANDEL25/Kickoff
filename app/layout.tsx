import type { Metadata } from "next";
import { Science_Gothic } from "next/font/google";
import "./globals.css";
import Navigation from "./components/layout/Navigation";

const ScienceGothic = Science_Gothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-science-gothic",
});

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
    <html lang="en" className={`${ScienceGothic.variable} h-full`}>
      <body className="min-h-screen antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Navigation />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
