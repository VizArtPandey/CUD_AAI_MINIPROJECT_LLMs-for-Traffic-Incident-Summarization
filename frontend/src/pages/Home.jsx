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

  // Refs ensure that the latest state values are available to the async runSummarize function,
  // preventing "stale closures" where the function uses old scale values.
  const textRef = useRef(text);
  const maxLengthRef = useRef(maxLength);
  const datasetTrackRef = useRef(datasetTrack);
  const modelChoiceRef = useRef(modelChoice);

  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { maxLengthRef.current = maxLength; }, [maxLength]);
  useEffect(() => { datasetTrackRef.current = datasetTrack; }, [datasetTrack]);
  useEffect(() => { modelChoiceRef.current = modelChoice; }, [modelChoice]);

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

  const runSummarize = async (targetModelId) => {
    // Determine which model to use: either the passed one (for direct clicks) or the state (for slider/button)
    const modelToUse = targetModelId || modelChoiceRef.current;
    const currentText = textRef.current;
    const currentLength = maxLengthRef.current;
    const currentTrack = datasetTrackRef.current;

    if (!currentText || currentText.trim().length < 10) return;

    setLoading(true);
    setSummary("");
    try {
      const data = await summarizeText({
        text: currentText,
        model_choice: modelToUse,
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

  // Main button trigger
  const handleSummarize = (overrideLength = null) => {
    if (overrideLength !== null) setMaxLength(overrideLength);
    runSummarize();
  };

  // Model selection trigger
  const handleModelSelect = (modelId) => {
    setModelChoice(modelId);
    runSummarize(modelId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0B1021] dark:text-slate-200 pb-16">
      
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0B1021]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border-2 border-orange-500 bg-orange-100 dark:bg-orange-500/20"></div>
            <span className="font-black text-lg tracking-tight uppercase">Traffic<span className="text-orange-500 font-normal">AI</span></span>
        </div>
        <button 
           onClick={() => setIsDark(!isDark)}
           className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 pt-8">
        
        {/* Row 1: Top Aligned Hero and Dataset Toggle */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-end mb-8">
          <div className="xl:col-span-8 xl:pl-4">
             <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-orange-600 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span> AI Traffic Summarization
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Turn Traffic Chaos <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500">into Clarity</span>
                </h1>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
                  Select a model below to generate instant summaries. The Dataset Preview on the right allows you to quickly load existing incident data.
                </p>
              </div>
          </div>
          <div className="xl:col-span-4 xl:pr-4 flex flex-col justify-end">
             <DatasetToggle value={datasetTrack} onChange={setDatasetTrack} />
          </div>
        </div>

        {/* Row 2: Parallel Grid of Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Main Summarizer Section */}
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

          {/* Right Sidebar Section */}
          <div className="xl:col-span-4 flex flex-col xl:pr-4 gap-8">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0d1326] dark:shadow-xl relative overflow-hidden">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dataset Preview</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a sample to load it into the editor</p>
              </div>
              <div className="overflow-y-auto max-h-[600px] pr-2 -mr-2 space-y-4 custom-scroll">
                <SampleGallery items={samples} onPick={setText} />
              </div>
            </div>
            
            <BatchUpload />
          </div>

        </div>
      </div>
    </div>
  );
}
