import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getArticles, getRelatedArticles } from "@/lib/api/articles";
import { getTrendingArticles } from "@/lib/api/articles";
import { extractHeadings } from "@/lib/utils/markdown";
import { Container } from "@/components/ui/container";
import { ArticleHeader } from "@/components/article/article-header";
import { ArticleBody } from "@/components/article/article-body";
import { StickyShareBar } from "@/components/article/sticky-share-bar";
import { TableOfContents } from "@/components/article/table-of-contents";
import { AuthorCard } from "@/components/article/author-card";
import { RelatedArticlesSection } from "@/components/article/related-articles-section";
import { SelectionSharePopover } from "@/components/article/selection-share-popover";
import { LightboxImage } from "@/components/article/lightbox-image";
import { TagPill } from "@/components/shared/tag-pill";
import { Sidebar } from "@/components/shared/sidebar";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Pre-warms the most recent ~100 articles at build time; the backend's
  // catalog is large and growing every ingestion tick, so (unlike the old
  // fully-enumerable mock catalog) this is a snapshot, not the full set.
  // `dynamicParams` stays at its default (true) so any other real slug
  // still renders correctly on demand instead of 404ing.
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      images: [{ url: article.coverImage.src, width: article.coverImage.width, height: article.coverImage.height }],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [related, trending] = await Promise.all([getRelatedArticles(article, 3), getTrendingArticles(5)]);
  const headings = extractHeadings(article.content);
  const url = `https://coingoat.example/news/${article.slug}`;

  return (
    <Container className="py-8">
      <div className="grid gap-8 lg:grid-cols-[auto_1fr_280px]">
        <div className="hidden lg:block">
          <StickyShareBar url={url} title={article.title} />
        </div>

        <div>
          <article className="max-w-3xl">
            <ArticleHeader article={article} />
            <div className="my-8">
              <LightboxImage src={article.coverImage.src} alt={article.coverImage.alt} />
            </div>
            <div className="mb-8 lg:hidden">
              <StickyShareBar url={url} title={article.title} />
            </div>
            <ArticleBody content={article.content} />
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
            <div className="mt-10">
              <AuthorCard author={article.author} />
            </div>
          </article>
          <div className="mt-16 max-w-3xl">
            <RelatedArticlesSection articles={related} />
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-28 space-y-10">
            <TableOfContents headings={headings} />
            <Sidebar trending={trending} />
          </div>
        </div>
      </div>
      <SelectionSharePopover />
    </Container>
  );
}
