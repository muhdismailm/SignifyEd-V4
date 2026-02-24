import React from 'react';
import {
  Menu,
  Play,
  ChevronRight,
  Users,
  BookOpen,
  Award,
  Zap,
  Mic,
  Video,
  Cpu
} from 'lucide-react';
import DemoPage from './components/DemoPage';

function App() {
  const [showDemo, setShowDemo] = React.useState(false);

  if (showDemo) {
    return <DemoPage onBack={() => setShowDemo(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">

      {/* NAVIGATION */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-900" />
            </div>
            <span className="text-white text-xl font-bold">signifyEd</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-blue-100 hover:text-white">Features</a>
            <a href="#pipeline" className="text-blue-100 hover:text-white">Pipeline</a>
            <button
              onClick={() => setShowDemo(true)}
              className="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Launch Demo
            </button>
          </div>

          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              AI-Powered Indian Sign Language Translation
            </h1>

            <p className="text-lg text-blue-100 leading-relaxed max-w-2xl">
              signifyEd transforms speech and text into accurate Indian Sign Language 
              using Natural Language Processing and 3D Avatar Animation. 
              Designed to enhance accessibility for hearing- and speech-impaired learners.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowDemo(true)}
                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Start Translation</span>
              </button>

              <button
                onClick={() => setShowDemo(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition flex items-center justify-center space-x-2"
              >
                <ChevronRight className="w-5 h-5" />
                <span>View System</span>
              </button>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="flex justify-center relative">
            <div className="relative w-72 h-72">

              {/* Circular Animation Preview */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse"></div>
              <div className="absolute inset-6 rounded-full border-4 border-blue-300/50"></div>

              <div className="absolute inset-0 flex items-center justify-center text-white text-5xl">
                🤟
              </div>

              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-300/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="px-6 py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Core Capabilities
          </h2>
          <p className="text-blue-100 text-lg max-w-3xl mx-auto">
            A complete AI pipeline from speech recognition to 3D avatar rendering.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">

          <div className="bg-white/10 p-8 rounded-2xl">
            <Mic className="w-12 h-12 text-blue-300 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">
              Audio to Text
            </h3>
            <p className="text-blue-100">
              Converts speech input into structured textual data using speech recognition models.
            </p>
          </div>

          <div className="bg-white/10 p-8 rounded-2xl">
            <Cpu className="w-12 h-12 text-blue-300 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">
              NLP & ISL Gloss
            </h3>
            <p className="text-blue-100">
              Applies tokenization, POS tagging, lemmatization, and ISL grammar reordering.
            </p>
          </div>

          <div className="bg-white/10 p-8 rounded-2xl">
            <Video className="w-12 h-12 text-blue-300 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">
              3D Avatar Animation
            </h3>
            <p className="text-blue-100">
              Renders Indian Sign Language gestures using animated 3D avatars.
            </p>
          </div>
        </div>
      </section>

      {/* PIPELINE SECTION */}
      <section id="pipeline" className="px-6 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">
            System Workflow
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-center text-blue-100 font-medium space-y-6 md:space-y-0 md:space-x-4">
            <span>Speech / Text</span>
            <ChevronRight />
            <span>NLP Processing</span>
            <ChevronRight />
            <span>ISL Gloss</span>
            <ChevronRight />
            <span>Avatar Rendering</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12 border-t border-blue-800/30 text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-900" />
          </div>
          <span className="text-white text-xl font-bold">signifyEd</span>
        </div>

        <p className="text-blue-200 text-sm">
          © 2026 signifyEd • AI-Based ISL Translation System
        </p>
      </footer>
    </div>
  );
}

export default App;
