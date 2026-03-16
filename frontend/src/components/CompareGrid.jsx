export default function CompareGrid({ items }) {
  if (!items?.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#121930] dark:text-slate-400">
        Compare all models to render side-by-side summaries for qualitative analysis.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.model_name} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#121930] dark:shadow-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white">{item.model_name}</div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {item.word_count || item.summary?.split(/\s+/).filter(Boolean).length || 0} words
            </div>
          </div>
          <p className="text-sm leading-8 text-slate-600 dark:text-slate-300">{item.summary}</p>
        </div>
      ))}
    </div>
  );
}
