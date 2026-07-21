import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@/components/ui/icons";

export function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const pageHref = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      <Link
        href={pageHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm transition-colors ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-hover"
        }`}
      >
        <CaretLeftIcon className="h-4 w-4" />
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
            p === page ? "bg-accent text-accent-foreground" : "text-muted hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={pageHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm transition-colors ${
          page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface-hover"
        }`}
      >
        <CaretRightIcon className="h-4 w-4" />
      </Link>
    </nav>
  );
}
