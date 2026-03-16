import { Copy, Download } from "lucide-react";

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function SummaryCard({ title, content, accent = "from-slate-900 to-indigo-700", meta = null }) {
  const safeContent = content || "Run the model to generate a summary.";

  return (
    <div className="overflow-hidden rounded-[36px] border border-white/60 bg-white/80 shadow-2xl backdrop-blur">
      <div className={`bg-gradient-to-r ${accent} p-8 text-white`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Generated Model Output</div>
            <h3 className="mt-2 text-2xl font-bold">{title.replace("Output · ", "")}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold shadow-inner backdrop-blur" title={`${content ? safeContent.split(/\\s+/).filter(Boolean).length : 0} words`}>
            {content ? safeContent.split(/\s+/).filter(Boolean).length : 0}
            <span className="sr-only">words</span>
          </div>
        </div>
      </div>
      <div className="space-y-6 p-8">
        {meta ? <div className="rounded-2xl bg-slate-100/80 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm">{meta}</div> : null}
        <div className="min-h-[140px]">
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-800">{safeContent}</p>
        </div>
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(safeContent)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-slate-800"
          >
            <Copy size={18} /> Copy
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile(`${title.replace(/\s+/g, "_").toLowerCase()}.txt`, safeContent)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50"
          >
            <Download size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
