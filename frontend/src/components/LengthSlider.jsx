export default function LengthSlider({ value, onChange }) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Max summary length</label>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">
          {value} tokens
        </span>
      </div>
      <input
        type="range"
        min="20"
        max="256"
        step="4"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full appearance-none rounded-lg bg-slate-200 accent-indigo-500 hover:accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
      <div className="flex justify-between px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span>Short base</span>
        <span>Detailed report</span>
      </div>
    </div>
  );
}
