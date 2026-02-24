import { useState } from 'react';
import {
  Home,
  Upload,
  Mic,
  Send,
  BookOpen,
  Menu
} from 'lucide-react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface DemoPageProps {
  onBack: () => void;
  backendUrl: string;
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function DemoPage({ onBack }: DemoPageProps) {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [gloss, setGloss] = useState<string[]>([]);

  /* TEXT TO ISL */
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsProcessing(true);
    setGloss([]);
    setTranscript('');

    try {
      const res = await fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      const data = await res.json();

      if (data.error) {
        setTranscript(data.error);
      } else {
        setTranscript(data.original);
        setGloss(data.isl_gloss || []);
      }

    } catch {
      setTranscript('Error processing request.');
    }

    setIsProcessing(false);
    setMessage('');
  };

  /* VIDEO UPLOAD */
  const handleVideoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsProcessing(true);
      setGloss([]);
      setTranscript('');

      const formData = new FormData();
      formData.append('video', file);

      try {
        const res = await fetch('http://localhost:5000/upload_video', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (data.error) {
          setTranscript(data.error);
        } else {
          setTranscript(data.transcript);
          setGloss(data.isl_gloss || []);
        }

      } catch {
        setTranscript('Video upload failed.');
      }

      setIsProcessing(false);
    };

    input.click();
  };

  /* VOICE INPUT */
  const toggleRecording = () => {
    if (!SpeechRecognition) {
      alert('Speech recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setMessage(text);
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 text-white">

      {/* DRAWER */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900/95 backdrop-blur-lg border-r border-slate-700 p-6 transform ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-50`}
      >
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-indigo-400" />
            <span className="text-xl font-bold">signifyEd</span>
          </div>
          <button onClick={() => setIsDrawerOpen(false)}>✕</button>
        </div>

        <button
          onClick={onBack}
          className="flex items-center space-x-2 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500 transition w-full"
        >
          <Home size={18} />
          <span>Back</span>
        </button>
      </div>

      {/* MAIN */}
      <main className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="h-14 flex items-center px-6 bg-slate-900/40 border-b border-slate-700">
          <button onClick={() => setIsDrawerOpen(true)} className="mr-4">
            <Menu size={20} />
          </button>
          <span className="text-indigo-400 font-semibold">
            ISL Translation Demo
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">

          {/* LEFT PANEL */}
          <div className="flex flex-col bg-slate-900/60 border border-slate-700 rounded-2xl p-5">

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto space-y-6">

              {/* Transcript */}
              <div>
                <h3 className="text-indigo-400 font-semibold mb-2">Transcript</h3>
                <div className="bg-slate-800 p-3 rounded-lg h-32 overflow-y-auto text-sm">
                  {transcript || "Waiting for input..."}
                </div>
              </div>

              {/* Gloss */}
              <div>
                <h3 className="text-indigo-400 font-semibold mb-2">ISL Gloss</h3>
                <div className="bg-slate-800 p-3 rounded-lg h-40 overflow-y-auto flex flex-wrap gap-2">
                  {gloss.length > 0 ? (
                    gloss.map((word, index) => (
                      <span
                        key={index}
                        className="bg-indigo-600 px-2 py-1 rounded text-xs"
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">
                      Gloss will appear here...
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* FIXED INPUT SECTION */}
            <div className="pt-4 border-t border-slate-700 space-y-3">

              <button
                onClick={handleVideoUpload}
                disabled={isProcessing}
                className="w-full bg-indigo-600 py-2 rounded-lg hover:bg-indigo-500 transition"
              >
                <Upload className="inline mr-2" size={18} />
                Upload Video
              </button>

              <div className="flex space-x-2">

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type text to convert to ISL..."
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm"
                />

                <button
                  onClick={toggleRecording}
                  className={`px-3 rounded-lg ${
                    isRecording ? 'bg-red-500' : 'bg-slate-800 border border-slate-600'
                  }`}
                >
                  <Mic size={18} />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-green-600 px-3 rounded-lg"
                >
                  <Send size={18} />
                </button>

              </div>
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex items-center justify-center">
            <div className="text-center text-slate-400">
              🎬 Avatar Rendering Module
              <br />
              (3D ISL Animation Integration)
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
