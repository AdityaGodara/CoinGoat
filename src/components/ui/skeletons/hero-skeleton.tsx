import { Skeleton } from "@/components/motion/skeletons/skeleton-base";

export function HeroSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="grid gap-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="aspect-video w-full" />
      </div>
    </div>
  );
}
