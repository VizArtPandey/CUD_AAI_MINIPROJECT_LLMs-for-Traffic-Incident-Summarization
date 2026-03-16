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
  maxLength,
  setMaxLength,
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
    <div className="w-full">
      <div className="rounded-[24px] border border-slate-200 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-[#0d1326]/60">
        
        {/* Input and Output Split Area */}
        <div className="grid gap-0 lg:grid-cols-2">
           {/* LEFT PANE: INPUT */}
           <div className="p-6 md:p-8 flex flex-col relative">
             <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 dark:border-slate-800">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Original Incident</h3>
               <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
                 {wordCount} words
               </span>
             </div>
             <textarea
               className="w-full flex-1 min-h-[360px] resize-y rounded-2xl bg-transparent p-0 text-base leading-relaxed text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-200 dark:placeholder:text-slate-600"
               placeholder="Paste a traffic incident report here, or click an example below..."
               value={text}
               onChange={(e) => setText(e.target.value)}
             />
             <div className="mt-4 pt-4 border-t border-slate-200 border-dashed dark:border-slate-800">
                <button 
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setText("")}
                >
                  Clear Text
                </button>
             </div>
           </div>

           {/* RIGHT PANE: OUTPUT */}
           <div className="p-6 md:p-8 flex flex-col relative border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121930]/40 rounded-b-[24px] lg:rounded-bl-none lg:rounded-tr-[24px]">
             <div className="flex items-center justify-between border-b border-orange-200/50 pb-3 mb-4 dark:border-slate-800">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">Generated Model Output • {modelChoice}</h3>
               {summary ? (
                 <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                   {summaryWordCount}
                 </span>
               ) : null}
             </div>
             <div className="flex-1 overflow-auto min-h-[320px] flex flex-col">
                {summary ? (
                    <>
                      <p className="text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap flex-1">{summary.replace(/<n>/gi, '\n\n').replace(/[ \t]+/g, ' ').trim()}</p>
                      {extractedTags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 pt-2">
                          {extractedTags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-[11px] font-bold text-orange-600 dark:border-orange-500/30 dark:bg-[#1a0f0d] dark:text-orange-400 capitalize tracking-wide shadow-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                ) : (
                    <div className="h-full flex-1 flex items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-500 italic">
                       {loading ? "Generating summary..." : "No summary generated yet."}
                    </div>
                )}
             </div>
             {summary && (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    {copied ? <CheckCircle2 size={16}/> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => downloadTextFile(`summary_${modelChoice}.txt`, summary)}
                    className="flex-1 flex justify-center items-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#121930] dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Download size={16} /> Save
                  </button>
                </div>
             )}
           </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>

        {/* Controls block */}
        <div className="p-6 md:p-8 space-y-8">
            {/* Model Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-400 uppercase tracking-widest">Select Model</h3>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {MODELS.map((model) => {
                  const Icon = model.icon;
                  const isSelected = modelChoice === model.id;
                  const opacity = isSelected ? 'ring-2 ring-orange-500 bg-orange-50/50 dark:ring-slate-600 dark:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#121930] dark:hover:bg-slate-800/60';
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => setModelChoice(model.id)}
                      className={`relative flex flex-col items-start rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-left transition-all ${opacity}`}
                    >
                      {isSelected && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
                      <div className="flex w-full items-start justify-between mb-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                          <Icon size={18} />
                        </span>
                        <div className="group/tooltip relative">
                           <div className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 transition cursor-help dark:text-slate-500 dark:hover:text-white">
                             <span className="font-serif italic border border-slate-300 dark:border-slate-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">i</span>
                           </div>
                           <div className="absolute right-0 lg:right-auto lg:left-0 top-8 z-50 w-64 opacity-0 scale-95 origin-top-right lg:origin-top-left transition-all group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 pointer-events-none group-hover/tooltip:pointer-events-auto rounded-xl bg-slate-900 border border-slate-800 p-3 shadow-xl dark:bg-slate-800 dark:border-slate-700">
                             <p className="text-xs text-slate-300 leading-relaxed font-normal">{model.description}</p>
                           </div>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{model.name}</h4>
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${model.badgeColor}`}>
                        {model.badgeLabel}
                      </span>
                      
                      <div className="mt-6 flex w-full items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">Speed</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className={`h-1.5 w-1.5 rounded-full ${i <= model.speed ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length Slider */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-2"><FileText size={16} /> Summary Length</span>
                <span className="text-orange-500 dark:text-orange-400 tracking-normal text-lg">{maxLength} <span className="text-slate-500 text-xs uppercase ml-1 tracking-widest">words</span></span>
              </div>
              <div className="relative flex items-center pt-2 group">
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="4"
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                  onMouseUp={(e) => { if (text) onSummarize(Number(e.target.value)); }}
                  onTouchEnd={(e) => { if (text) onSummarize(Number(e.target.value)); }}
                  className="absolute z-10 w-full opacity-0 cursor-pointer h-8 -top-3"
                />
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                   <div className="h-full bg-slate-400 dark:bg-slate-600 absolute left-0 top-0 transition-all duration-100 ease-out" style={{width: `${((maxLength-20) / (400-20)) * 100}%`}}></div>
                </div>
                <div className="absolute h-4 w-4 rounded-full border-2 border-orange-500 bg-orange-100 shadow-[0_0_12px_rgba(249,115,22,0.3)] pointer-events-none transition-all duration-100 ease-out group-hover:scale-125 dark:border-orange-500 dark:bg-orange-300 dark:shadow-[0_0_12px_rgba(249,115,22,0.4)]" style={{left: `calc(${((maxLength-20) / (400-20)) * 100}% - 8px)`}}></div>
              </div>
              <div className="flex justify-between text-[11px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-600">
                <span>Concise</span>
                <span>Detailed</span>
              </div>
            </div>

            {/* Button */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={onSummarize}
                disabled={loading}
                className="group flex-1 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 py-4 text-base font-bold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 dark:from-orange-500 dark:to-orange-600 focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50"
              >
                {loading ? "Generating Output..." : "Summarize Now"}
                {!loading && <ArrowRight size={18} className="text-white/80 group-hover:text-white transition-colors" />}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
