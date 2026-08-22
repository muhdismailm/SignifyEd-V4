import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Volume2,
  CheckCircle2,
  School,
  GraduationCap,
  Landmark,
  HeartHandshake,
  Users,
  MessageSquare,
  Mic,
  Cpu,
  HandMetal,
  UserCheck,
  Globe,
  HelpCircle,
  Mail,
  Send,
  Moon,
  Sun,
  Tv,
  BookOpen,
  Accessibility,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDemo: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function LandingPage({ onLaunchDemo, isDarkMode, onToggleTheme }: LandingPageProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const playGreetingAudio = () => {
    if ('speechSynthesis' in window) {
      setIsPlayingAudio(true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Namaste! Welcome to SignifyEd. Bridging communication and building inclusion through Indian Sign Language.");
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported on this browser.");
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-white selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-['Outfit']">
      {/* Background ambient lighting */}
      <div className="fixed top-[-150px] right-[-100px] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[45%] left-[25%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070B19]/80 border-b border-blue-900/25 px-4 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/images/logo.png"
              alt="SignifyEd Logo"
              className="w-10 h-10 object-contain rounded-xl bg-white/95 p-1 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Signify<span className="text-blue-400">Ed</span>
              </div>
            </div>
          </a>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-300">
            <a href="#home" className="text-blue-400 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-blue-400 after:rounded-full">
              Home
            </a>
            <a href="#how-it-works" className="hover:text-blue-300 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-blue-300 transition-colors">Features</a>
            <a href="#about-us" className="hover:text-blue-300 transition-colors">About Us</a>
            <a href="#faqs" className="hover:text-blue-300 transition-colors">FAQs</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Moon className="w-4 h-4 text-blue-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
            </button>

            <button
              onClick={onLaunchDemo}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Try SignifyEd</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="relative pt-12 pb-20 px-4 lg:px-12 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-medium backdrop-blur-md shadow-inner shadow-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI-Powered ISL Translation</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.18] tracking-tight text-white">
              Making Education Accessible with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 drop-shadow-sm">
                Indian Sign Language
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Convert speech, text, or videos into accurate Indian Sign Language using our advanced AI and 3D avatar technology.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchDemo}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-base shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/55 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2.5 group"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/70 text-slate-200 hover:text-white font-semibold text-base backdrop-blur-md hover:border-slate-600 transition-all flex items-center gap-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-white text-white translate-x-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Key Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Accurate</div>
                  <div className="text-xs text-slate-400">ISL Translation</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">3D Avatar</div>
                  <div className="text-xs text-slate-400">Visualization</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Instant</div>
                  <div className="text-xs text-slate-400">Real-time Results</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Visual (3D Avatar Studio Card) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[460px] aspect-[4/4.5] rounded-3xl overflow-hidden p-1 bg-gradient-to-b from-blue-500/30 via-indigo-600/20 to-transparent shadow-2xl shadow-indigo-950/60 border border-indigo-500/30 group">
              
              {/* Card Inner with studio background */}
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-gradient-to-b from-[#0e1c42] to-[#080f24] relative flex items-center justify-center">
                
                {/* Radial studio spotlight */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.35)_0%,transparent_75%)]" />

                {/* 3D Avatar Image */}
                <img
                  src="/images/hero_avatar.jpg"
                  alt="SignifyEd 3D ISL Avatar"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 relative z-10"
                />

                {/* Interactive Greeting Speech Bubble */}
                <div className="absolute top-6 right-6 z-20 max-w-[200px] p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-indigo-500/40 shadow-xl text-left animate-float">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-white">Namaste!</p>
                      <p className="text-[11px] text-slate-300 leading-snug">Welcome to SignifyEd</p>
                    </div>
                    <button
                      onClick={playGreetingAudio}
                      className={`p-1.5 rounded-lg border border-indigo-500/30 ${
                        isPlayingAudio ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-950/60 text-indigo-300 hover:text-white hover:bg-indigo-800/80'
                      } transition-colors`}
                      title="Listen to Greeting"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live Tag */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>3D ISL Engine Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TRUSTED INSTITUTIONS BAR */}
      <section className="border-y border-slate-800/60 bg-[#060a17]/90 py-8 px-4 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto text-center space-y-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Trusted by Students, Educators & Institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-slate-300 font-medium text-sm">
            <div className="flex items-center gap-2.5 hover:text-white transition-colors">
              <School className="w-5 h-5 text-blue-400" />
              <span>Schools</span>
            </div>
            <div className="flex items-center gap-2.5 hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <span>Colleges</span>
            </div>
            <div className="flex items-center gap-2.5 hover:text-white transition-colors">
              <Landmark className="w-5 h-5 text-purple-400" />
              <span>Universities</span>
            </div>
            <div className="flex items-center gap-2.5 hover:text-white transition-colors">
              <HeartHandshake className="w-5 h-5 text-rose-400" />
              <span>NGOs</span>
            </div>
            <div className="flex items-center gap-2.5 hover:text-white transition-colors">
              <Users className="w-5 h-5 text-teal-400" />
              <span>Lifelong Learners</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION: HOW SIGNIFYED WORKS */}
      <section id="how-it-works" className="py-24 px-4 lg:px-12 max-w-7xl mx-auto text-center relative z-10">
        <div className="space-y-3 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How SignifyEd <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Works</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Simple steps to bridge communication and build inclusion.
          </p>
        </div>

        {/* 5 Connected Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          
          {/* Step 1: Input */}
          <div className="relative group">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col items-center text-center h-full shadow-lg shadow-blue-950/20">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-950/80 mb-2">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Input</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use voice, text, or upload a video.
              </p>
            </div>
            {/* Desktop Connector Arrow */}
            <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-600 font-bold z-20">
              <ChevronRight className="w-5 h-5 text-blue-500/50" />
            </div>
          </div>

          {/* Step 2: Speech to Text */}
          <div className="relative group">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col items-center text-center h-full shadow-lg shadow-blue-950/20">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-mono font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-950/80 mb-2">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Speech to Text</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Audio is converted into accurate text.
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-600 font-bold z-20">
              <ChevronRight className="w-5 h-5 text-blue-500/50" />
            </div>
          </div>

          {/* Step 3: NLP Processing */}
          <div className="relative group">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col items-center text-center h-full shadow-lg shadow-blue-950/20">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-mono font-bold text-teal-400 px-2 py-0.5 rounded-full bg-teal-950/80 mb-2">03</div>
              <h3 className="text-lg font-bold text-white mb-2">NLP Processing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Text is processed and mapped to ISL gloss.
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-600 font-bold z-20">
              <ChevronRight className="w-5 h-5 text-blue-500/50" />
            </div>
          </div>

          {/* Step 4: ISL Translation */}
          <div className="relative group">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col items-center text-center h-full shadow-lg shadow-blue-950/20">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <HandMetal className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-950/80 mb-2">04</div>
              <h3 className="text-lg font-bold text-white mb-2">ISL Translation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Glosses are converted into ISL sequence.
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-600 font-bold z-20">
              <ChevronRight className="w-5 h-5 text-blue-500/50" />
            </div>
          </div>

          {/* Step 5: 3D Avatar Output */}
          <div className="relative group">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col items-center text-center h-full shadow-lg shadow-blue-950/20">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-mono font-bold text-purple-400 px-2 py-0.5 rounded-full bg-purple-950/80 mb-2">05</div>
              <h3 className="text-lg font-bold text-white mb-2">3D Avatar Output</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch the 3D avatar sign in ISL.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-4 lg:px-12 max-w-7xl mx-auto text-center relative z-10">
        <div className="space-y-3 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Powerful Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Everyone</span>
          </h2>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          {/* Card 1 */}
          <div className="p-7 rounded-2xl bg-[#0b132b]/80 border border-blue-900/30 hover:border-indigo-500/50 hover:bg-[#0e1a3a] transition-all duration-300 flex flex-col group shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multiple Input Modes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Speak, type, or upload videos — learn in the way you prefer.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-2xl bg-[#0b132b]/80 border border-blue-900/30 hover:border-emerald-500/50 hover:bg-[#0e1a3a] transition-all duration-300 flex flex-col group shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition-transform">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Realistic 3D Avatar</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              High quality avatar delivers natural and clear ISL signs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-2xl bg-[#0b132b]/80 border border-blue-900/30 hover:border-amber-500/50 hover:bg-[#0e1a3a] transition-all duration-300 flex flex-col group shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Educational Focused</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed especially for students and learning content.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-2xl bg-[#0b132b]/80 border border-blue-900/30 hover:border-blue-500/50 hover:bg-[#0e1a3a] transition-all duration-300 flex flex-col group shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-105 transition-transform">
              <Accessibility className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Accessible for All</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Built to support inclusivity and empower hearing-impaired.
            </p>
          </div>

        </div>
      </section>

      {/* CTA BANNER: LET'S BUILD AN INCLUSIVE FUTURE */}
      <section className="py-16 px-4 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0a1435] via-[#0d1b45] to-[#070f28] border border-indigo-500/30 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Left Visual Illustration */}
          <div className="w-full lg:w-1/3 flex justify-center items-center">
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-indigo-500/20 bg-slate-950/40 p-2 shadow-xl group">
              <img
                src="/images/books_cta.jpg"
                alt="Accessible Education with ISL"
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Text Content */}
          <div className="w-full lg:w-2/3 text-left space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Let's Build an Inclusive Future
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Join thousands of learners and educators who are making education accessible for everyone.
            </p>
            
            <div className="pt-2 space-y-3">
              <button
                onClick={onLaunchDemo}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-base shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 hover:scale-[1.03] active:scale-[0.98] transition-all inline-flex items-center gap-3"
              >
                <span>Start Translating Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Free to get started. No credit card required.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#040711] pt-16 pb-12 px-4 lg:px-12 relative z-10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="SignifyEd Logo"
                className="w-10 h-10 object-contain rounded-xl bg-white/95 p-1 shadow-lg shadow-blue-500/20"
              />
              <span className="text-xl font-bold text-white">Signify<span className="text-blue-400">Ed</span></span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Empowering deaf and hard-of-hearing students across India with real-time ISL translation.
            </p>
            <div className="flex items-center gap-3 text-slate-400 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-blue-500 transition-colors">
                <span className="text-xs font-bold">fb</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-pink-500 transition-colors">
                <span className="text-xs font-bold">ig</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-red-500 transition-colors">
                <span className="text-xs font-bold">yt</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-blue-400 transition-colors">
                <span className="text-xs font-bold">in</span>
              </a>
            </div>
          </div>

          {/* Product Col */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Product</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={onLaunchDemo} className="hover:text-blue-400 transition-colors">Translator</button></li>
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
              <li><a href="#faqs" className="hover:text-blue-400 transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Company Col */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#about-us" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Support Col */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Feedback</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Report an Issue</a></li>
            </ul>
          </div>

          {/* Stay Updated Col */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Stay Updated</h4>
            <p className="text-xs text-slate-400">
              Subscribe to our newsletter for updates and new features.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500 transition-colors">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  title="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {newsletterSubscribed && (
                <p className="text-[11px] text-emerald-400 font-medium">Thank you for subscribing!</p>
              )}
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SignifyEd. All rights reserved.</p>
          <p>Made for accessible Indian Sign Language education.</p>
        </div>
      </footer>

      {/* WATCH DEMO MODAL */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-indigo-500/30 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-400" />
                <span>SignifyEd Interactive Demo</span>
              </h3>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center">
              <img
                src="/images/hero_avatar.jpg"
                alt="Demo preview"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center space-y-3">
                <p className="text-white font-semibold text-sm">Experience live 3D avatar translation right now in our web app!</p>
                <button
                  onClick={() => {
                    setDemoModalOpen(false);
                    onLaunchDemo();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  Launch Live Translator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
