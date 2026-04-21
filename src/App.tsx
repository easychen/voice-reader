import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Settings2, Globe, Moon, Sun, AlertCircle } from 'lucide-react';

const TRANSLATIONS = {
  zh: {
    title: '网页朗读器',
    subtitle: '输入文字，点击下方按钮开始智能朗读',
    chars: '字符',
    settings: '设备设置',
    voiceSelect: '发音人选择 Voice',
    loading: '加载中...',
    placeholder: '在此处输入或粘贴您想要朗读的文字...',
    speed: '语速',
    pitch: '音调',
    stop: '停止',
    play: '开始朗读',
    resume: '继续',
    pause: '暂停',
    footer: '提示：在 Edge 或 Chrome 浏览器中体验最佳。遇到长文本时，朗读功能可有效缓解视觉疲劳。',
    notSupported: '非常抱歉，我们未能在您的浏览器中检测到语音合成引擎。请尝试使用最新版本的 Edge、Chrome 或 Safari 浏览器。',
    switchLang: 'EN',
    seoTitle: '网页朗读器 VoiceReader - 免费在线文字转语音(TTS)工具',
    seoDesc: '一款免费的基于浏览器的在线文字转语音(TTS)工具。支持多语言自然发音，无需下载安装，即贴即读，完美兼容Edge和Chrome。',
  },
  en: {
    title: 'VoiceReader',
    subtitle: 'Input text, click the button below to start reading',
    chars: 'chars',
    settings: 'Settings',
    voiceSelect: 'Select Voice',
    loading: 'Loading...',
    placeholder: 'Type or paste the text you want to read here...',
    speed: 'Speed',
    pitch: 'Pitch',
    stop: 'Stop',
    play: 'Start Reading',
    resume: 'Resume',
    pause: 'Pause',
    footer: 'Tip: Best experienced in Edge or Chrome. Text-to-speech helps relieve visual fatigue when encountering long texts.',
    notSupported: 'Sorry, no speech synthesis engine was found in your browser. Please try using the latest version of Edge, Chrome, or Safari.',
    switchLang: '中',
    seoTitle: 'VoiceReader - Free Online Text-to-Speech (TTS) Tool',
    seoDesc: 'A free browser-based online Text-to-Speech (TTS) tool. Supports multilingual natural voices, no installation required. Paste and play instantly.',
  }
};

const STORAGE_LANG = 'voice-reader:lang';
const STORAGE_THEME = 'voice-reader:theme';

const getSystemLang = (): 'zh' | 'en' =>
  typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

const getSystemDark = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export default function App() {
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_LANG) : null;
    return stored === 'zh' || stored === 'en' ? stored : getSystemLang();
  });
  const t = TRANSLATIONS[lang];

  // Dynamically update SEO metadata when language changes
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t.seoTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t.seoDesc);
    }
  }, [lang, t]);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_THEME) : null;
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return getSystemDark();
  });

  // Follow OS theme changes while the user hasn't made a manual choice
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_THEME)) setDarkMode(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [text, setText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Load available voices from the browser
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setIsSupported(true);
        // Default to a language-appropriate voice
        if (!selectedVoice) {
          const preferredLang = lang === 'zh' ? 'zh' : 'en';
          const preferredVoice = availableVoices.find(v => v.lang.includes(preferredLang) || v.lang.includes('cmn')) || availableVoices[0];
          if(preferredVoice) {
            setSelectedVoice(preferredVoice.name);
          }
        }
      }
    };

    loadVoices();
    // Chrome and Edge sometimes need this event to load voices
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Timeout check: if no voices after 2.5s, likely not supported
    const timeout = setTimeout(() => {
      if (synth.getVoices().length === 0) {
        setIsSupported(false);
      }
    }, 2500);

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
      synth.cancel();
      clearTimeout(timeout);
    };
  }, [lang]);

  const handlePlay = useCallback(() => {
    if (!text.trim()) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utterance.onerror = (e) => {
      console.error('Speech synthesis errored:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
      setIsPlaying(true);
    };

    window.speechSynthesis.speak(utterance);
  }, [text, voices, selectedVoice, rate, pitch, isPaused]);

  const handlePause = useCallback(() => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
    }
  }, [isPlaying, isPaused]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    localStorage.setItem(STORAGE_LANG, next);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem(STORAGE_THEME, next ? 'dark' : 'light');
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-8 font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-4xl h-full flex flex-col space-y-4 sm:space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-end pb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-light tracking-tight text-slate-900 dark:text-slate-50">
              {lang === 'zh' ? '网页朗读器 ' : ''}<span className="text-indigo-600 dark:text-indigo-400 font-medium">VoiceReader</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs font-mono text-slate-400 dark:text-slate-500 pb-1 sm:pb-0">
            <span className="hidden sm:inline">{text.length} {t.chars}</span>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.settings}</span>
            </button>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <button
              onClick={toggleLanguage}
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-bold uppercase"
              title="切换语言"
            >
              {t.switchLang}
            </button>
            <button
              onClick={toggleDarkMode}
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Browser Support Alert */}
        {!isSupported && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 shrink-0 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{t.notSupported}</p>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 flex flex-col space-y-4 min-h-0 transition-opacity duration-300 ${!isSupported ? 'opacity-40 pointer-events-none' : ''}`}>
          
          {/* Settings / Voice Selection */}
          {showSettings && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-2 shrink-0">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {t.voiceSelect}
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 cursor-pointer"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang}) {voice.default ? ' [*]' : ''}
                    </option>
                  ))}
                  {voices.length === 0 && <option>{t.loading}</option>}
                </select>
              </div>
            </div>
          )}

          {/* Text Area Container */}
          <div className="relative flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[150px]">
            <textarea
              className="flex-1 w-full h-full p-4 sm:p-8 text-base sm:text-lg leading-relaxed bg-transparent resize-none border-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-200"
              placeholder={t.placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4 shrink-0 transition-colors duration-300">
            
            <div className="flex items-center space-x-6 w-full sm:w-auto justify-center sm:justify-start">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">{t.speed} {rate.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-24 sm:w-32 accent-indigo-600 dark:accent-indigo-400 cursor-pointer"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">{t.pitch} {pitch.toFixed(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-24 sm:w-32 accent-indigo-600 dark:accent-indigo-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors disabled:opacity-50 disabled:bg-transparent dark:disabled:bg-transparent"
              >
                {t.stop}
              </button>
              
              {(!isPlaying || isPaused) ? (
                <button
                  onClick={handlePlay}
                  disabled={!text.trim()}
                  className="flex-1 sm:flex-none px-6 sm:px-10 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none text-white rounded-lg font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center space-x-2"
                >
                  {isPaused ? <Play className="w-5 h-5 fill-current" /> : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  )}
                  <span>{isPaused ? t.resume : t.play}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex-1 sm:flex-none px-6 sm:px-10 py-3 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium shadow-lg shadow-red-900/20 dark:shadow-none transition-all flex items-center justify-center space-x-2"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>{t.pause}</span>
                </button>
              )}
            </div>

          </div>
        </main>

        {/* Footer Info */}
        <footer className="text-center shrink-0">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t.footer}
          </p>
        </footer>
      </div>
    </div>
  );
}

