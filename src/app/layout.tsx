import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/lib/motion/motion-provider";
import { LenisProvider } from "@/lib/motion/lenis-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackToTopButton } from "@/components/layout/back-to-top-button";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://coingoat.example"),
  title: {
    default: "CoinGoat: Crypto News & Markets",
    template: "%s | CoinGoat",
  },
  description: "Crypto news, markets, and analysis covering Bitcoin, Ethereum, DeFi, NFTs, and the assets moving the market.",
  openGraph: {
    type: "website",
    siteName: "CoinGoat",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <MotionProvider>
            <LenisProvider>
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
              <BackToTopButton />
            </LenisProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
