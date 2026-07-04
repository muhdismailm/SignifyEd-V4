
// Inline styles for the teal/purple theme matching the reference image
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Outfit', sans-serif;
    background: #0d1f2d;
  }

  .app {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a1628 0%, #0d2d3a 40%, #0f1e35 70%, #0a1628 100%);
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient background blobs */
  .bg-blob-1 {
    position: fixed;
    top: -120px;
    right: -80px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(108, 62, 202, 0.25) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .bg-blob-2 {
    position: fixed;
    bottom: -100px;
    left: -60px;
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(0, 196, 204, 0.18) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .bg-blob-3 {
    position: fixed;
    top: 40%;
    left: 30%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(72, 149, 239, 0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* NAV */
  nav {
    position: relative;
    z-index: 10;
    padding: 20px 32px;
    border-bottom: 1px solid rgba(0, 196, 204, 0.12);
    backdrop-filter: blur(10px);
    background: rgba(10, 22, 40, 0.6);
  }

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #00c4cc, #6c3eca);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-text {
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .logo-text span {
    color: #00c4cc;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 36px;
  }

  .nav-links a {
    color: rgba(200, 230, 240, 0.75);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-links a:hover { color: #00c4cc; }

  .btn-primary {
    background: linear-gradient(135deg, #00c4cc, #6c3eca);
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }

  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.08);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-primary:hover::after { opacity: 1; }

  .btn-outline {
    background: transparent;
    color: #00c4cc;
    border: 1.5px solid rgba(0, 196, 204, 0.5);
    padding: 10px 24px;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-outline:hover {
    background: rgba(0, 196, 204, 0.1);
    border-color: #00c4cc;
  }

  /* HERO */
  .hero {
    position: relative;
    z-index: 1;
    padding: 80px 32px 100px;
  }

  .hero-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }

  @media (max-width: 900px) {
    .hero { padding: 40px 20px 60px; }
    .hero-inner { grid-template-columns: 1fr; gap: 32px; }
    .hero-desc { padding-right: 0; }
    .hero-visual { display: flex; transform: scale(0.85); margin-top: 10px; }
    .nav-links { display: none; }
  }

  @media (max-width: 480px) {
    .hero-visual { transform: scale(0.65); margin-top: -20px; }
    .hero { padding: 20px 16px 40px; }
    .hero-title { font-size: 2.2rem; }
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 196, 204, 0.1);
    border: 1px solid rgba(0, 196, 204, 0.3);
    color: #00c4cc;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }

  .hero-badge-dot {
    width: 7px;
    height: 7px;
    background: #00c4cc;
    border-radius: 50%;
    animation: pulse-dot 1.8s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .hero-title {
    font-size: clamp(2.2rem, 4vw, 3.6rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: 24px;
  }

  .hero-title .gradient-text {
    background: linear-gradient(90deg, #00c4cc, #6c3eca);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-desc {
    font-size: 1.1rem;
    color: rgba(180, 215, 230, 0.8);
    line-height: 1.75;
    margin-bottom: 36px;
    max-width: 520px;
  }

  .hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .btn-hero-primary {
    background: linear-gradient(135deg, #00c4cc 0%, #6c3eca 100%);
    color: #fff;
    border: none;
    padding: 14px 32px;
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 8px 32px rgba(0, 196, 204, 0.3);
  }

  .btn-hero-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 196, 204, 0.45);
  }

  .btn-hero-outline {
    background: rgba(255,255,255,0.04);
    color: rgba(200, 230, 240, 0.9);
    border: 1.5px solid rgba(255,255,255,0.15);
    padding: 14px 32px;
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .btn-hero-outline:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(0,196,204,0.4);
    color: #fff;
  }

  /* HERO VISUAL */
  .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .visual-card {
    position: relative;
    width: 340px;
    height: 340px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .visual-ring-outer {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid rgba(0, 196, 204, 0.3);
    animation: spin-slow 12s linear infinite;
  }

  .visual-ring-outer::before {
    content: '';
    position: absolute;
    top: -3px;
    left: 50%;
    width: 8px;
    height: 8px;
    background: #00c4cc;
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 12px #00c4cc;
  }

  .visual-ring-mid {
    position: absolute;
    inset: 30px;
    border-radius: 50%;
    border: 1.5px solid rgba(108, 62, 202, 0.3);
    animation: spin-slow 8s linear infinite reverse;
  }

  .visual-ring-mid::before {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 50%;
    width: 6px;
    height: 6px;
    background: #6c3eca;
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 10px #6c3eca;
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .visual-center {
    position: relative;
    z-index: 2;
    width: 160px;
    height: 160px;
    background: linear-gradient(135deg, rgba(0,196,204,0.15), rgba(108,62,202,0.15));
    border-radius: 50%;
    border: 1px solid rgba(0,196,204,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 60px rgba(0,196,204,0.15), inset 0 0 40px rgba(108,62,202,0.1);
    animation: float 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }

  /* floating chips */
  .chip {
    position: absolute;
    background: rgba(10, 22, 40, 0.85);
    border: 1px solid rgba(0,196,204,0.3);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #00c4cc;
    backdrop-filter: blur(8px);
    white-space: nowrap;
  }

  .chip-1 { top: 20px; right: -20px; animation: float 3.5s ease-in-out infinite; }
  .chip-2 { bottom: 30px; left: -30px; animation: float 4.2s ease-in-out infinite 0.5s; }
  .chip-3 { top: 50%; right: -50px; transform: translateY(-50%); animation: float 3.8s ease-in-out infinite 1s; color: #b388ff; border-color: rgba(108,62,202,0.4); }

  /* FEATURES */
  .features {
    position: relative;
    z-index: 1;
    padding: 80px 32px;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .section-label {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #00c4cc;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: clamp(1.8rem, 3vw, 2.8rem);
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
    margin-bottom: 16px;
  }

  .section-sub {
    color: rgba(180, 215, 230, 0.7);
    font-size: 1.05rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.7;
  }

  .section-header {
    text-align: center;
    margin-bottom: 56px;
  }

  .features-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  @media (max-width: 768px) {
    .features-grid { grid-template-columns: 1fr; }
  }

  .feature-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 36px 28px;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    position: relative;
    overflow: hidden;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00c4cc, transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .feature-card:hover {
    border-color: rgba(0,196,204,0.25);
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0,196,204,0.08);
  }

  .feature-card:hover::before { opacity: 1; }

  .feature-icon {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, rgba(0,196,204,0.15), rgba(108,62,202,0.15));
    border: 1px solid rgba(0,196,204,0.2);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    color: #00c4cc;
  }

  .feature-card:nth-child(2) .feature-icon {
    color: #b388ff;
    background: linear-gradient(135deg, rgba(108,62,202,0.15), rgba(0,196,204,0.1));
    border-color: rgba(108,62,202,0.25);
  }

  .feature-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }

  .feature-desc {
    color: rgba(180, 215, 230, 0.65);
    font-size: 0.95rem;
    line-height: 1.7;
  }

  /* PIPELINE */
  .pipeline {
    position: relative;
    z-index: 1;
    padding: 80px 32px;
  }

  .pipeline-inner {
    max-width: 900px;
    margin: 0 auto;
  }

  .pipeline-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0;
    margin-top: 48px;
  }

  .pipeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 130px;
  }

  .pipeline-dot {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    position: relative;
  }

  .pipeline-dot-1 { background: linear-gradient(135deg, #00c4cc22, #00c4cc44); border: 2px solid rgba(0,196,204,0.5); }
  .pipeline-dot-2 { background: linear-gradient(135deg, #6c3eca22, #6c3eca44); border: 2px solid rgba(108,62,202,0.5); }
  .pipeline-dot-3 { background: linear-gradient(135deg, #00c4cc22, #6c3eca33); border: 2px solid rgba(0,196,204,0.4); }
  .pipeline-dot-4 { background: linear-gradient(135deg, #6c3eca33, #6c3eca55); border: 2px solid rgba(108,62,202,0.6); }

  .pipeline-label {
    font-size: 0.88rem;
    font-weight: 600;
    color: rgba(200,230,240,0.8);
    text-align: center;
    font-family: 'Space Mono', monospace;
  }

  .pipeline-arrow {
    color: rgba(0,196,204,0.4);
    font-size: 1.3rem;
    flex-shrink: 0;
    padding: 0 4px;
    margin-bottom: 28px;
  }

  /* TEAM */
  .team {
    position: relative;
    z-index: 1;
    padding: 80px 32px;
    background: rgba(0,0,0,0.2);
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .team-grid {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  @media (max-width: 900px) {
    .team-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 500px) {
    .team-grid { grid-template-columns: 1fr; }
  }

  .team-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 32px 20px 28px;
    text-align: center;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    position: relative;
    overflow: hidden;
  }

  .team-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00c4cc, #6c3eca, transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .team-card:hover {
    border-color: rgba(0,196,204,0.2);
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(0,196,204,0.08);
  }

  .team-card:hover::after { opacity: 1; }

  .team-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    position: relative;
  }

  .team-avatar-ring {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00c4cc, #6c3eca);
    z-index: -1;
  }

  .team-avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(0,196,204,0.15), rgba(108,62,202,0.2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .team-name {
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }

  .team-role {
    font-size: 0.82rem;
    color: #00c4cc;
    font-weight: 600;
    letter-spacing: 0.03em;
    margin-bottom: 10px;
  }

  .team-desc {
    font-size: 0.85rem;
    color: rgba(180,215,230,0.55);
    line-height: 1.6;
  }

  /* FOOTER */
  footer {
    position: relative;
    z-index: 1;
    padding: 48px 32px;
    border-top: 1px solid rgba(255,255,255,0.06);
    text-align: center;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .footer-copy {
    color: rgba(180,215,230,0.4);
    font-size: 0.85rem;
  }
`;

// function App() {
//   const [showDemo, setShowDemo] = React.useState(false);

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="app">
//         {/* Ambient blobs */}
//         <div className="bg-blob-1" />
//         <div className="bg-blob-2" />
//         <div className="bg-blob-3" />

//         {/* NAV */}
//         <nav>
//           <div className="nav-inner">
//             <div className="logo">
//               <div className="logo-icon">
//                 <BookOpen size={18} color="#fff" />
//               </div>
//               <span className="logo-text">signify<span>Ed</span></span>
//             </div>

//             <div className="nav-links">
//               <a href="#features">Features</a>
//               <a href="#pipeline">Pipeline</a>
//               <button className="btn-primary" onClick={() => setShowDemo(true)}>
//                 Launch Demo
//               </button>
//             </div>
//           </div>
//         </nav>

//         {/* HERO */}
//         <section className="hero">
//           <div className="hero-inner">
//             <div>
//               <h1 className="hero-title">
//                 Indian Sign Language{' '}
//                 <span className="gradient-text">Translation</span>{' '}
//                 for Everyone
//               </h1>

//               <p className="hero-desc">
//                 signifyEd transforms speech and text into accurate Indian Sign Language
//                 using Natural Language Processing and 3D Avatar Animation —
//                 making education accessible for hearing- and speech-impaired learners.
//               </p>

//               <div className="hero-actions">
//                 <button className="btn-hero-outline" onClick={() => setShowDemo(true)}>
//                   <ChevronRight size={18} />
//                   View System
//                 </button>
//               </div>
//             </div>

//             {/* Visual */}
//             <div className="hero-visual">
//               <div className="visual-card">
//                 <div className="visual-ring-outer" />
//                 <div className="visual-ring-mid" />
//                 <div className="visual-center">🤟</div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* FEATURES */}
//         <section id="features" className="features">
//           <div className="section-header">
//             <div className="section-label">Capabilities</div>
//             <h2 className="section-title">Core Features</h2>
//             <p className="section-sub">
//               A complete AI pipeline from speech recognition to 3D avatar rendering.
//             </p>
//           </div>

//           <div className="features-grid">
//             <div className="feature-card">
//               <div className="feature-icon"><Mic size={24} /></div>
//               <div className="feature-title">Audio to Text</div>
//               <p className="feature-desc">
//                 Converts speech input into structured textual data using advanced speech recognition models.
//               </p>
//             </div>

//             <div className="feature-card">
//               <div className="feature-icon"><Cpu size={24} /></div>
//               <div className="feature-title">NLP & ISL Gloss</div>
//               <p className="feature-desc">
//                 Applies tokenization, POS tagging, lemmatization, and ISL grammar reordering for accurate output.
//               </p>
//             </div>

//             <div className="feature-card">
//               <div className="feature-icon"><Video size={24} /></div>
//               <div className="feature-title">3D Avatar Animation</div>
//               <p className="feature-desc">
//                 Renders Indian Sign Language gestures using fluid, lifelike animated 3D avatars.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* PIPELINE */}
//         <section id="pipeline" className="pipeline">
//           <div className="pipeline-inner">
//             <div className="section-header">
//               <div className="section-label">Workflow</div>
//               <h2 className="section-title">System Pipeline</h2>
//               <p className="section-sub">
//                 From raw input to signed output — every step is AI-driven.
//               </p>
//             </div>

//             <div className="pipeline-flow">
//               <div className="pipeline-step">
//                 <div className="pipeline-dot pipeline-dot-1">🎙️</div>
//                 <span className="pipeline-label">Speech / Text</span>
//               </div>
//               <div className="pipeline-arrow">›</div>
//               <div className="pipeline-step">
//                 <div className="pipeline-dot pipeline-dot-2">🧠</div>
//                 <span className="pipeline-label">NLP Processing</span>
//               </div>
//               <div className="pipeline-arrow">›</div>
//               <div className="pipeline-step">
//                 <div className="pipeline-dot pipeline-dot-3">📝</div>
//                 <span className="pipeline-label">ISL Gloss</span>
//               </div>
//               <div className="pipeline-arrow">›</div>
//               <div className="pipeline-step">
//                 <div className="pipeline-dot pipeline-dot-4">🤟</div>
//                 <span className="pipeline-label">Avatar Render</span>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* TEAM */}
//         <section className="team">
//           <div className="section-header">
//             <div className="section-label">People</div>
//             <h2 className="section-title">Meet the Team</h2>
//             <p className="section-sub">
//               The minds behind signifyEd — passionate about accessibility and inclusive technology.
//             </p>
//           </div>

//           <div className="team-grid">
//             {[
//               { emoji: '👩‍💻', name: 'Aanya Sharma', role: 'NLP Engineer', desc: 'Specializes in ISL grammar systems and linguistic modeling.' },
//               { emoji: '👨‍🎨', name: 'Rohan Mehta', role: 'UI/UX Designer', desc: 'Crafts accessible, intuitive interfaces for diverse users.' },
//               { emoji: '👩‍🔬', name: 'Priya Nair', role: 'ML Researcher', desc: 'Develops sign recognition and avatar animation pipelines.' },
//               { emoji: '👨‍💼', name: 'Arjun Das', role: 'Project Lead', desc: 'Drives vision, coordination, and stakeholder engagement.' },
//             ].map((member, i) => (
//               <div className="team-card" key={i}>
//                 <div className="team-avatar">
//                   <div className="team-avatar-ring" />
//                   <div className="team-avatar-inner">{member.emoji}</div>
//                 </div>
//                 <div className="team-name">{member.name}</div>
//                 <div className="team-role">{member.role}</div>
//                 <p className="team-desc">{member.desc}</p>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* FOOTER */}
//         <footer>
//           <div className="footer-logo">
//             <div className="logo-icon">
//               <BookOpen size={16} color="#fff" />
//             </div>
//             <span className="logo-text">signify<span>Ed</span></span>
//           </div>
//           <p className="footer-copy">© 2026 signifyEd · AI-Based ISL Translation System</p>
//         </footer>
//       </div>
//     </>
//   );
// }

// export default App;

import { useState } from 'react';
import {
  ChevronRight,
  BookOpen,
  Mic,
  Video,
  Cpu
} from 'lucide-react';
import DemoPage from './components/DemoPage';

const landingStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Outfit', sans-serif;
    background: #0d1f2d;
  }

  .app {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a1628 0%, #0d2d3a 40%, #0f1e35 70%, #0a1628 100%);
    position: relative;
    overflow-x: hidden;
  }

  .bg-blob-1 {
    position: fixed; top: -120px; right: -80px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(108, 62, 202, 0.25) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .bg-blob-2 {
    position: fixed; bottom: -100px; left: -60px;
    width: 450px; height: 450px;
    background: radial-gradient(circle, rgba(0, 196, 204, 0.18) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .bg-blob-3 {
    position: fixed; top: 40%; left: 30%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(72, 149, 239, 0.12) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* NAV */
  nav {
    position: relative; z-index: 10;
    padding: 20px 32px;
    border-bottom: 1px solid rgba(0, 196, 204, 0.12);
    backdrop-filter: blur(10px);
    background: rgba(10, 22, 40, 0.6);
  }
  .nav-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
  }
  .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #00c4cc, #6c3eca);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .logo-text { font-size: 1.3rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .logo-text span { color: #00c4cc; }
  .nav-links { display: flex; align-items: center; gap: 36px; }
  .nav-links a {
    color: rgba(200, 230, 240, 0.75); text-decoration: none;
    font-size: 0.95rem; font-weight: 500; transition: color 0.2s;
  }
  .nav-links a:hover { color: #00c4cc; }

  .btn-primary {
    background: linear-gradient(135deg, #00c4cc, #6c3eca);
    color: #fff; border: none;
    padding: 10px 24px; border-radius: 10px;
    font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; transition: opacity 0.2s, transform 0.2s;
    position: relative; overflow: hidden;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

  /* HERO */
  .hero { position: relative; z-index: 1; padding: 80px 32px 100px; }
  .hero-inner {
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 64px; align-items: center;
  }
  @media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; }
    .hero-visual { display: none; }
    .nav-links { display: none; }
  }
  .hero-title {
    font-size: clamp(2.2rem, 4vw, 3.6rem); font-weight: 800;
    color: #fff; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 24px;
  }
  .hero-title .gradient-text {
    background: linear-gradient(90deg, #00c4cc, #6c3eca);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hero-desc {
    font-size: 1.1rem; color: rgba(180, 215, 230, 0.8);
    line-height: 1.75; margin-bottom: 36px; max-width: 520px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-hero-outline {
    background: rgba(255,255,255,0.04); color: rgba(200, 230, 240, 0.9);
    border: 1.5px solid rgba(255,255,255,0.15);
    padding: 14px 32px; border-radius: 12px;
    font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
  }
  .btn-hero-outline:hover {
    background: rgba(255,255,255,0.08); border-color: rgba(0,196,204,0.4); color: #fff;
  }

  /* HERO VISUAL */
  .hero-visual { display: flex; justify-content: center; align-items: center; }
  .visual-card {
    position: relative; width: 340px; height: 340px;
    display: flex; align-items: center; justify-content: center;
  }
  .visual-ring-outer {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid rgba(0, 196, 204, 0.3);
    animation: spin-slow 12s linear infinite;
  }
  .visual-ring-outer::before {
    content: ''; position: absolute; top: -3px; left: 50%;
    width: 8px; height: 8px; background: #00c4cc; border-radius: 50%;
    transform: translateX(-50%); box-shadow: 0 0 12px #00c4cc;
  }
  .visual-ring-mid {
    position: absolute; inset: 30px; border-radius: 50%;
    border: 1.5px solid rgba(108, 62, 202, 0.3);
    animation: spin-slow 8s linear infinite reverse;
  }
  .visual-ring-mid::before {
    content: ''; position: absolute; bottom: -3px; left: 50%;
    width: 6px; height: 6px; background: #6c3eca; border-radius: 50%;
    transform: translateX(-50%); box-shadow: 0 0 10px #6c3eca;
  }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .visual-center {
    position: relative; z-index: 2; width: 160px; height: 160px;
    background: linear-gradient(135deg, rgba(0,196,204,0.15), rgba(108,62,202,0.15));
    border-radius: 50%; border: 1px solid rgba(0,196,204,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 5rem; backdrop-filter: blur(10px);
    box-shadow: 0 0 60px rgba(0,196,204,0.15), inset 0 0 40px rgba(108,62,202,0.1);
    animation: float 4s ease-in-out infinite;
  }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

  /* FEATURES */
  .features {
    position: relative; z-index: 1; padding: 80px 32px;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .section-label {
    font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #00c4cc; margin-bottom: 12px;
  }
  .section-title {
    font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 800;
    color: #fff; letter-spacing: -0.03em; margin-bottom: 16px;
  }
  .section-sub {
    color: rgba(180, 215, 230, 0.7); font-size: 1.05rem;
    max-width: 600px; margin: 0 auto; line-height: 1.7;
  }
  .section-header { text-align: center; margin-bottom: 56px; }
  .features-grid {
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }
  .feature-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px; padding: 36px 28px;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #00c4cc, transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .feature-card:hover { border-color: rgba(0,196,204,0.25); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,196,204,0.08); }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, rgba(0,196,204,0.15), rgba(108,62,202,0.15));
    border: 1px solid rgba(0,196,204,0.2); border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 24px; color: #00c4cc;
  }
  .feature-card:nth-child(2) .feature-icon {
    color: #b388ff;
    background: linear-gradient(135deg, rgba(108,62,202,0.15), rgba(0,196,204,0.1));
    border-color: rgba(108,62,202,0.25);
  }
  .feature-title { font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 12px; }
  .feature-desc { color: rgba(180, 215, 230, 0.65); font-size: 0.95rem; line-height: 1.7; }

  /* PIPELINE */
  .pipeline { position: relative; z-index: 1; padding: 80px 32px; }
  .pipeline-inner { max-width: 900px; margin: 0 auto; }
  .pipeline-flow {
    display: flex; align-items: center; justify-content: center;
    flex-wrap: wrap; gap: 0; margin-top: 48px;
  }
  .pipeline-step { display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; min-width: 130px; }
  .pipeline-dot {
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
  }
  .pipeline-dot-1 { background: linear-gradient(135deg, #00c4cc22, #00c4cc44); border: 2px solid rgba(0,196,204,0.5); }
  .pipeline-dot-2 { background: linear-gradient(135deg, #6c3eca22, #6c3eca44); border: 2px solid rgba(108,62,202,0.5); }
  .pipeline-dot-3 { background: linear-gradient(135deg, #00c4cc22, #6c3eca33); border: 2px solid rgba(0,196,204,0.4); }
  .pipeline-dot-4 { background: linear-gradient(135deg, #6c3eca33, #6c3eca55); border: 2px solid rgba(108,62,202,0.6); }
  .pipeline-label { font-size: 0.88rem; font-weight: 600; color: rgba(200,230,240,0.8); text-align: center; font-family: 'Space Mono', monospace; }
  .pipeline-arrow { color: rgba(0,196,204,0.4); font-size: 1.3rem; flex-shrink: 0; padding: 0 4px; margin-bottom: 28px; }

  /* TEAM */
  .team {
    position: relative; z-index: 1; padding: 80px 32px;
    background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05);
  }
  .team-grid {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  }
  @media (max-width: 900px) { .team-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .team-grid { grid-template-columns: 1fr; } }
  .team-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px; padding: 32px 20px 28px; text-align: center;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    position: relative; overflow: hidden;
  }
  .team-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #00c4cc, #6c3eca, transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .team-card:hover { border-color: rgba(0,196,204,0.2); transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,196,204,0.08); }
  .team-card:hover::after { opacity: 1; }
  .team-avatar { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; position: relative; }
  .team-avatar-ring { position: absolute; inset: -3px; border-radius: 50%; background: linear-gradient(135deg, #00c4cc, #6c3eca); z-index: -1; }
  .team-avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, rgba(0,196,204,0.15), rgba(108,62,202,0.2)); display: flex; align-items: center; justify-content: center; font-size: 2rem; }
  .team-name { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .team-role { font-size: 0.82rem; color: #00c4cc; font-weight: 600; letter-spacing: 0.03em; margin-bottom: 10px; }
  .team-desc { font-size: 0.85rem; color: rgba(180,215,230,0.55); line-height: 1.6; }

  /* FOOTER */
  footer {
    position: relative; z-index: 1; padding: 48px 32px;
    border-top: 1px solid rgba(255,255,255,0.06); text-align: center;
  }
  .footer-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px; }
  .footer-copy { color: rgba(180,215,230,0.4); font-size: 0.85rem; }
`;

type Page = 'home' | 'demo';

function App() {
  const [page, setPage] = useState<Page>('home');

  

  // Render DemoPage when page === 'demo'
  if (page === 'demo') {
    return (
      <DemoPage
        onBack={() => setPage('home')}
        backendUrl={import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}
      />
    );
  }

  // Render landing page when page === 'home'
  return (
    <>
      <style>{landingStyles}</style>
      <div className="app">
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        <div className="bg-blob-3" />

        {/* NAV */}
        <nav>
          <div className="nav-inner">
            <div className="logo">
              <div className="logo-icon">
                <BookOpen size={18} color="#fff" />
              </div>
              <span className="logo-text">signify<span>Ed</span></span>
            </div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#pipeline">Pipeline</a>
              <button className="btn-primary" onClick={() => setPage('demo')}>
                Launch
              </button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-inner">
            <div>
              <h1 className="hero-title">
                Indian Sign Language{' '}
                <span className="gradient-text">Translation</span>{' '}
                for Everyone
              </h1>
              <p className="hero-desc">
                SignifyEd transforms video,speech and text into accurate Indian Sign Language
                using Natural Language Processing and 3D Avatar Animation. Which
                makes education accessible for hearing and speech-impaired learners.
              </p>
              <div className="hero-actions">
                <button className="btn-hero-outline" onClick={() => {
                  console.log("clicked");
                  setPage('demo')}}>
                  <ChevronRight size={18} />
                  View System
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-card">
                <div className="visual-ring-outer" />
                <div className="visual-ring-mid" />
                <div className="visual-center">🤟</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="features">
          <div className="section-header">
            <div className="section-label">Capabilities</div>
            <h2 className="section-title">Core Features</h2>
            <p className="section-sub">
              A complete AI pipeline from speech recognition to 3D avatar rendering.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Mic size={24} /></div>
              <div className="feature-title">Audio / Video to Text</div>
              <p className="feature-desc">Converts speech or video input into structured textual data using advanced speech recognition models.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Cpu size={24} /></div>
              <div className="feature-title">NLP & ISL Gloss</div>
              <p className="feature-desc">Applies tokenization, POS tagging, lemmatization, and ISL grammar reordering for accurate output.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Video size={24} /></div>
              <div className="feature-title">3D Avatar Animation</div>
              <p className="feature-desc">Renders Indian Sign Language gestures using fluid, lifelike animated 3D avatars.</p>
            </div>
          </div>
        </section>

        {/* PIPELINE */}
        <section id="pipeline" className="pipeline">
          <div className="pipeline-inner">
            <div className="section-header">
              <div className="section-label">Workflow</div>
              <h2 className="section-title">System Pipeline</h2>
              <p className="section-sub">From raw input to signed output </p>
            </div>
            <div className="pipeline-flow">
              <div className="pipeline-step">
                <div className="pipeline-dot pipeline-dot-1">🎙️</div>
                <span className="pipeline-label">Speech / Text / Video</span>
              </div>
              <div className="pipeline-arrow">›</div>
              <div className="pipeline-step">
                <div className="pipeline-dot pipeline-dot-2">🧠</div>
                <span className="pipeline-label">NLP Processing</span>
              </div>
              <div className="pipeline-arrow">›</div>
              <div className="pipeline-step">
                <div className="pipeline-dot pipeline-dot-3">📝</div>
                <span className="pipeline-label">ISL Gloss</span>
              </div>
              <div className="pipeline-arrow">›</div>
              <div className="pipeline-step">
                <div className="pipeline-dot pipeline-dot-4">🤟</div>
                <span className="pipeline-label">Avatar Render</span>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="team">
          <div className="section-header">
            <div className="section-label">People</div>
            <h2 className="section-title">Meet the Team</h2>
            <p className="section-sub">
              The minds behind signifyEd 
            </p>
          </div>
          <div className="team-grid">
            {[
              { emoji: '👩‍💻', name: 'Fathima Varsha',  role: 'Developer' },
              { emoji: '👩‍💻', name: 'Neha Meharin',   role: 'Developer'},
              { emoji: '👩‍💻', name: 'Neha TK',    role: 'Developer'},
              { emoji: '👨‍💼', name: 'Muhammed Ismail M',     role: 'Developer' },
            ].map((member, i) => (
              <div className="team-card" key={i}>
                <div className="team-avatar">
                  <div className="team-avatar-ring" />
                  <div className="team-avatar-inner">{member.emoji}</div>
                </div>
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                <p className="team-desc">{member.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">
            <div className="logo-icon">
              <BookOpen size={16} color="#fff" />
            </div>
            <span className="logo-text">signify<span>Ed</span></span>
          </div>
          <p className="footer-copy">© 2026 signifyEd · AI-Based ISL Translation System</p>
        </footer>
      </div>
    </>
  );
}

export default App;