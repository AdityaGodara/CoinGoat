import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { ArticleCard } from "@/components/shared/article-card";
import type { Article, Category } from "@/types";

interface CategoryHighlightSectionProps {
  category: Category;
  articles: Article[];
  layout?: "grid" | "rail" | "split";
}

export function CategoryHighlightSection({ category, articles, layout = "grid" }: CategoryHighlightSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section>
      <SectionHeading title={category.name} viewAllHref={`/category/${category.slug}`} />
      {layout === "rail" && (
        <StaggerGroup className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {articles.map((article) => (
            <StaggerItem key={article.id} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
              <ArticleCard article={article} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
      {layout === "split" && (
        <StaggerGroup className="grid gap-6 lg:grid-cols-2">
          <StaggerItem>
            <ArticleCard article={articles[0]} priority />
          </StaggerItem>
          <StaggerItem className="space-y-2 rounded-2xl border border-border bg-surface p-3">
            {articles.slice(1).map((article) => (
              <ArticleCard key={article.id} article={article} variant="list" />
            ))}
          </StaggerItem>
        </StaggerGroup>
      )}
      {layout === "grid" && (
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <StaggerItem key={article.id}>
              <ArticleCard article={article} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </section>
  );
}
