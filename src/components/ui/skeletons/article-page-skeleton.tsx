import { Skeleton } from "@/components/motion/skeletons/skeleton-base";

export function ArticlePageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
