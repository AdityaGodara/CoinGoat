import { ArticleCard } from "@/components/shared/article-card";
import type { Article } from "@/types";

export function HeroSecondary({ articles }: { articles: Article[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-2">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} variant="list" />
      ))}
    </div>
  );
}
