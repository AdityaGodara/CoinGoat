import { Skeleton } from "@/components/motion/skeletons/skeleton-base";

export function CryptoPriceCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-7 w-20" />
    </div>
  );
}
