import Link from "next/link";
import type { Category } from "@/types";
import type { CSSProperties } from "react";

interface CategoryPillProps {
  category: Category;
  className?: string;
  /** Set false when this pill is already nested inside another link (e.g. ArticleCard). */
  interactive?: boolean;
}

export function CategoryPill({ category, className, interactive = true }: CategoryPillProps) {
  const style = { "--pill-color": category.color, color: category.color } as CSSProperties;
  const classes = `inline-flex items-center rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ring-1 ring-white/10 transition-shadow duration-300 group-hover:ring-4 group-hover:ring-[color:var(--pill-color)]/30 ${className ?? ""}`;

  if (!interactive) {
    return (
      <span style={style} className={classes}>
        {category.name}
      </span>
    );
  }

  return (
    <Link href={`/category/${category.slug}`} style={style} className={classes}>
      {category.name}
    </Link>
  );
}
