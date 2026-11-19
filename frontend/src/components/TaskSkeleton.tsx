export function TaskSkeleton() {
  return (
    <div className="skeleton-list" aria-busy="true">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="skeleton-card">
          <div className="skeleton-circle shimmer" />
          <div className="skeleton-lines">
            <div className="skeleton-line title shimmer" />
            <div className="skeleton-line desc shimmer" />
            <div className="skeleton-pills">
              <div className="skeleton-pill shimmer" />
              <div className="skeleton-pill short shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
