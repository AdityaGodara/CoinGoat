import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticlesByTag, getArticles } from "@/lib/api/articles";
import { Container } from "@/components/ui/container";
import { ArticleCard } from "@/components/shared/article-card";
import { Pagination } from "@/components/shared/pagination";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  const tags = new Set(articles.flatMap((article) => article.tags));
  return Array.from(tags).map((tag) => ({ tag }));
}

export const dynamicParams = false;
export const revalidate = 60;

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag.replace(/-/g, " ")}` };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const { items, totalPages, total } = await getArticlesByTag(tag, page, 9);

  if (total === 0) notFound();

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-headline-lg font-extrabold text-foreground">#{tag.replace(/-/g, " ")}</h1>
      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <StaggerItem key={article.id}>
            <ArticleCard article={article} />
          </StaggerItem>
        ))}
      </StaggerGroup>
      <Pagination basePath={`/tag/${tag}`} page={page} totalPages={totalPages} />
    </Container>
  );
}
