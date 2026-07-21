import Link from "next/link";
import { Container } from "@/components/ui/container";
import { DesktopNav } from "./desktop-nav";
import { MobileDrawer } from "./mobile-drawer";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { CryptoPriceMarquee } from "./crypto-price-marquee";
import { BreakingNewsTicker } from "./breaking-news-ticker";
import { StickyHeader } from "./sticky-header";
import { getCryptoAssets } from "@/lib/api/crypto";

export async function Header() {
  const assets = await getCryptoAssets();

  return (
    <StickyHeader>
      <BreakingNewsTicker />
      <div className="glass-nav border-b border-border">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-lg font-extrabold tracking-tight text-foreground">
            Coin<span className="text-accent">Goat</span>
          </Link>
          <DesktopNav />
          <div className="flex items-center gap-2">
            <SearchBar className="hidden sm:block" />
            <ThemeToggle />
            <MobileDrawer />
          </div>
        </Container>
      </div>
      <CryptoPriceMarquee initialAssets={assets} />
    </StickyHeader>
  );
}
