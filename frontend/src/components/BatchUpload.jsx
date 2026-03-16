import { UploadCloud } from "lucide-react";

export default function BatchUpload() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0d1326] dark:shadow-xl relative overflow-hidden h-full">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">Batch Processing</div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Bulk Generation</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Load custom evaluation datasets by uploading a CSV. The system expects a <span className="font-mono text-xs text-orange-600 bg-orange-50 px-1 py-0.5 rounded dark:text-orange-300 dark:bg-orange-500/10 dark:border dark:border-orange-500/20">Description</span> column to generate summaries in bulk for evaluation.
      </p>
      
      <div className="mt-6 flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-orange-200 hover:bg-orange-50 cursor-pointer group dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-orange-500/50 dark:hover:bg-slate-800">
        <div className="rounded-full bg-white border border-slate-200 p-3 text-slate-400 mb-3 group-hover:text-orange-500 group-hover:bg-orange-100 group-hover:border-orange-200 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:group-hover:text-orange-400 dark:group-hover:bg-orange-500/10 dark:group-hover:border-orange-500/30">
            <UploadCloud size={24} />
        </div>
        <div className="text-sm font-bold text-slate-700 group-hover:text-orange-600 mb-1 dark:text-slate-300 dark:group-hover:text-white">Upload CSV or JSON Dataset</div>
        <div className="text-xs text-slate-500">Supports .csv up to 50MB</div>
      </div>
    </div>
  );
}
