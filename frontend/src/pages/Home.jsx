import { useEffect, useRef, useState } from "react";
import { fetchSamples, summarizeText } from "../api/client";
import BatchUpload from "../components/BatchUpload";
import DatasetToggle from "../components/DatasetToggle";
import SampleGallery from "../components/SampleGallery";
import SummarizerWidget, { MODELS } from "../components/SummarizerWidget";
import { Moon, Sun } from "lucide-react";

const FALLBACK_TEXT = {
  gcc: "A rear-end collision involving two vehicles was recorded on Sheikh Zayed Road in Dubai during the evening peak. The incident caused a temporary lane closure, minor injuries, and congestion extending into the surrounding corridor while responders managed the scene.",
  us: "A crash involving multiple vehicles blocked the two right lanes on I-95 northbound near Exit 42 in the afternoon commute, causing heavy delays and slow traffic through the corridor. Emergency responders were dispatched to the scene and drivers were advised to use caution."
};

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [datasetTrack, setDatasetTrack] = useState("gcc");
  const [text, setText] = useState(FALLBACK_TEXT.gcc);
  const [modelChoice, setModelChoice] = useState("bart_large_cnn");
  const [maxLength, setMaxLength] = useState(150);
  const [summary, setSummary] = useState("");
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);

  // Refs so async callbacks always see the latest values (avoids stale closures)
  const textRef = useRef(text);
  const maxLengthRef = useRef(maxLength);
  const datasetTrackRef = useRef(datasetTrack);
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { maxLengthRef.current = maxLength; }, [maxLength]);
  useEffect(() => { datasetTrackRef.current = datasetTrack; }, [datasetTrack]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    let active = true;
    fetchSamples(datasetTrack)
      .then((items) => {
        if (!active) return;
        setSamples(items);
        setText(items.length ? items[0].text : FALLBACK_TEXT[datasetTrack]);
      })
      .catch(() => {
        if (!active) return;
        setSamples([]);
        setText(FALLBACK_TEXT[datasetTrack]);
      });
    setSummary("");
    return () => { active = false; };
  }, [datasetTrack]);

  // Single source of truth for summarization — reads from refs to avoid stale state
  const runSummarize = async (modelId, overrideLength = null) => {
    const currentText = textRef.current;
    const currentLength = overrideLength !== null ? overrideLength : maxLengthRef.current;
    const currentTrack = datasetTrackRef.current;
    if (!currentText) return;
    setLoading(true);
    setSummary("");
    try {
      const data = await summarizeText({
        text: currentText,
        model_choice: modelId,
        max_length: currentLength,
        dataset_track: currentTrack
      });
      setSummary(data.summary);
    } catch (error) {
      setSummary(`Error: ${error?.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Called by Summarize Now button and slider release
  const handleSummarize = (overrideLength = null) => {
    if (overrideLength !== null) setMaxLength(overrideLength);
    runSummarize(modelChoice, overrideLength);
  };

  // Called when user clicks a model card — immediately re-runs with that model
  const handleModelSelect = (modelId) => {
    setModelChoice(modelId);
    runSummarize(modelId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0B1021] dark:text-slate-200 pb-16">

      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0B1021]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded border-2 border-orange-500 bg-orange-100 dark:bg-orange-500/20"></div>
          <span className="font-black text-lg tracking-tight">TRAFFIC<span className="text-orange-500 font-normal">AI</span></span>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 pt-5 grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">

        {/* Left Column */}
        <div className="xl:col-span-8 flex flex-col xl:pl-4">
          <SummarizerWidget
            text={text}
            setText={setText}
            maxLength={maxLength}
            setMaxLength={setMaxLength}
            modelChoice={modelChoice}
            setModelChoice={handleModelSelect}
            onSummarize={handleSummarize}
            loading={loading}
            summary={summary}
          />
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-4 flex flex-col xl:pr-4 pt-5 gap-5">

          {/* Dataset Track Toggle — always at top */}
          <DatasetToggle value={datasetTrack} onChange={setDatasetTrack} />

          {/* Dataset Preview — no artificial spacer, sits right below toggle */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0d1326] dark:shadow-xl overflow-hidden">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dataset Preview</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a sample to load it into the editor</p>
            </div>
            <div className="overflow-y-auto max-h-[560px] pr-1 space-y-4 custom-scroll">
              <SampleGallery items={samples} onPick={setText} />
            </div>
          </div>

          {/* Batch Upload */}
          <BatchUpload />

        </div>
      </div>
    </div>
  );
}
