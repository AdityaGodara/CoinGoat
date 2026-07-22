import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/api/articles";
import { getCategoryBySlug, getCategories } from "@/lib/api/categories";
import { Container } from "@/components/ui/container";
import { ArticleCard } from "@/components/shared/article-card";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;
export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const { items, totalPages } = await getArticlesByCategory(slug, page, 9);

  return (
    <Container className="py-10">
      <div className="mb-8">
        <h1 className="text-headline-lg font-extrabold text-foreground">{category.name}</h1>
        <p className="mt-2 max-w-2xl text-muted">{category.description}</p>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No articles yet" description="Check back soon for coverage in this category." />
      ) : (
        <>
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <StaggerItem key={article.id}>
                <ArticleCard article={article} />
              </StaggerItem>
            ))}
          </StaggerGroup>
          <Pagination basePath={`/category/${slug}`} page={page} totalPages={totalPages} />
        </>
      )}
    </Container>
  );
}
