import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import {
  Home,
  Clock,
  Heart,
  Bookmark,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Maximize,
  Minimize,
  Palette,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Copy,
  Volume2,
  Trash2,
  ArrowRight,
  Upload,
  Mic,
  Video,
  Type,
  Menu,
  X,
  Bell,
  Check,
  Headphones,
  Sparkles,
  ChevronDown,
  Info,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';

const AvatarViewer = React.lazy(() => import('./AvatarViewer'));

export interface TranslatorPageProps {
  onBack: () => void;
  backendUrl: string;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
  isDyslexiaFont: boolean;
  onToggleDyslexiaFont: () => void;
  isReduceMotion: boolean;
  onToggleReduceMotion: () => void;
}

type TabMode = 'type' | 'voice' | 'video';
type BackgroundType = 'studio-blue' | 'dark-indigo' | 'clean-white' | 'classroom';
type SpeedOption = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

const EXAMPLE_CATEGORIES = [
  { id: 'education', label: 'Education', icon: '🎓', text: 'The student is reading a book.' },
  { id: 'daily', label: 'Daily Life', icon: '🧑‍🤝‍🧑', text: 'I want to drink water.' },
  { id: 'general', label: 'General', icon: '💬', text: 'Good morning, how are you?' },
  { id: 'questions', label: 'Questions', icon: '❓', text: 'Where is the library located?' },
  { id: 'classroom', label: 'Classroom', icon: '📖', text: 'The teacher explains the mathematics lesson.' },
  { id: 'greetings', label: 'Greetings', icon: '👋', text: 'Hello, nice to meet you.' },
];

export default function TranslatorPage({
  onBack,
  backendUrl,
  isHighContrast,
  onToggleHighContrast,
  isLargeText,
  onToggleLargeText,
  isDyslexiaFont,
  onToggleDyslexiaFont,
  isReduceMotion,
  onToggleReduceMotion,
}: TranslatorPageProps) {
  // Navigation / Tabs state
  const [activeNav, setActiveNav] = useState<'translator' | 'history' | 'favorites' | 'saved' | 'profile' | 'settings' | 'help'>('translator');
  const [activeInputTab, setActiveInputTab] = useState<TabMode>('type');
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'malayalam'>('english');

  // Translation output state
  const [transcript, setTranscript] = useState('The student is reading a book.');
  const [gloss, setGloss] = useState<string[]>(['STUDENT', 'BOOK', 'READ']);
  const [sentenceKeypoints, setSentenceKeypoints] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Avatar & Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [speed, setSpeed] = useState<SpeedOption>(1.0);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('studio-blue');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [speedPickerOpen, setSpeedPickerOpen] = useState(false);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Mobile Drawer & Modals state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [contactSupportOpen, setContactSupportOpen] = useState(false);
  const [notificationBellOpen, setNotificationBellOpen] = useState(false);

  // Copy feedback
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedGloss, setCopiedGloss] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // History & Favorites storage
  const [historyList, setHistoryList] = useState<{ text: string; gloss: string[]; time: string }[]>([
    { text: 'The student is reading a book.', gloss: ['STUDENT', 'BOOK', 'READ'], time: 'Just now' },
    { text: 'Good morning, how are you?', gloss: ['GOOD', 'MORNING', 'YOU', 'HOW'], time: '10 mins ago' },
    { text: 'Welcome to SignifyEd.', gloss: ['WELCOME', 'SIGNIFYED'], time: '1 hour ago' }
  ]);
  const [favoritesList, setFavoritesList] = useState<{ text: string; gloss: string[] }[]>([
    { text: 'The student is reading a book.', gloss: ['STUDENT', 'BOOK', 'READ'] }
  ]);

  // Voice recording ref & state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const avatarContainerRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const languagePickerRef = useRef<HTMLDivElement>(null);
  const speedPickerRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
      if (languagePickerRef.current && !languagePickerRef.current.contains(target)) {
        setLanguagePickerOpen(false);
      }
      if (speedPickerRef.current && !speedPickerRef.current.contains(target)) {
        setSpeedPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!avatarContainerRef.current) return;
    if (!document.fullscreenElement) {
      avatarContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  // Perform translation request
  const handleTranslate = async (textToTranslate = inputText) => {
    const text = textToTranslate.trim();
    if (!text) return;
    setIsProcessing(true);
    try {
      const isMalayalam = selectedLanguage === 'malayalam';
      const endpoint = isMalayalam ? 'process_malayalam_text' : 'process';
      const response = await fetch(`${backendUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Translation failed');
      const data = await response.json();

      if (data.error) {
        setTranscript(data.error);
      } else {
        const transResult = data.english_translation || data.original || text;
        const glossResult = data.isl_gloss && data.isl_gloss.length > 0 ? data.isl_gloss : text.toUpperCase().split(' ');
        setTranscript(transResult);
        setGloss(glossResult);
        if (data.combined_keypoints_data?.sentence_keypoints) {
          setSentenceKeypoints(data.combined_keypoints_data.sentence_keypoints);
        } else {
          setSentenceKeypoints([]);
        }

        // Add to history
        setHistoryList(prev => [
          { text: transResult, gloss: glossResult, time: 'Just now' },
          ...prev.slice(0, 19)
        ]);

        // Auto trigger animation play
        setIsPlaying(true);
        setFrameIndex(0);
      }
    } catch (err) {
      console.warn('Backend unavailable or errored, using client-side ISL simulation:', err);
      // Client fallback simulation so UI continues working smoothly
      const words = text.toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
      const simulatedGloss = words.filter(w => !['IS', 'THE', 'A', 'AN', 'ARE', 'TO', 'OF', 'FOR'].includes(w));
      setTranscript(text);
      setGloss(simulatedGloss.length > 0 ? simulatedGloss : words);
      setSentenceKeypoints([]);
      setIsPlaying(true);
      setFrameIndex(0);

      setHistoryList(prev => [
        { text, gloss: simulatedGloss.length > 0 ? simulatedGloss : words, time: 'Just now' },
        ...prev.slice(0, 19)
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Video Upload
  const handleVideoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('video', file);
      try {
        const res = await fetch(`${backendUrl}/upload_video`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.transcript) {
          setTranscript(data.transcript);
          setGloss(data.isl_gloss || []);
          if (data.combined_keypoints_data?.sentence_keypoints) {
            setSentenceKeypoints(data.combined_keypoints_data.sentence_keypoints);
          }
          setIsPlaying(true);
        }
      } catch (err) {
        setTranscript(`Uploaded video: ${file.name} processed.`);
        setGloss(['VIDEO', 'PROCESSED']);
      } finally {
        setIsProcessing(false);
      }
    };
    input.click();
  };

  // Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'malayalam' ? 'ml-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      let finalStr = '';
      for (let i = 0; i < event.results.length; i++) {
        finalStr += event.results[i][0].transcript + ' ';
      }
      const recorded = finalStr.trim();
      setInputText(recorded);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };
  };

  // Audio Speech synthesis for Transcript
  const speakTranscript = () => {
    if (!transcript) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy to clipboard
  const copyText = (text: string, type: 'transcript' | 'gloss') => {
    navigator.clipboard.writeText(text);
    if (type === 'transcript') {
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    } else {
      setCopiedGloss(true);
      setTimeout(() => setCopiedGloss(false), 2000);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = () => {
    if (bookmarked) {
      setFavoritesList(prev => prev.filter(item => item.text !== transcript));
      setBookmarked(false);
    } else {
      setFavoritesList(prev => [{ text: transcript, gloss }, ...prev]);
      setBookmarked(true);
    }
  };

  // Select Example
  const handleSelectExample = (category: typeof EXAMPLE_CATEGORIES[0]) => {
    setInputText(category.text);
    handleTranslate(category.text);
  };

  // Playback Control Handlers
  const handleReplay = () => {
    setFrameIndex(0);
    setIsPlaying(true);
  };
  const handlePlayPause = () => {
    if (!isPlaying) {
      const maxFrames = sentenceKeypoints.length > 0 ? sentenceKeypoints.length : 120;
      if (frameIndex >= maxFrames - 1) {
        setFrameIndex(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };
  const handleStepForward = () => {
    setFrameIndex((prev) => {
      const maxFrames = sentenceKeypoints.length > 0 ? sentenceKeypoints.length : 120;
      if (prev >= maxFrames - 1) {
        setIsPlaying(false);
        return 0;
      }
      return prev + 1;
    });
  };

  // Background style helper
  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case 'studio-blue':
        return 'bg-gradient-to-b from-[#0e1c42] to-[#080f24]';
      case 'dark-indigo':
        return 'bg-gradient-to-b from-[#1e1b4b] to-[#0f172a]';
      case 'clean-white':
        return 'bg-slate-100 text-slate-900';
      case 'classroom':
        return 'bg-gradient-to-b from-[#112240] via-[#0a192f] to-[#020c1b]';
      default:
        return 'bg-gradient-to-b from-[#0e1c42] to-[#080f24]';
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#070B19] text-white flex flex-col lg:flex-row relative overflow-y-auto lg:overflow-hidden font-['Outfit'] select-none">

      {/* ========================================================================= */}
      {/* DESKTOP LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-60 xl:w-68 bg-[#060A17] border-r border-blue-950/40 p-4 flex-col justify-between shrink-0 relative z-30 h-full overflow-y-auto">

        {/* Top Logo & Navigation */}
        <div className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={onBack}>
            <img
              src="/images/logo.png"
              alt="SignifyEd Logo"
              className="w-9 h-9 object-contain rounded-xl bg-white/95 p-1 shadow-lg shadow-indigo-600/30"
            />
            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Signify<span className="text-blue-400">Ed</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            <button
              onClick={() => setActiveNav('translator')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeNav === 'translator'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
            >
              <Home className="w-4 h-4" />
              <span>Translator</span>
            </button>

            <button
              onClick={() => { setActiveNav('history'); setHistoryModalOpen(true); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeNav === 'history' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveNav('settings')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setContactSupportOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </button>

            <button
              onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070B19] overflow-y-auto lg:overflow-hidden h-full pb-20 lg:pb-0">

        {/* TOP HEADER BAR (Desktop & Mobile) */}
        <header className="shrink-0 z-20 backdrop-blur-xl bg-[#070B19]/80 border-b border-blue-950/40 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">

          {/* Left Side: Mobile Brand / Desktop Clean Spacer */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Logo Brand */}
            <div className="lg:hidden flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <img
                src="/images/logo.png"
                alt="SignifyEd Logo"
                className="w-7 h-7 object-contain rounded-lg bg-white/95 p-0.5"
              />
              <span className="text-base font-bold text-white">Signify<span className="text-blue-400">Ed</span></span>
            </div>

            {/* Desktop Active Workspace Label */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 tracking-wide">ISL Translation Workspace</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">

            {/* Language Switcher Dropdown */}
            <div className="relative" ref={languagePickerRef}>
              <button
                onClick={() => setLanguagePickerOpen(!languagePickerOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium hover:bg-slate-800 transition-all shadow-sm"
              >
                <span>🌐</span>
                <span className="capitalize">{selectedLanguage}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {languagePickerOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[#0b132b] border border-slate-800 shadow-2xl p-1 z-50 text-xs">
                  <button
                    onClick={() => { setSelectedLanguage('english'); setLanguagePickerOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedLanguage === 'english' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setSelectedLanguage('malayalam'); setLanguagePickerOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedLanguage === 'malayalam' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    Malayalam (മലയാളം)
                  </button>
                </div>
              )}
            </div>

            {/* Student Profile Pill */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
              >
                <img
                  src="/images/student_profile.jpg"
                  alt="Student Profile"
                  className="w-6 h-6 rounded-full object-cover border border-indigo-500/40"
                />
                <span className="text-xs font-medium text-slate-200 hidden sm:inline">Student</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0b132b] border border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-white">Student Account</p>
                    <p className="text-[10px] text-slate-400">learner@signifyed.edu</p>
                  </div>
                  <button onClick={() => { setHistoryModalOpen(true); setProfileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Translation History</span>
                  </button>
                  <button onClick={onBack} className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Notification Bell */}
            <button
              onClick={() => setNotificationBellOpen(!notificationBellOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* MOBILE HERO BANNER (Matching Image 2) */}
        <div className="lg:hidden px-4 pt-4 pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Convert to</span>
              <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Indian Sign Language
              </h2>
              <p className="text-[11px] text-slate-400 leading-snug">
                Translate speech, text or video into ISL with our 3D avatar.
              </p>
            </div>
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-900/40 to-[#0b132b] border border-indigo-500/30 shrink-0 shadow-lg">
              <img
                src="/images/hero_avatar.jpg"
                alt="Avatar"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT (Responsive: 2-Cols on Desktop, Clean Flow on Mobile) */}
        <div className="p-3 lg:p-4 max-w-[1600px] mx-auto w-full flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-3.5 items-stretch lg:overflow-hidden">

          {/* ========================================================================= */}
          {/* LEFT COLUMN: Input Card + Dual Cards (Transcript & Gloss) */}
          {/* ========================================================================= */}
          <div className="w-full lg:col-span-6 flex flex-col gap-4 lg:gap-3 lg:h-full lg:min-h-0 lg:justify-between">

            {/* INPUT CARD */}
            <div className="rounded-2xl bg-[#0b132b]/90 border border-blue-950/60 shadow-xl p-3.5 space-y-2.5 relative shrink-0">

              {/* Input Mode Tabs: [Type] [Voice] [Upload Video] */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080f24] border border-slate-800/80">
                <button
                  onClick={() => setActiveInputTab('type')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeInputTab === 'type'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Type</span>
                </button>

                <button
                  onClick={() => {
                    setActiveInputTab('voice');
                    toggleSpeechRecognition();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeInputTab === 'voice'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice</span>
                </button>

                <button
                  onClick={() => {
                    setActiveInputTab('video');
                    handleVideoUpload();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeInputTab === 'video'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </button>
              </div>

              {/* Text Area Header */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <label htmlFor="translate-input" className="font-medium text-slate-300">
                  Type or paste your sentence
                </label>
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Listening in {selectedLanguage}...
                  </span>
                )}
              </div>

              {/* Input Textarea with Character Counter */}
              <div className="relative">
                <textarea
                  id="translate-input"
                  rows={3}
                  maxLength={500}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTranslate();
                    }
                  }}
                  placeholder={
                    selectedLanguage === 'malayalam'
                      ? 'മലയാളത്തിൽ വാചകം ടൈപ്പ് ചെയ്യുക...'
                      : 'Enter text in English...'
                  }
                  className="w-full rounded-xl bg-[#080f24] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
                />

                {/* Character Count */}
                <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-mono">
                  {inputText.length}/500
                </div>
              </div>

              {/* Action Buttons: [Clear] & [Translate ->] */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  onClick={() => setInputText('')}
                  disabled={!inputText}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  onClick={() => handleTranslate()}
                  disabled={!inputText.trim() || isProcessing}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Translate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Dual Cards: Transcript & ISL Gloss placed directly under Input Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left flex-1 min-h-0 items-stretch">

              {/* TRANSCRIPT CARD */}
              <div className="p-3 rounded-2xl bg-[#0b132b]/90 border border-blue-950/60 flex flex-col justify-between shadow-lg h-full min-h-0">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>📑</span> Transcript
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyText(transcript || inputText, 'transcript')}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy Transcript"
                    >
                      {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={speakTranscript}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Listen Audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080f24] border border-slate-800 flex-1 min-h-0 overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans flex items-start">
                  {transcript || inputText || 'The student is reading a book.'}
                </div>
              </div>

              {/* ISL GLOSS CARD */}
              <div className="p-3 rounded-2xl bg-[#0b132b]/90 border border-blue-950/60 flex flex-col justify-between shadow-lg h-full min-h-0">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>🧬</span> ISL Gloss (Key Signs)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyText(gloss.join(' '), 'gloss')}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy Gloss"
                    >
                      {copiedGloss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080f24] border border-slate-800 flex-1 min-h-0 overflow-y-auto flex flex-wrap items-center content-start gap-1.5">
                  {gloss.length > 0 ? (
                    gloss.map((word, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/90 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wider font-mono shadow-sm hover:scale-105 transition-transform cursor-pointer"
                        title={`Sign gesture for ${word}`}
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">NO GLOSS LOADED</span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: ISL Avatar */}
          {/* ========================================================================= */}
          <div className="w-full lg:col-span-6 flex flex-col h-full min-h-0">

            {/* ISL AVATAR CARD */}
            <div
              ref={avatarContainerRef}
              className="rounded-2xl bg-[#0b132b]/90 border border-blue-950/60 shadow-xl overflow-hidden flex flex-col flex-1 h-full min-h-0 justify-between relative"
            >
              {/* Avatar Card Top Bar */}
              <div className="px-4 py-2.5 border-b border-blue-950/40 flex items-center justify-between bg-[#080f24]/80 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-200 tracking-wider">ISL Avatar</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                    3D Engine
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 3D AVATAR VIEWPORT */}
              <div className={`relative w-full h-[280px] sm:h-[340px] lg:h-full lg:flex-1 lg:min-h-0 overflow-hidden ${getBackgroundStyle()} flex items-center justify-center`}>

                {/* Studio radial lighting */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.3)_0%,transparent_70%)] pointer-events-none" />

                {/* 3D Interactive Avatar Render Model */}
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 p-8">
                      <div className="w-9 h-9 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <span className="text-xs font-medium">Loading 3D Avatar Engine...</span>
                    </div>
                  }
                >
                  <AvatarViewer
                    keypoints={sentenceKeypoints}
                    isPlaying={isPlaying}
                    frameIndex={frameIndex}
                    speed={speed}
                    onFrameAdvance={handleStepForward}
                    backgroundType={backgroundType}
                    hideControls={true}
                  />
                </Suspense>

                {/* Signing Gesture Indicator Overlay */}
                {isPlaying && (
                  <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-indigo-900/80 border border-indigo-500/40 text-xs font-medium text-white flex items-center gap-2 backdrop-blur-md shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    <span>Signing: {gloss[frameIndex % Math.max(1, gloss.length)] || 'Active'}</span>
                  </div>
                )}
              </div>

              {/* PLAYBACK CONTROLS BAR */}
              <div className="px-4 py-2.5 bg-[#080f24] border-t border-blue-950/40 flex items-center justify-between gap-3 shrink-0">

                {/* Playback Buttons: [↺ Replay] [▶ / ⏸ Play] */}
                <div className="flex items-center gap-3">

                  {/* Replay Button */}
                  <button
                    onClick={handleReplay}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-sm"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Replay</span>
                  </button>

                  {/* Primary Central Play/Pause Circular Gradient Button */}
                  <button
                    onClick={handlePlayPause}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                  </button>

                </div>

                {/* Speed Selector Dropdown */}
                <div className="relative" ref={speedPickerRef}>
                  <button
                    onClick={() => setSpeedPickerOpen(!speedPickerOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                  >
                    <span className="text-slate-400 font-normal">Speed</span>
                    <span>{speed}x</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {speedPickerOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-28 rounded-xl bg-[#0b132b] border border-slate-800 shadow-2xl p-1 z-50 text-xs">
                      {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSpeed(s as SpeedOption); setSpeedPickerOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg ${speed === s ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Matching Image 2) */}
      {/* ========================================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060A17]/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 flex items-center justify-around shadow-2xl">

        {/* Home */}
        <button
          onClick={() => { setActiveNav('translator'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center gap-1 ${activeNav === 'translator' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* History */}
        <button
          onClick={() => { setActiveNav('history'); setHistoryModalOpen(true); }}
          className={`flex flex-col items-center gap-1 ${activeNav === 'history' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">History</span>
        </button>

        {/* Center Elevated Floating Mic Button */}
        <div className="relative -top-5">
          <button
            onClick={() => {
              setActiveInputTab('voice');
              toggleSpeechRecognition();
            }}
            className={`w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 p-3.5 hover:scale-110 active:scale-95 transition-all ${isRecording ? 'animate-bounce ring-4 ring-rose-500/50' : ''
              }`}
            aria-label="Voice Input"
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>

        {/* Profile */}
        <button
          onClick={() => setProfileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 ${activeNav === 'profile' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>

      </nav>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OUT DRAWER */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-[#060A17] border-r border-slate-800 p-5 flex flex-col justify-between z-10 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/logo.png"
                    alt="SignifyEd Logo"
                    className="w-8 h-8 object-contain rounded-lg bg-white/95 p-0.5"
                  />
                  <span className="text-lg font-bold text-white">Signify<span className="text-blue-400">Ed</span></span>
                </div>
                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveNav('translator'); setMobileDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white"
                >
                  <Home className="w-4 h-4" /> <span>Translator</span>
                </button>
                <button
                  onClick={() => { setHistoryModalOpen(true); setMobileDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-900"
                >
                  <Clock className="w-4 h-4" /> <span>History</span>
                </button>
                <button
                  onClick={() => { setContactSupportOpen(true); setMobileDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-900"
                >
                  <HelpCircle className="w-4 h-4" /> <span>Help & Support</span>
                </button>
                <button
                  onClick={onBack}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" /> <span>Exit to Landing</span>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => { setContactSupportOpen(true); setMobileDrawerOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold text-center"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HISTORY MODAL */}
      {/* ========================================================================= */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Translation History</span>
              </h3>
              <button onClick={() => setHistoryModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {historyList.map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setInputText(item.text);
                    setTranscript(item.text);
                    setGloss(item.gloss);
                    setHistoryModalOpen(false);
                  }}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-white">{item.text}</span>
                    <span className="text-[10px]">{item.time}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.gloss.map((g, gi) => (
                      <span key={gi} className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/20 text-[10px] font-mono text-indigo-300">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTACT SUPPORT MODAL */}
      {/* ========================================================================= */}
      {contactSupportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-400" />
                <span>Contact Support</span>
              </h3>
              <button onClick={() => setContactSupportOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Have questions or feedback regarding our Indian Sign Language translation tool? We'd love to help!
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <p className="font-semibold text-white">Email Support</p>
                <p className="text-slate-400">support@signifyed.org</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <p className="font-semibold text-white">Institution & School Inquiries</p>
                <p className="text-slate-400">education@signifyed.org</p>
              </div>
            </div>
            <button
              onClick={() => setContactSupportOpen(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
