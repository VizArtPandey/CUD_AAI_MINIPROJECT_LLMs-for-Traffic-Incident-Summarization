import { useState, useMemo } from "react";
import { Copy, UploadCloud, FileText, Zap, Cpu, Sun, Layers, ArrowRight, Download, CheckCircle2 } from "lucide-react";

export const MODELS = [
  {
    id: "bart_large_cnn",
    name: "BART",
    badgeLabel: "Top Pick",
    badgeColor: "text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-400 dark:border-orange-500/30 dark:bg-orange-500/10",
    speed: 2,
    icon: Cpu,
    description: "Meta's BART model fine-tuned on CNN/DailyMail. It produces highly abstractive, narrative-style summaries, making it the best overall for rewriting raw incident descriptions into fluent reports."
  },
  {
    id: "flan_t5_small",
    name: "Flan-T5",
    badgeLabel: "Fast",
    badgeColor: "text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:border-blue-500/30 dark:bg-blue-500/10",
    speed: 3,
    icon: Zap,
    description: "Google's instruction-tuned T5 model. It's incredibly fast and lightweight to run locally on CPU, though its summaries can occasionally be more concise and rigid than BART."
  },
  {
    id: "pegasus_cnn",
    name: "PEGASUS",
    badgeLabel: "Precise",
    badgeColor: "text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    speed: 1,
    icon: Layers,
    description: "Google's PEGASUS model designed specifically for summarization. It is highly precise but computationally heavy, resulting in slower generation times."
  },
  {
    id: "textrank",
    name: "TextRank",
    badgeLabel: "Offline",
    badgeColor: "text-purple-600 bg-purple-100 border-purple-200 dark:text-purple-400 dark:border-purple-500/30 dark:bg-purple-500/10",
    speed: 3,
    icon: Sun,
    description: "A classic non-neural extractive model based on PageRank. It works entirely offline without a GPU by identifying and extracting the most important exact sentences from the text."
  }
];

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

function extractTags(text) {
  if (!text) return [];
  try {
    const tags = [];

    // Vehicles
    const vehicleMatch = text.match(/\b(\d+|two|three|four|five|several|multiple)\s+(?:vehicles?|cars?|trucks?)\b/i);
    if (vehicleMatch) tags.push(vehicleMatch[1].toLowerCase() + " vehicles");

    // Duration (minutes)
    const minMatch = text.match(/\b(\d+)\s*(?:min|minutes?)\b/i);
    if (minMatch) tags.push(minMatch[1] + " min");

    // Distance (miles/km)
    const miMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:miles?|mi|km)\b/i);
    if (miMatch) tags.push(miMatch[1] + " mi backup");

    // Road codes like D71, E11
    const codeMatches = text.match(/\b[A-Z]\d{1,3}\b/g);
    if (codeMatches) {
      codeMatches.forEach(c => { if (!tags.includes(c)) tags.push(c); });
    }

    // Named roads (safe version)
    const roadMatch = text.match(/\b(?:Sheikh\s+Zayed|Hessa|Al\s+Khail|E[0-9]+|Highway\s+\d+|I-\d+|Route\s+\d+)[^,.]*(?:Road|Rd|Street|St|Hwy)?\b/gi);
    if (roadMatch) {
      const shortRoad = roadMatch[0].trim().split(' ').slice(0, 3).join(' ');
      if (!tags.some(t => t.toLowerCase() === shortRoad.toLowerCase())) tags.push(shortRoad);
    }

    return Array.from(new Set(tags)).slice(0, 4);
  } catch (_) {
    return [];
  }
}

export default function SummarizerWidget({
  text,
  setText,
  modelChoice,
  setModelChoice,
  onSummarize,
  loading,
  summary
}) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const summaryWordCount = summary ? summary.split(/\s+/).filter(Boolean).length : 0;

  const [copied, setCopied] = useState(false);
  
  const extractedTags = useMemo(() => {
    return summary ? extractTags(summary + " " + text) : [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="rounded-2xl border border-slate-300 dark:border-white/[0.07] bg-white dark:bg-[#0d1326] shadow-sm dark:shadow-2xl flex-1 flex flex-col">
        
        {/* Input and Output Split Area */}
        <div className="grid gap-0 lg:grid-cols-2 flex-1">
           {/* LEFT PANE: INPUT */}
           <div className="p-4 md:p-5 flex flex-col relative">
             <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] pb-2.5 mb-3">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Original Incident</h3>
               <span className="rounded-full bg-slate-100 dark:bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                 {wordCount} words
               </span>
             </div>
             <textarea
               className="w-full resize-none bg-transparent p-0 text-lg leading-[1.85] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-0"
               rows={5}
               placeholder="Paste a traffic incident report here, or click a sample on the right..."
               value={text}
               onChange={(e) => setText(e.target.value)}
             />
             <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.05] border-dashed">
                <button
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setText("")}
                >
                  Clear Text
                </button>
             </div>
           </div>

           {/* RIGHT PANE: OUTPUT */}
           <div className="p-4 md:p-5 flex flex-col relative border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01] rounded-b-2xl lg:rounded-bl-none lg:rounded-tr-2xl">
             <div className="flex items-center justify-between border-b border-orange-300/40 dark:border-orange-400/20 pb-2.5 mb-3">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400">Generated Output · {modelChoice.replace(/_/g, ' ').toUpperCase()}</h3>
               {summary ? (
                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-[9px] font-bold text-orange-400 border border-orange-500/30">
                   {summaryWordCount}
                 </span>
               ) : null}
             </div>
             <div className="flex flex-col custom-scroll">
                {summary ? (
                    <>
                      <p className="text-lg leading-[1.85] text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{summary.replace(/<n>/gi, '\n\n').replace(/[ \t]+/g, ' ').trim()}</p>
                      {extractedTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {extractedTags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/5 px-2.5 py-0.5 text-[10px] font-bold text-orange-400 capitalize tracking-wide">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                ) : (
                    <div className="h-full flex-1 flex items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-600 italic">
                       {loading ? "Generating summary..." : "No summary generated yet."}
                    </div>
                )}
             </div>
             {summary && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-white/5 pt-4">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.12] py-3 text-sm font-bold text-slate-700 dark:text-white transition border border-slate-200 dark:border-white/10"
                  >
                    {copied ? <CheckCircle2 size={16}/> : <Copy size={16} />} {copied ? "Copied" : "Copy Summary"}
                  </button>
                  <button
                    onClick={() => downloadTextFile(`summary_${modelChoice}.txt`, summary)}
                    className="flex-1 flex justify-center items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                  >
                    <Download size={16} /> Save
                  </button>
                </div>
             )}
           </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-slate-100 dark:bg-white/[0.05]"></div>

        {/* Controls block */}
        <div className="p-4 md:p-6 space-y-5">
            {/* Model Selection */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">Select Model</h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {MODELS.map((model) => {
                  const Icon = model.icon;
                  const isSelected = modelChoice === model.id;
                  const cardCls = isSelected
                    ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-500/[0.08] border-orange-400 dark:border-orange-500/40'
                    : 'bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/15';
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => setModelChoice(model.id)}
                      className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${cardCls}`}
                    >
                      {isSelected && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
                      <div className="flex w-full items-start justify-between mb-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                          <Icon size={18} />
                        </span>
                        <div className="group/tooltip relative">
                           <div className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-orange-50 dark:hover:bg-white/10 transition cursor-help">
                             <span className="font-serif italic border-2 border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 hover:border-orange-500 hover:text-orange-600 dark:hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] transition">
                               i
                             </span>
                           </div>
                           <div className="absolute right-0 lg:right-auto lg:left-0 top-8 z-50 w-64 opacity-0 scale-95 origin-top-right lg:origin-top-left transition-all group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 pointer-events-none group-hover/tooltip:pointer-events-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 shadow-xl">
                             <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{model.description}</p>
                           </div>
                        </div>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{model.name}</h4>
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${model.badgeColor}`}>
                        {model.badgeLabel}
                      </span>
                      <div className="mt-4 flex w-full items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-600">Speed</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className={`h-1.5 w-5 rounded-full ${i <= model.speed ? 'bg-orange-500' : 'bg-white/10'}`} />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Button */}
            <div className="flex gap-4">
              <button
                onClick={onSummarize}
                disabled={loading}
                className="group flex-1 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-400 hover:to-orange-500 focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50"
              >
                {loading ? "Generating Output..." : "Summarize Now"}
                {!loading && <ArrowRight size={18} className="text-white/80 group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
