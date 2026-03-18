import { UploadCloud, Database } from "lucide-react";

export default function DatasetLoader() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0d1326] p-5 shadow-sm dark:shadow-xl">
      <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        <Database size={12}/> Load Your Dataset
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-4 leading-relaxed">
        Upload a CSV with an <span className="font-mono text-orange-500 bg-orange-500/10 px-1 rounded text-[10px]">Incident Description</span> column to run summarization on your own traffic incident data.
      </p>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] p-5 text-center transition hover:border-orange-400 dark:hover:border-orange-500/40 hover:bg-orange-50 dark:hover:bg-orange-500/5 cursor-pointer group">
        <div className="rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] p-2.5 text-slate-400 dark:text-slate-500 mb-2 group-hover:text-orange-500 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10 dark:group-hover:border-orange-500/30 transition-colors">
          <UploadCloud size={18} />
        </div>
        <div className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white mb-0.5 transition-colors">
          Drop CSV file here
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">.csv only · max 50 MB</div>
      </div>
    </div>
  );
}
