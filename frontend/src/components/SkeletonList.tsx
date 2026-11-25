export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex gap-3 p-3.5 rounded-2xl bg-bg-secondary border border-border-subtle"
        >
          <div className="w-5 h-5 rounded-full bg-bg-elevated animate-pulse shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3.5 w-2/3 rounded-md bg-bg-elevated animate-pulse" />
            <div className="h-3 w-11/12 rounded-md bg-bg-elevated animate-pulse" />
            <div className="flex gap-2 mt-0.5">
              <div className="h-4 w-14 rounded-md bg-bg-elevated animate-pulse" />
              <div className="h-4 w-24 rounded-md bg-bg-elevated animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
