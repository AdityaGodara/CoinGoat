import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { ArticleCard } from "@/components/shared/article-card";
import type { Article } from "@/types";

export function TrendingSection({ articles }: { articles: Article[] }) {
  return (
    <section>
      <SectionHeading title="Trending Now" />
      <StaggerGroup className="space-y-1">
        {articles.map((article, index) => (
          <StaggerItem key={article.id}>
            <ArticleCard article={article} variant="list" rank={index + 1} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
