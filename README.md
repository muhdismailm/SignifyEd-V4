# SignifyEd 🚀

**Indian Sign Language Translation for Everyone**

SignifyEd is an advanced, full-stack web application that translates English text, speech, and video into highly accurate Indian Sign Language (ISL) using Natural Language Processing (NLP) and 3D Avatar Animations. Built to make education and communication more accessible for hearing and speech-impaired learners.

![SignifyEd Demo](https://img.shields.io/badge/Status-Live-success?style=for-the-badge) ![React](https://img.shields.io/badge/Frontend-React%20%2B%20Three.js-61DAFB?style=for-the-badge&logo=react) ![Python](https://img.shields.io/badge/Backend-Python%20Flask-3776AB?style=for-the-badge&logo=python) ![AWS](https://img.shields.io/badge/Storage-AWS%20S3-FF9900?style=for-the-badge&logo=amazonaws)

---

## 🌟 Features
- **Real-Time Text to ISL**: Type any English sentence and instantly watch the 3D avatar sign it using accurate Indian Sign Language grammar.
- **Speech Recognition**: Speak directly into the microphone to have your voice translated into sign language in real-time.
- **3D Avatar & Skeleton Visualizer**: High-fidelity 3D human avatar powered by React Three Fiber, along with a technical skeleton visualizer for precise hand-tracking inspection.
- **Stateless Cloud Architecture**: Highly scalable architecture that pulls 3D motion keypoints instantly from AWS S3, requiring no local disk storage on the backend.
- **Smart NLP Pipeline**: Uses NLTK and custom grammatical rules to convert standard English syntax into correct ISL Gloss structures before animation.
- **Fully Mobile Responsive**: A beautifully crafted, responsive UI that works flawlessly on mobile devices, tablets, and desktops.

## 🛠️ Tech Stack
- **Frontend**: React.js, TypeScript, Vite, React Three Fiber (Three.js), Zustand
- **Backend**: Python 3, Flask, NLTK (Natural Language Toolkit), PyTorch, Gunicorn
- **Cloud Infrastructure**: 
  - **Vercel**: Global edge network hosting for the React frontend.
  - **Render**: Managed cloud platform running the Python/Flask backend.
  - **AWS S3**: Public cloud bucket storing massive datasets of 3D ISL keypoint animations.

## 🚀 Live Demo
The application is fully deployed and accessible here:
[SignifyEd Live Link](https://signifyed.vercel.app/)

## 📂 Architecture
1. **User Input**: User enters English text or speech on the Vercel-hosted frontend.
2. **NLP Processing**: The request is sent to the Render backend, where NLTK strips stopwords, lemmatizes words, and restructures the sentence into ISL grammar (Gloss).
3. **Keypoint Fetching**: The backend reaches out to the public AWS S3 bucket, retrieves the 3D animation keypoints (.json) for the specific words, and combines them into a seamless animation stream.
4. **3D Rendering**: The JSON stream is sent back to the frontend where React Three Fiber animates the Mixamo 3D Avatar bone-by-bone.

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/muhdismailm/SignifyEd-V4.git
cd SignifyEd-V4
```

### 2. Start the Frontend
```bash
npm install
npm run dev
```
*Runs on http://localhost:5173*

### 3. Start the Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # (Windows)
# source .venv/bin/activate # (Mac/Linux)
pip install -r requirements.txt
# Set SARVAM_API_KEY to enable Malayalam microphone input.
# PowerShell: $env:SARVAM_API_KEY = "your_sarvam_api_key"
python app.py
```
*Runs on http://localhost:5000*

### Malayalam voice input

Choose **Malayalam input** in the demo, then either type Malayalam or use the
microphone. While recording, the browser captures PCM audio locally and sends short
snapshots to the backend; Sarvam returns Malayalam text into the input field. Stop
recording, review or edit that text, and select Send. Sarvam then translates it to
English before the existing ISL gloss and avatar pipeline runs. Configure a
`SARVAM_API_KEY` environment variable; `backend/.env.example` lists the deployment
variables but is not loaded automatically by `python app.py`.

## 🎨 Design & Aesthetics
SignifyEd was built with a premium, dynamic interface. It features glassmorphism, smooth micro-animations, curated color palettes, and responsive grids that adapt perfectly to mobile screens.

## 📝 License
This project is for educational and accessibility purposes.
