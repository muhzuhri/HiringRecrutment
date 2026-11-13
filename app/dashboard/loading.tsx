export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white/80 dark:bg-[#0c2b29]/80 rounded-3xl p-8 h-40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0c2b29] rounded-2xl p-5 h-28" />
        ))}
      </div>
      <div className="bg-white dark:bg-[#0c2b29] rounded-2xl p-6 h-56" />
    </div>
  );
}

