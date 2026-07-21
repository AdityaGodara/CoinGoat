import Link from "next/link";

export function SectionHeading({
  title,
  viewAllHref,
  className,
}: {
  title: string;
  viewAllHref?: string;
  className?: string;
}) {
  return (
    <div className={`mb-6 flex items-end justify-between ${className ?? ""}`}>
      <h2 className="text-headline-sm font-bold text-foreground">{title}</h2>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-sm font-medium text-accent transition-colors hover:text-accent/80">
          View all →
        </Link>
      )}
    </div>
  );
}
