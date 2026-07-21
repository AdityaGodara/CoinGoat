import { CategoryPill } from "@/components/shared/category-pill";
import { ClockIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils/formatDate";
import type { Article } from "@/types";

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="space-y-4">
      <CategoryPill category={article.category} />
      <h1 className="text-headline-md font-extrabold text-foreground sm:text-headline-lg">{article.title}</h1>
      <p className="text-article-lead text-muted">{article.excerpt}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
        <span>
          <span className="font-medium text-foreground">{article.author.name}</span> · {formatDate(article.publishedAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="h-3.5 w-3.5" />
          {article.readingTimeMinutes} min read
        </span>
        {article.updatedAt && <span>Updated {formatDate(article.updatedAt)}</span>}
      </div>
    </header>
  );
}
