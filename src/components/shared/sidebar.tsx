import { ArticleCard } from "./article-card";
import { AdSlot } from "./ad-slot";
import type { Article } from "@/types";

export function Sidebar({ trending }: { trending: Article[] }) {
  return (
    <aside className="space-y-8">
      <div className="rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:border-accent/30 hover:shadow-md">
        <p className="mb-4 text-sm font-semibold text-foreground">Trending</p>
        <div className="space-y-4">
          {trending.map((article, index) => (
            <ArticleCard key={article.id} article={article} variant="sidebar" rank={index + 1} />
          ))}
        </div>
      </div>
      <AdSlot />
    </aside>
  );
}
