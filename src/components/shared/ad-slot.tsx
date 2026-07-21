export function AdSlot({ label = "Advertisement", className }: { label?: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-10 text-xs uppercase tracking-wide text-muted ${className ?? ""}`}
    >
      {label}
    </div>
  );
}
