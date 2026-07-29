export const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-black/5 dark:bg-white/5 ${className}`} />
);

export const SkeletonCard = () => (
  <div className="card flex flex-col gap-4 p-6">
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-5 w-20" />
      <SkeletonBlock className="h-5 w-16" />
    </div>
    <SkeletonBlock className="h-5 w-3/4" />
    <SkeletonBlock className="h-4 w-full" />
    <SkeletonBlock className="h-4 w-5/6" />
    <div className="mt-2 flex gap-2">
      <SkeletonBlock className="h-6 w-14" />
      <SkeletonBlock className="h-6 w-14" />
    </div>
    <div className="mt-auto flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-8 w-8 rounded-full" />
        <SkeletonBlock className="h-8 w-20" />
      </div>
      <SkeletonBlock className="h-8 w-20 rounded-xl" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonRow = () => (
  <div className="card flex items-center gap-4 p-6">
    <SkeletonBlock className="h-11 w-11 rounded-full" />
    <div className="flex-1 space-y-2">
      <SkeletonBlock className="h-4 w-1/3" />
      <SkeletonBlock className="h-3 w-1/2" />
    </div>
    <SkeletonBlock className="h-8 w-20 rounded-lg" />
  </div>
);
