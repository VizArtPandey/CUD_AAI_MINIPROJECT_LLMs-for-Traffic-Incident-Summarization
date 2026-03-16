const OPTIONS = [
  { value: "bart_large_cnn", label: "BART Large CNN", note: "Best default abstractive model" },
  { value: "flan_t5_small", label: "Flan-T5 Small", note: "Lightweight and CPU-friendly" },
  { value: "pegasus_cnn", label: "PEGASUS CNN", note: "Optional stronger summarizer" },
  { value: "lead1", label: "Lead-1", note: "Simple extractive baseline" },
  { value: "textrank", label: "TextRank", note: "Classic graph-based baseline" }
];

export default function ModelSelector({ value, onChange }) {
  const selected = OPTIONS.find((option) => option.value === value);

  return (
    <div className="space-y-3 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Summarization Model</label>
      <select
        className="w-full appearance-none rounded-2xl border-none bg-white p-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-all focus:ring-4 focus:ring-sky-500/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {selected && (
        <p className="px-1 text-xs font-medium text-slate-500">{selected.note}</p>
      )}
    </div>
  );
}

export const MODEL_OPTIONS = OPTIONS;
