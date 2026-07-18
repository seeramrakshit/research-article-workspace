export default function ArticlesLoading() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* toolbar skeleton */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-9 flex-1 animate-pulse rounded-full bg-gray-100" />
        <div className="h-9 w-32 animate-pulse rounded-full bg-gray-100" />
        <div className="h-9 w-32 animate-pulse rounded-full bg-gray-100" />
      </div>

      {/* table skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="bg-gray-50 p-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t p-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}