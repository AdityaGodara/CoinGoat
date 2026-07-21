import { formatPercent } from "@/lib/utils/formatPrice";
import { TrendUpIcon, TrendDownIcon } from "@/components/ui/icons";

export function PriceChangeBadge({ changePct, className }: { changePct: number; className?: string }) {
  const isUp = changePct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums ${
        isUp ? "bg-up/10 text-up" : "bg-down/10 text-down"
      } ${className ?? ""}`}
    >
      {isUp ? <TrendUpIcon className="h-3 w-3" /> : <TrendDownIcon className="h-3 w-3" />}
      {formatPercent(changePct)}
    </span>
  );
}
