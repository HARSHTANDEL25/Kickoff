import type { Metadata } from "next";
import { Science_Gothic } from "next/font/google";
import "./globals.css";
import Navigation from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";

const ScienceGothic = Science_Gothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-science-gothic",
});

export const metadata: Metadata = {
  title: "KickOff — Your Football Hub",
  description: "Live scores, transfers, news and standings for Premier League, La Liga, Serie A, Bundesliga and Ligue 1 — all in one place.",
  keywords: ["football", "live scores", "transfers", "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"],
  openGraph: {
    title: "KickOff — Your Football Hub",
    description: "Live scores, transfers, news and standings — all in one place.",
    siteName: "KickOff",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KickOff — Your Football Hub",
    description: "Live scores, transfers, news and standings — all in one place.",
    images: ["/opengraph-image"],
  },
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
        <Footer />
      </body>
    </html>
  );
}
