

import { Suspense, useState } from 'react';
import { Home, Upload, Mic, Send, BookOpen, Menu, X } from 'lucide-react';
import React from 'react';
// import AvatarViewer from './AvatarViewer';
const AvatarViewer = React.lazy(() => import("./AvatarViewer"));

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export interface DemoPageProps {
  onBack: () => void;
  backendUrl: string;
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  .demo-root {
    font-family: 'Outfit', sans-serif;
    height: 100vh; width: 100vw;
    display: flex; overflow: hidden;
    background: linear-gradient(135deg, #0a1628 0%, #0d2d3a 40%, #0f1e35 70%, #0a1628 100%);
    color: #fff; position: relative;
  }
  .demo-blob-1 {
    position: fixed; top: -100px; right: -80px; width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(108,62,202,0.2) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .demo-blob-2 {
    position: fixed; bottom: -80px; left: -60px; width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(0,196,204,0.15) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .drawer {
    position: fixed; top: 0; bottom: 0; left: 0; width: 260px;
    background: rgba(8,18,34,0.97); backdrop-filter: blur(16px);
    border-right: 1px solid rgba(0,196,204,0.12); padding: 28px 24px;
    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    z-index: 50; display: flex; flex-direction: column; gap: 28px;
  }
  .drawer.open { transform: translateX(0); }
  .drawer-header { display: flex; align-items: center; justify-content: space-between; }
  .drawer-logo { display: flex; align-items: center; gap: 10px; }
  .drawer-logo-icon {
    width: 32px; height: 32px; background: linear-gradient(135deg, #00c4cc, #6c3eca);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
  }
  .drawer-logo-text { font-size: 1.15rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .drawer-logo-text span { color: #00c4cc; }
  .drawer-close {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(200,230,240,0.7); width: 30px; height: 30px; border-radius: 8px;
    cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;
  }
  .drawer-close:hover { background: rgba(255,255,255,0.1); }
  .drawer-back-btn {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, rgba(0,196,204,0.12), rgba(108,62,202,0.12));
    border: 1px solid rgba(0,196,204,0.25); color: #00c4cc;
    padding: 10px 16px; border-radius: 10px;
    font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; width: 100%;
  }
  .drawer-back-btn:hover {
    background: linear-gradient(135deg, rgba(0,196,204,0.2), rgba(108,62,202,0.2));
    border-color: rgba(0,196,204,0.45);
  }
  .demo-main { flex: 1; display: flex; flex-direction: column; position: relative; z-index: 1; overflow: hidden; }
  .topbar {
    height: 56px; display: flex; align-items: center; padding: 0 24px;
    background: rgba(8,18,34,0.6); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,196,204,0.1); gap: 14px; flex-shrink: 0;
  }
  .menu-btn {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    color: rgba(200,230,240,0.8); width: 34px; height: 34px; border-radius: 8px;
    cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  }
  .menu-btn:hover { background: rgba(0,196,204,0.1); border-color: rgba(0,196,204,0.3); color: #00c4cc; }
  .topbar-title { font-size: 0.95rem; font-weight: 600; color: #00c4cc; letter-spacing: 0.01em; }
  .topbar-dot {
    width: 7px; height: 7px; background: #00c4cc; border-radius: 50%; margin-left: auto;
    box-shadow: 0 0 8px #00c4cc; animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  .content-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; overflow: hidden; }
  @media (max-width: 900px) { 
    .demo-root { height: 100dvh; }
    .content-grid { display: flex; flex-direction: column; overflow-y: auto; padding: 16px; gap: 20px; }
    .panel { height: auto; overflow: visible; flex: none; }
    .panel-body { overflow: visible; flex: none; gap: 12px; }
    .transcript-box, .gloss-box { min-height: 60px; max-height: none; height: auto; }
    .avatar-panel { height: auto; min-height: unset; flex: none; overflow: visible; }
    .avatar-panel-body { overflow: visible; }
  }
  .panel {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; position: relative;
  }
  .panel::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg,transparent,rgba(0,196,204,0.4),transparent);
  }
  .panel-body { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:20px; }
  .panel-body::-webkit-scrollbar{width:4px}
  .panel-body::-webkit-scrollbar-track{background:transparent}
  .panel-body::-webkit-scrollbar-thumb{background:rgba(0,196,204,0.2);border-radius:2px}
  .field-label {
    font-size:0.78rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
    color:#00c4cc; margin-bottom:8px; font-family:'Space Mono',monospace;
  }
  .transcript-box {
    background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); border-radius:12px;
    padding:14px; min-height:100px; max-height:130px; overflow-y:auto;
    font-size:0.9rem; color:rgba(200,230,240,0.75); line-height:1.6;
  }
  .gloss-box {
    background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); border-radius:12px;
    padding:14px; min-height:110px; max-height:150px; overflow-y:auto;
    display:flex; flex-wrap:wrap; gap:8px; align-content:flex-start;
  }
  .gloss-tag {
    background:linear-gradient(135deg,rgba(0,196,204,0.2),rgba(108,62,202,0.2));
    border:1px solid rgba(0,196,204,0.3); color:#00c4cc;
    padding:4px 12px; border-radius:100px; font-size:0.78rem; font-weight:600; font-family:'Space Mono',monospace;
  }
  .gloss-empty{color:rgba(180,215,230,0.3);font-size:0.88rem}
  .input-area {
    padding:16px 20px; border-top:1px solid rgba(255,255,255,0.06);
    display:flex; flex-direction:column; gap:12px; flex-shrink:0; background:rgba(0,0,0,0.15);
  }
  .upload-btn {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(0,196,204,0.25);
    color:rgba(200,230,240,0.85); padding:10px; border-radius:10px;
    font-family:'Outfit',sans-serif; font-size:0.9rem; font-weight:600; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;
  }
  .upload-btn:hover:not(:disabled){background:rgba(0,196,204,0.1);border-color:rgba(0,196,204,0.5);color:#00c4cc}
  .upload-btn:disabled{opacity:0.4;cursor:not-allowed}
  .input-row{display:flex;gap:8px}
  .text-input {
    flex:1; min-width:0; padding:10px 14px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08);
    border-radius:10px; color:#fff; font-family:'Outfit',sans-serif; font-size:0.9rem; outline:none; transition:border-color 0.2s;
  }
  .text-input::placeholder{color:rgba(180,215,230,0.3)}
  .text-input:focus{border-color:rgba(0,196,204,0.4)}
  .text-input:disabled{opacity:0.4}
  .icon-btn {
    width:40px; height:40px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);
    background:rgba(0,0,0,0.25); color:rgba(200,230,240,0.7); cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0;
  }
  .icon-btn:hover{background:rgba(255,255,255,0.06);border-color:rgba(0,196,204,0.3);color:#00c4cc}
  .icon-btn.recording{background:rgba(239,68,68,0.2);border-color:rgba(239,68,68,0.5);color:#f87171;animation:rec-pulse 1s ease-in-out infinite}
  @keyframes rec-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0)}}
  .send-btn {
    width:40px; height:40px; border-radius:10px; border:none;
    background:linear-gradient(135deg,#00c4cc,#6c3eca); color:#fff; cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0;
    box-shadow:0 4px 16px rgba(0,196,204,0.25);
  }
  .send-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,196,204,0.4)}
  .send-btn:disabled{opacity:0.35;cursor:not-allowed;transform:none;box-shadow:none}
  .avatar-panel {
    background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07);
    border-radius:18px; overflow:hidden; display:flex; flex-direction:column; position:relative;
  }
  .avatar-panel::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(108,62,202,0.5),transparent);
  }
  .avatar-panel-header {
    padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.05);
    display:flex; align-items:center; flex-shrink:0;
  }
  .avatar-panel-title{font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#b388ff;font-family:'Space Mono',monospace}
  .avatar-panel-body{flex:1;overflow:hidden}
  .processing-overlay {
    position:fixed; inset:0; background:rgba(5,12,25,0.75); backdrop-filter:blur(6px);
    display:flex; align-items:center; justify-content:center; z-index:100;
  }
  .spinner-wrap {
    display:flex; flex-direction:column; align-items:center; gap:16px;
    background:rgba(10,22,40,0.9); border:1px solid rgba(0,196,204,0.2); border-radius:20px; padding:36px 48px;
  }
  .spinner{width:52px;height:52px;border:3px solid rgba(0,196,204,0.15);border-top-color:#00c4cc;border-radius:50%;animation:spin 0.8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spinner-label{font-size:0.9rem;font-weight:600;color:rgba(200,230,240,0.7);font-family:'Space Mono',monospace;letter-spacing:0.05em}

  @media (max-width: 480px) {
    .drawer { width: 85vw; max-width: 280px; padding: 24px 20px; }
    .topbar { padding: 0 16px; height: 50px; }
    .content-grid { padding: 12px; gap: 16px; }
    .panel-body { padding: 16px; gap: 16px; }
    .input-area { padding: 16px; }
    .input-row { flex-wrap: wrap; gap: 8px; }
    .text-input { flex: 1 1 100%; min-height: 44px; }
    .icon-btn, .send-btn { flex: 1; height: 44px; }
    .upload-btn { height: 44px; }
    .avatar-panel { min-height: 300px; }
  }
`;

export default function DemoPage({ onBack, backendUrl }: DemoPageProps) {
  const [isDrawerOpen, setIsDrawerOpen]           = useState(false);
  const [message, setMessage]                     = useState('');
  const [isRecording, setIsRecording]             = useState(false);
  const [isProcessing, setIsProcessing]           = useState(false);
  const [transcript, setTranscript]               = useState('');
  const [gloss, setGloss]                         = useState<string[]>([]);
  const [sentenceKeypoints, setSentenceKeypoints] = useState<any[]>([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setIsProcessing(true);
    setGloss([]); setTranscript(''); setSentenceKeypoints([]);
    try {
      const res  = await fetch(`${backendUrl}/process`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
      const data = await res.json();
      if (data.error) { setTranscript(data.error); }
      else {
        setTranscript(data.original);
        setGloss(data.isl_gloss || []);
        if (data.combined_keypoints_data) {
          setSentenceKeypoints(data.combined_keypoints_data.sentence_keypoints || []);
        }
      }
    } catch { setTranscript('Error processing request.'); }
    setIsProcessing(false); setMessage('');
  };

  const handleVideoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsProcessing(true);
      setGloss([]); setTranscript(''); setSentenceKeypoints([]);
      const formData = new FormData();
      formData.append('video', file);
      try {
        const res  = await fetch(`${backendUrl}/upload_video`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.error) { setTranscript(data.error); }
        else {
          setTranscript(data.transcript);
          setGloss(data.isl_gloss || []);
          if (data.combined_keypoints_data) {
            setSentenceKeypoints(data.combined_keypoints_data.sentence_keypoints || []);
          }
        }
      } catch { setTranscript('Video upload failed.'); }
      setIsProcessing(false);
    };
    input.click();
  };

  const toggleRecording = () => {
    if (!SpeechRecognition) { alert('Speech recognition not supported.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang  = 'en-US';
    setIsRecording(true);
    recognition.start();
    recognition.onresult = (event: any) => { setMessage(event.results[0][0].transcript); setIsRecording(false); };
    recognition.onerror  = () => setIsRecording(false);
    recognition.onend    = () => setIsRecording(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="demo-root">
        <div className="demo-blob-1" />
        <div className="demo-blob-2" />

        {/* DRAWER */}
        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <div className="drawer-logo">
              <div className="drawer-logo-icon"><BookOpen size={16} color="#fff" /></div>
              <span className="drawer-logo-text">signify<span>Ed</span></span>
            </div>
            <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}>
              <X size={14} />
            </button>
          </div>
          <button className="drawer-back-btn" onClick={onBack}>
            <Home size={16} /> Back to Home
          </button>
        </div>

        {/* MAIN */}
        <main className="demo-main">
          <div className="topbar">
            <button className="menu-btn" onClick={() => setIsDrawerOpen(true)}><Menu size={16} /></button>
            <span className="topbar-title">SignifyEd</span>
            <div className="topbar-dot" />
          </div>

          <div className="content-grid">
            {/* LEFT PANEL */}
            <div className="panel">
              <div className="panel-body">
                <div>
                  <div className="field-label">Transcript</div>
                  <div className="transcript-box">{transcript || 'Waiting for input…'}</div>
                </div>
                <div>
                  <div className="field-label">ISL Gloss</div>
                  <div className="gloss-box">
                    {gloss.length > 0
                      ? gloss.map((word, i) => <span key={i} className="gloss-tag">{word}</span>)
                      : <span className="gloss-empty">Gloss will appear here…</span>}
                  </div>
                </div>
              </div>
              <div className="input-area">
                <button className="upload-btn" onClick={handleVideoUpload} disabled={isProcessing}>
                  <Upload size={16} /> Upload Video
                </button>
                <div className="input-row">
                  <input
                    className="text-input" type="text" value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type text to convert to ISL…" disabled={isProcessing}
                  />
                  <button className={`icon-btn ${isRecording ? 'recording' : ''}`} onClick={toggleRecording}>
                    <Mic size={16} />
                  </button>
                  <button className="send-btn" onClick={handleSendMessage} disabled={!message.trim() || isProcessing}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="avatar-panel">
              <div className="avatar-panel-header">
                <span className="avatar-panel-title">Avatar Viewer</span>
              </div>
              <div className="avatar-panel-body">
                <Suspense fallback={<div>Loading Avatar...</div>}>
                  <AvatarViewer keypoints={sentenceKeypoints} />
                </Suspense>
              </div>
            </div>
          </div>
        </main>

        {isProcessing && (
          <div className="processing-overlay">
            <div className="spinner-wrap">
              <div className="spinner" />
              <span className="spinner-label">Processing…</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}