import { TrendingUp, Award, BarChart2 } from "lucide-react";

const MODEL_METRICS = [
  { id: "bart_large_cnn", label: "BART-large-CNN", r1: 0.432, r2: 0.198, rl: 0.391, cr: 3.2, delta: "+35.8%", type: "abstractive", best: true  },
  { id: "flan_t5_small",  label: "Flan-T5-small",  r1: 0.408, r2: 0.181, rl: 0.372, cr: 3.5, delta: "+28.3%", type: "abstractive", best: false },
  { id: "pegasus_cnn",    label: "PEGASUS",         r1: 0.389, r2: 0.162, rl: 0.354, cr: 3.8, delta: "+22.3%", type: "abstractive", best: false },
  { id: "textrank",       label: "TextRank",        r1: 0.318, r2: 0.109, rl: 0.287, cr: 2.8, delta: "—",      type: "extractive",  best: false },
];

const METRIC_BULLETS = [
  { key: "R-1",  desc: "Unigram overlap between generated and reference summary" },
  { key: "R-2",  desc: "Bigram overlap — measures phrase-level accuracy" },
  { key: "R-L",  desc: "Longest common subsequence — fluency & order" },
  { key: "CR",   desc: "Compression Ratio — input÷output token count" },
];

const MAX_R1 = 0.432;

export default function LiveMetrics({ activeModel }) {
  const active = MODEL_METRICS.find(m => m.id === activeModel) || MODEL_METRICS[0];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0d1326] shadow-sm dark:shadow-2xl overflow-hidden flex-1">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          <TrendingUp size={12} className="text-orange-500" /> Experiment Results
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1 leading-relaxed">
          ROUGE scores · GCC + US corpus · Select a model to compare live
        </p>
      </div>

      {/* ROUGE-1 bars */}
      <div className="px-5 pt-4 pb-2 space-y-2.5">
        {MODEL_METRICS.map((m) => {
          const isSelected = m.id === activeModel;
          const pct = Math.round((m.r1 / MAX_R1) * 100);
          const isExtractive = m.type === "extractive";
          return (
            <div key={m.id} className={`rounded-xl p-3 border transition-all duration-300 ${
              isSelected
                ? "border-orange-400/40 bg-orange-50 dark:bg-orange-500/[0.06]"
                : "border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02]"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className={`text-[11px] font-bold ${isSelected ? "text-orange-700 dark:text-white" : isExtractive ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-400"}`}>
                    {m.label}
                  </span>
                  {m.best && (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400">
                      <Award size={8} /> BEST
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/20 text-orange-600 dark:text-orange-400">
                      active
                    </span>
                  )}
                  {isExtractive && (
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
                      extractive
                    </span>
                  )}
                </div>
                <span className={`text-xs font-black tabular-nums shrink-0 ${isSelected ? "text-orange-600 dark:text-orange-400" : isExtractive ? "text-slate-400 dark:text-slate-600" : "text-slate-500"}`}>
                  {m.r1.toFixed(3)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isSelected ? "bg-gradient-to-r from-orange-500 to-amber-400" : isExtractive ? "bg-slate-400 dark:bg-slate-700" : "bg-slate-400 dark:bg-slate-600"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-slate-100 dark:bg-white/[0.05] my-3" />

      {/* Active model full metrics */}
      <div className="px-5">
        <div className="flex items-center gap-1.5 mb-3">
          <BarChart2 size={11} className="text-orange-500/70" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {active.label} — Full Metrics
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "R-1", value: active.r1.toFixed(3), highlight: true  },
            { label: "R-2", value: active.r2.toFixed(3), highlight: false },
            { label: "R-L", value: active.rl.toFixed(3), highlight: false },
            { label: "CR",  value: `${active.cr}×`,      highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`flex flex-col items-center rounded-xl p-2 border ${highlight ? "bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/20" : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06]"}`}>
              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-0.5">{label}</span>
              <span className={`text-sm font-black ${highlight ? "text-orange-600 dark:text-orange-400" : "text-slate-700 dark:text-slate-300"}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Metric bullet descriptions */}
        <ul className="space-y-2 mb-4">
          {METRIC_BULLETS.map(({ key, desc }) => (
            <li key={key} className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5 h-1.5 w-1.5 rounded-full bg-orange-500/70"></span>
              <span className="text-[11px] text-slate-500 dark:text-slate-500 leading-snug">
                <span className="font-bold text-slate-700 dark:text-slate-300">{key}</span> — {desc}
              </span>
            </li>
          ))}
        </ul>

        {active.delta !== "—" && (
          <div className="mb-5 flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/15 rounded-lg py-2">
            <span>▲</span> {active.delta} ROUGE-1 gain over TextRank baseline
          </div>
        )}
      </div>
    </div>
  );
}
