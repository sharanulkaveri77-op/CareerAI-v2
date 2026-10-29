# CareerAI — AI-Powered Career Intelligence & Mock Interview Platform

> 🚀 **Live Demo:** [https://careerai-v2.vercel.app](https://careerai-v2.vercel.app)  
> 💻 **GitHub Repository:** [https://github.com/sharanulkaveri77-op/CareerAI-v2](https://github.com/sharanulkaveri77-op/CareerAI-v2)

CareerAI is a next-generation career intelligence platform featuring **CAREERAI** — an interactive multimodal AI interviewer with live computer vision, continuous neural voice synthesis, and real-time speech recognition.

---

## 🌟 Key Highlights & Modules

### 🎙️ 1. CAREERAI Live Multimodal Interview Studio (`/interview`)
- **Executive 2-Column Studio Layout**:
  - **Left Stage**: Full-height high-definition camera feed with face tracking, eye contact centering, and real-time frame FPS telemetry.
  - **Right Stage (Interactive HUD Stack)**:
    - **Card 1 — 3D Hologram Core & Voice HUD**: Interactive 3D rotating visualizer, speech state badges (`LISTENING`, `USER_SPEAKING`, `AI_SPEAKING`, `AI_THINKING`), and instant *"Talk with CAREERAI"* microphone activation.
    - **Card 2 — Recent History & Dialogue Log**: Live conversational transcripts displaying candidate turns (`SHARANU`) and AI feedback with word count, vocal pacing (WPM), and audio replay controls.
    - **Card 3 — System Telemetry**: Real-time hardware status indicators for camera, microphone VU levels, audio speaker test, and network latency.
- **Continuous Voice Interaction**:
  - Re-architected Web Speech recognition pipeline with native `en-IN` / `en-US` locale detection for high-accuracy speech transcription without cut-offs.
  - Conversational 1.6s natural speech debounce + instant *"Submit Answer Now"* controls.
  - Echo guard preventing AI speech playback from triggering false mic input.
- **Gemini AI Conversational Engine (`gemini-3.1-flash-lite`)**:
  - Live, low-latency (< 800ms) conversational AI answering candidate questions directly (e.g. *"What is HTML?"*, *"What is a database?"*, *"Explain React Hooks"*).
  - **Progressive Difficulty Ladder**:
    - **Basic (Q1–Q2)**: Core fundamentals, definitions, and building blocks.
    - **Medium (Q3–Q4)**: Practical architecture, state management, and database queries.
    - **Difficult (Q5+)**: High-scale distributed design, concurrency, and performance trade-offs.

### 📊 2. Career Health & Dashboard (`/dashboard`)
- Real-time readiness scoring, skill distribution, and market trend tracking.
- Personalized milestone roadmaps with target roles (Full Stack Engineer, Frontend Engineer, AI Engineer, etc.).

### 🤖 3. Career Advisor (`/advisor`)
- AI conversational advisor providing role guidance, resume optimization strategies, and interview preparation plans.

### 📝 4. Intelligent Resume Builder & ATS Scanner (`/resume`)
- In-browser PDF & DOCX resume parsing and analysis.
- Real-time ATS match scoring, missing keyword recommendations, and formatting feedback.

### 💡 5. Skill Assessment & Roadmaps (`/skills`, `/roadmap`)
- Interactive skill mastery quizzes and structured step-by-step career roadmaps.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, Vite 5, React Router v6
- **Styling & UI**: Tailwind CSS (Executive Dark Cybernetic Theme), Lucide React
- **Visualizations**: Recharts, Canvas 2D/3D Wireframe Visualizers
- **AI & Speech**:
  - Google Gemini AI (`gemini-3.1-flash-lite`)
  - Web Speech API (SpeechRecognition & SpeechSynthesis)
  - Web Audio API (Frequency Analyser & VU Meter)
- **Database & Auth**: Supabase / REST Backend Integration
- **Deployment**: Vercel (Auto-CI/CD linked to GitHub `main`)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ installed on your machine
- Modern Chromium browser (Chrome or Edge recommended for Web Speech recognition)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sharanulkaveri77-op/CareerAI-v2.git
cd CareerAI-v2

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env

# 4. Start the local development server
npm run dev
```

The app will start locally at **`http://localhost:5174/`** (or `http://localhost:5173/`).

### Production Build

```bash
npm run build
npm run preview
```

---

## 🌐 Live Deployment & Demo Link

- **Production URL**: [https://careerai-v2.vercel.app](https://careerai-v2.vercel.app)
- Every push to the `main` branch automatically deploys to Vercel with zero downtime.

---

## 👤 Author & Candidate Profile

- **Candidate Name**: Sharanu
- **Target Role**: Full Stack Engineer
- **Platform**: CareerAI v2
