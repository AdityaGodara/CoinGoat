import type { Metadata } from "next";
import { getPaginatedArticles } from "@/lib/api/articles";
import { Container } from "@/components/ui/container";
import { ArticleCard } from "@/components/shared/article-card";
import { Pagination } from "@/components/shared/pagination";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

export const metadata: Metadata = {
  title: "Latest News",
};

export const revalidate = 60;

interface NewsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const { items, totalPages } = await getPaginatedArticles(page, 9);

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-headline-lg font-extrabold text-foreground">Latest News</h1>
      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <StaggerItem key={article.id}>
            <ArticleCard article={article} />
          </StaggerItem>
        ))}
      </StaggerGroup>
      <Pagination basePath="/news" page={page} totalPages={totalPages} />
    </Container>
  );
}
