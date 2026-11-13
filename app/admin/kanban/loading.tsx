export default function KanbanLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-56" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl min-w-[280px] h-96 shrink-0" />
        ))}
      </div>
    </div>
  );
}

