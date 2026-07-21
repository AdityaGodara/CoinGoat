import type { Metadata } from "next";
import { searchArticles } from "@/lib/api/articles";
import { Container } from "@/components/ui/container";
import { ArticleCard } from "@/components/shared/article-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

export const metadata: Metadata = {
  title: "Search",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchArticles(query) : [];

  return (
    <Container className="py-10">
      <h1 className="mb-2 text-headline-lg font-extrabold text-foreground">Search</h1>
      <p className="mb-8 text-muted">
        {query ? `Results for "${query}"` : "Enter a search term to find articles."}
      </p>
      {query && results.length === 0 ? (
        <EmptyState
          title="No results found"
          description="Try a different keyword or browse the latest news instead."
        />
      ) : (
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <StaggerItem key={article.id}>
              <ArticleCard article={article} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </Container>
  );
}
