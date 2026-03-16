function getSeverityBadge(text) {
  const match = text.match(/(critical|high|medium|low)\sseverity/i);
  if (!match) return null;
  const sev = match[1].toUpperCase();
  switch (sev) {
    case 'CRITICAL': return <div className="mt-4 inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">Critical Severity</div>;
    case 'HIGH': return <div className="mt-4 inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">High Severity</div>;
    case 'MEDIUM': return <div className="mt-4 inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">Medium Severity</div>;
    case 'LOW': return <div className="mt-4 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Low Severity</div>;
    default: return null;
  }
}

export default function SampleGallery({ items, onPick }) {
  if (!items?.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#121930]">
        No sample incidents available for this dataset track yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full pr-2">
      {items.map((item) => (
        <button
          key={`${item.dataset_track}-${item.id}`}
          onClick={() => onPick(item.text)}
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#121930] dark:hover:border-slate-700 dark:hover:bg-slate-800/80 w-full"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-500">{item.dataset_track}</div>
            <div className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">{item.source_label}</div>
          </div>
          <div className="mb-2 text-base font-bold text-slate-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">{item.title}</div>
          <p className="line-clamp-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{item.text}</p>
          {getSeverityBadge(item.text)}
        </button>
      ))}
    </div>
  );
}
