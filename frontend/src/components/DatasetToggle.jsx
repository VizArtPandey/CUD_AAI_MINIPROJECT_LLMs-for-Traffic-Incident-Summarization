import { Check, Database } from "lucide-react";

export default function DatasetToggle({ value, onChange }) {
  const options = [
    { value: "gcc", label: "GCC / UAE",   subtitle: "250+ Narrative Samples",    flag: "🇦🇪" },
    { value: "us",  label: "US Accidents", subtitle: "5,000+ Extracted Records",  flag: "🇺🇸" }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0d1326] p-5 shadow-sm dark:shadow-xl">
      <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        <Database size={12}/> Analysis Dataset
      </div>
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ${
                isSelected
                  ? "border-orange-500/60 bg-orange-500/10 shadow-[0_0_12px_rgba(249,115,22,0.10)]"
                  : "border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] hover:border-orange-300 dark:hover:border-white/15 hover:bg-orange-50 dark:hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-xl leading-none">{option.flag}</span>
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-bold truncate ${isSelected ? "text-orange-600 dark:text-orange-300" : "text-slate-700 dark:text-slate-300"}`}>
                  {option.label}
                </span>
                <span className={`block text-[10px] font-medium uppercase tracking-widest mt-0.5 truncate ${isSelected ? "text-orange-500/80 dark:text-orange-400/70" : "text-slate-500 dark:text-slate-600"}`}>
                  {option.subtitle}
                </span>
              </div>
              <div className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full transition-all ${isSelected ? "bg-orange-500 scale-100" : "scale-0"}`}>
                <Check size={11} strokeWidth={3} className="text-white" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
