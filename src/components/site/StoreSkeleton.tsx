/** A fast, size-stable fallback while the public product catalog loads. */
export function StoreSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading SweeTrade products" className="container-page py-8 sm:py-12">
      <span className="sr-only">Loading products…</span>
      <div className="wow-skeleton mb-4 h-10 max-w-72" />
      <div className="wow-skeleton mb-8 h-4 max-w-xl" />
      <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="wow-skeleton aspect-square w-full rounded-none" />
            <div className="space-y-3 p-4">
              <div className="wow-skeleton h-5 w-3/4" />
              <div className="wow-skeleton h-7 w-1/2" />
              <div className="wow-skeleton h-11 w-full" />
              <div className="grid grid-cols-2 gap-2">
                <div className="wow-skeleton h-11" />
                <div className="wow-skeleton h-11" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
