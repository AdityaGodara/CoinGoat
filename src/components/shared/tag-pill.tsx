import Link from "next/link";

export function TagPill({ tag, className }: { tag: string; className?: string }) {
  return (
    <Link
      href={`/tag/${tag}`}
      className={`inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent ${className ?? ""}`}
    >
      #{tag.replace(/-/g, " ")}
    </Link>
  );
}
