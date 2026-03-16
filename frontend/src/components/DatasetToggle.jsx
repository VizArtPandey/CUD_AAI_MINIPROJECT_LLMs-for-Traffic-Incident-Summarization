import { Check, Database } from "lucide-react";

export default function DatasetToggle({ value, onChange }) {
  const options = [
    { value: "gcc", label: "GCC / UAE", subtitle: "250+ Narrative Samples" },
    { value: "us", label: "US Accidents", subtitle: "5,000+ Extracted Records" }
  ];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        <Database size={14}/> Analysis Dataset Track
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`relative flex flex-col items-start rounded-2xl border-2 px-5 py-4 text-left transition-all duration-300 ${
                isSelected
                  ? "border-orange-500 bg-orange-50/50 shadow-[0_0_15px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/50 dark:bg-orange-500/10"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className={`text-lg font-bold ${isSelected ? "text-orange-600 dark:text-orange-400" : "text-slate-700 dark:text-slate-300"}`}>
                  {option.label}
                </span>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 ${isSelected ? "scale-100 bg-orange-500 text-white dark:text-slate-900" : "scale-0 shadow-none border-0"}`}>
                  <Check size={14} strokeWidth={3} />
                </div>
              </div>
              <span className={`mt-2 text-xs font-medium uppercase tracking-widest ${isSelected ? "text-orange-600/80 dark:text-orange-400/80" : "text-slate-500"}`}>
                {option.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
