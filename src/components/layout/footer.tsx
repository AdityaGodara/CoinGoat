import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { categories } from "@/data/categories";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { TwitterIcon, LinkedinIcon, WebsiteIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Reveal>
        <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-foreground">
              Coin<span className="text-accent">Goat</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Crypto news, markets, and analysis, covering the assets and protocols moving the industry.
            </p>
            <div className="mt-5 flex items-center gap-3 text-muted">
              <a href="#" aria-label="CoinGoat on Twitter" className="transition-colors hover:text-accent">
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a href="#" aria-label="CoinGoat on LinkedIn" className="transition-colors hover:text-accent">
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a href="#" aria-label="CoinGoat website" className="transition-colors hover:text-accent">
                <WebsiteIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Categories</p>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Explore</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/news" className="text-sm text-muted transition-colors hover:text-foreground">
                  Latest News
                </Link>
              </li>
              <li>
                <Link href="/markets" className="text-sm text-muted transition-colors hover:text-foreground">
                  Markets
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-muted transition-colors hover:text-foreground">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Stay updated</p>
            <p className="mt-4 text-sm text-muted">Get the day&apos;s biggest crypto stories in your inbox.</p>
            <div className="mt-4">
              <NewsletterForm variant="compact" />
            </div>
          </div>
        </Container>
      </Reveal>
      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} CoinGoat. All rights reserved.</p>
          <p>Market data shown is illustrative and for demonstration purposes only.</p>
        </Container>
      </div>
    </footer>
  );
}
