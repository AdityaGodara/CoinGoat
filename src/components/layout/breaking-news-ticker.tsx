import Link from "next/link";
import { Marquee } from "@/components/motion/marquee";
import { getBreakingArticles } from "@/lib/api/articles";

export async function BreakingNewsTicker() {
  const breaking = await getBreakingArticles();
  if (breaking.length === 0) return null;

  return (
    <div className="flex items-center border-b border-border bg-surface">
      <span className="z-10 flex shrink-0 items-center gap-1.5 bg-down px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 motion-reduce:hidden" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        Breaking
      </span>
      <Marquee className="flex-1 py-1.5">
        {breaking.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="whitespace-nowrap px-4 text-sm text-foreground transition-colors hover:text-accent"
          >
            {article.title}
          </Link>
        ))}
      </Marquee>
    </div>
  );
}
