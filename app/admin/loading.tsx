export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5 h-28" />
        ))}
      </div>
      {/* Table Skeleton */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 h-64" />
    </div>
  );
}

