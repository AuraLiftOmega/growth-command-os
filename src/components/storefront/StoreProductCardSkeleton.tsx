export function StoreProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border/40 bg-card/40 animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-muted/40" />

      {/* Info placeholder */}
      <div className="p-4 space-y-3">
        <div className="h-2.5 bg-muted/50 rounded-full w-1/3" />
        <div className="space-y-1.5">
          <div className="h-3.5 bg-muted/50 rounded-full w-full" />
          <div className="h-3.5 bg-muted/50 rounded-full w-3/4" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 bg-muted/50 rounded-full w-16" />
          <div className="h-9 bg-muted/50 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}
