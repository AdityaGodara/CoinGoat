import { getFeaturedArticle, getLatestArticles, getTrendingArticles, getArticlesByCategory } from "@/lib/api/articles";
import { getCryptoAssets } from "@/lib/api/crypto";
import { getCategoryBySlug } from "@/lib/api/categories";
import { Container } from "@/components/ui/container";
import { Hero } from "@/components/homepage/hero";
import { HeroSecondary } from "@/components/homepage/hero-secondary";
import { LatestNewsSection } from "@/components/homepage/latest-news-section";
import { TrendingSection } from "@/components/homepage/trending-section";
import { CategoryHighlightSection } from "@/components/homepage/category-highlight-section";
import { MarketsSnapshot } from "@/components/homepage/markets-snapshot";
import { NewsletterCTA } from "@/components/homepage/newsletter-cta";

export const revalidate = 60;

export default async function Home() {
  const [featured, latestPool, trending, assets, defiArticles, nftArticles, defiCategory, nftCategory] =
    await Promise.all([
      getFeaturedArticle(),
      getLatestArticles(10),
      getTrendingArticles(5),
      getCryptoAssets(),
      getArticlesByCategory("defi", 1, 4),
      getArticlesByCategory("nfts", 1, 3),
      getCategoryBySlug("defi"),
      getCategoryBySlug("nfts"),
    ]);

  const nonFeatured = latestPool.filter((article) => article.id !== featured?.id);
  const secondary = nonFeatured.slice(0, 3);
  const latestForGrid = nonFeatured.slice(3, 9);

  if (!defiCategory || !nftCategory) {
    throw new Error("Expected 'defi' and 'nfts' categories to exist in the fixed category taxonomy");
  }

  return (
    <Container className="space-y-16 py-8">
      {featured && (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Hero article={featured} />
          <HeroSecondary articles={secondary} />
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0 space-y-16">
          <LatestNewsSection articles={latestForGrid} />
          <CategoryHighlightSection category={defiCategory} articles={defiArticles.items} layout="rail" />
          <CategoryHighlightSection category={nftCategory} articles={nftArticles.items} layout="split" />
        </div>
        <TrendingSection articles={trending} />
      </div>

      <MarketsSnapshot assets={assets} />
      <NewsletterCTA />
    </Container>
  );
}
