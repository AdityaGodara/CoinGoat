import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { ArticleCard } from "@/components/shared/article-card";
import type { Article } from "@/types";

export function RelatedArticlesSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Related Stories" />
      <StaggerGroup className="grid gap-6 sm:grid-cols-3">
        {articles.map((article) => (
          <StaggerItem key={article.id}>
            <ArticleCard article={article} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
