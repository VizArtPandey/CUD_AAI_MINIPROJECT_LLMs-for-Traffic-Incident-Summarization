import { useEffect, useRef, useState } from "react";
import { fetchSamples, summarizeText } from "../api/client";
import BatchUpload from "../components/BatchUpload";
import DatasetToggle from "../components/DatasetToggle";
import LiveMetrics from "../components/LiveMetrics";
import SampleGallery from "../components/SampleGallery";
import SummarizerWidget, { MODELS } from "../components/SummarizerWidget";
import { Moon, Sun, Zap } from "lucide-react";

const FALLBACK_TEXT = {
  gcc: "A rear-end collision involving two vehicles was recorded on Sheikh Zayed Road in Dubai during the evening peak. The incident caused a temporary lane closure, minor injuries, and congestion extending into the surrounding corridor while responders managed the scene.",
  us: "A crash involving multiple vehicles blocked the two right lanes on I-95 northbound near Exit 42 in the afternoon commute, causing heavy delays and slow traffic through the corridor. Emergency responders were dispatched to the scene and drivers were advised to use caution."
};

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [datasetTrack, setDatasetTrack] = useState("gcc");
  const [text, setText] = useState(FALLBACK_TEXT.gcc);
  const [modelChoice, setModelChoice] = useState("bart_large_cnn");
  const [summary, setSummary] = useState("");
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);

  const textRef = useRef(text);
  const datasetTrackRef = useRef(datasetTrack);
  const modelChoiceRef = useRef(modelChoice);

  // Sync refs safely
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { datasetTrackRef.current = datasetTrack; }, [datasetTrack]);
  useEffect(() => { modelChoiceRef.current = modelChoice; }, [modelChoice]);

  // Initial dark mode setup (flicker-free)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);


  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchSamples(datasetTrack)
      .then((items) => {
        if (!active) return;
        setSamples(items);
        // Only override if default or empty
        setText((prev) => {
            if (!prev || prev === FALLBACK_TEXT.gcc || prev === FALLBACK_TEXT.us || samples.some(s => s.text === prev)) {
                return items.length ? items[0].text : FALLBACK_TEXT[datasetTrack];
            }
            return prev;
        });
      })
      .catch((err) => {
        if (!active || err.name === 'AbortError') return;
        setSamples([]);
        setText(FALLBACK_TEXT[datasetTrack]);
      });

    setSummary("");
    return () => { 
        active = false;
        controller.abort();
    };
  }, [datasetTrack]);

  const runSummarize = useCallback(async (targetModelId) => {
    const modelToUse = targetModelId || modelChoiceRef.current;
    const currentText = textRef.current;
    const currentTrack = datasetTrackRef.current;
    
    if (!currentText || currentText.trim().length < 10) return;
    
    setLoading(true);
    setSummary("");
    
    try {
      const data = await summarizeText({ 
        text: currentText, 
        model_choice: modelToUse, 
        dataset_track: currentTrack 
      });
      setSummary(data.summary);
    } catch (error) {
      setSummary(`Error: ${error?.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSummarize = useCallback(() => runSummarize(), [runSummarize]);
  const handleModelSelect = useCallback((modelId) => { 
    setModelChoice(modelId); 
    runSummarize(modelId); 
  }, [runSummarize]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d1f] text-slate-900 dark:text-slate-200 transition-colors duration-300 pb-16 dark:bg-grid">

      {/* Navbar */}
      <header className="flex h-16 items-center justify-between px-8 border-b border-black/10 dark:border-white/5 bg-white/80 dark:bg-[#060d1f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-black text-base tracking-tight text-slate-900 dark:text-white uppercase">Traffic</span>
            <span className="text-orange-400 font-black text-base uppercase">Intel</span>
          </div>
          <div className="hidden sm:flex flex-col ml-2 justify-center">
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">CUD · AAI Midterm Project</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dot-glow"></span>
            Live Backend
          </span>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition border border-black/10 dark:border-white/10"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-[1920px] mx-auto px-6 xl:px-10 pt-8">

        {/* Hero Banner */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Turn Traffic Chaos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">
                into Clarity
              </span>
            </h1>
            <p className="text-sm text-slate-500 max-w-xl font-medium leading-relaxed">
              Compare extractive &amp; abstractive LLM summarization methods on real-world traffic incident data from GCC and US datasets.
            </p>
          </div>
          <div className="flex gap-6 shrink-0">
            {[
              { label: "Models",      value: "4"    },
              { label: "GCC Samples", value: "250+" },
              { label: "US Records",  value: "5K+"  }
            ].map(s => (
              <div key={s.label} className="text-center bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/[0.07] rounded-xl px-5 py-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Column Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px_300px] gap-5 items-stretch border-t border-slate-200 dark:border-white/[0.05] pt-6">

          {/* Column 1: Main Summarizer Widget */}
          <div className="h-full min-h-0">
            <SummarizerWidget
              text={text}
              setText={setText}
              modelChoice={modelChoice}
              setModelChoice={handleModelSelect}
              onSummarize={handleSummarize}
              loading={loading}
              summary={summary}
            />
          </div>

          {/* Column 2: Dataset Preview */}
          <div className="h-full flex flex-col min-h-0">
            <div className="rounded-2xl border border-slate-300 dark:border-white/[0.07] bg-white dark:bg-[#0d1326] shadow-sm dark:shadow-2xl flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Dataset Preview</h3>
                <span className="rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                  {samples.length} Samples
                </span>
              </div>
              <div className="overflow-y-auto flex-1 px-3 py-3 space-y-2 custom-scroll">
                <SampleGallery items={samples} onPick={setText} />
              </div>
            </div>
          </div>

          {/* Column 3: Controls */}
          <div className="flex flex-col gap-5 h-full">
            <DatasetToggle value={datasetTrack} onChange={setDatasetTrack} />
            <BatchUpload />
            <LiveMetrics activeModel={modelChoice} />
          </div>

        </div>
      </div>
    </div>
  );
}
