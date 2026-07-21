import { Container } from "@/components/ui/container";
import { CryptoPriceCardSkeleton } from "@/components/ui/skeletons/crypto-price-card-skeleton";

export default function Loading() {
  return (
    <Container className="py-10">
      <div className="mb-2 h-9 w-40 animate-pulse rounded-md bg-surface-hover" />
      <div className="mb-8 h-5 w-72 animate-pulse rounded-md bg-surface-hover" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <CryptoPriceCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
