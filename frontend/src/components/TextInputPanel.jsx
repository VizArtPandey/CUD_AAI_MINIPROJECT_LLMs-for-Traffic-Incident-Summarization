export default function TextInputPanel({ value, onChange }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Input: Traffic Incident Description</label>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
          {wordCount} words
        </span>
      </div>
      <textarea
        className="min-h-[220px] w-full resize-y rounded-2xl border-none bg-white p-5 text-base leading-7 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-300 focus:ring-4 focus:ring-sky-500/20"
        placeholder="Paste an accident or traffic incident description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
