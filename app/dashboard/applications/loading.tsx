export default function ApplicationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white/80 dark:bg-[#0c2b29]/80 rounded-3xl p-8 h-36" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0c2b29] rounded-2xl p-5 h-24" />
        ))}
      </div>
      <div className="bg-white dark:bg-[#0c2b29] rounded-2xl h-80" />
    </div>
  );
}

