import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { ArticleCard } from "@/components/shared/article-card";
import type { Article } from "@/types";

export function LatestNewsSection({ articles }: { articles: Article[] }) {
  return (
    <section>
      <SectionHeading title="Latest News" viewAllHref="/news" />
      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <StaggerItem key={article.id}>
            <ArticleCard article={article} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
