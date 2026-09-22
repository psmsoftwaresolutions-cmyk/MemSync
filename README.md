# MemSync: Edge-Orchestrated Habit & Workflow Copilot

> **Zero Cloud Leakage • 100% On-Device Privacy • Tiny Habits Protocol • Local Vector Index**

MemSync is a local-first, privacy-preserving productivity engine designed for engineers, researchers, and knowledge workers. It bridges unstructured workspace artifacts (markdown notes, brain dumps, terminal logs) with deterministic behavioral habit loops (cues, low-friction micro-actions, and streak tracking) and semantic memory retrieval—running entirely on edge hardware.

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------+
|                      Client UI                              |
|           (React + Vite, Minimalist Dark Theme)             |
|   - Context Stream Capture Hub                              |
|   - Habit Flow & Anchor Tracker                             |
|   - Daily Action Queue                                      |
|   - Standup & Sprint Recap                                  |
|   - Edge Vector Memory Search                               |
+------------------------------+------------------------------+
                               | REST API (Localhost:3001)
+------------------------------v------------------------------+
|                   MemSync Core Engine (Node.js)             |
|  +-------------------------------------------------------+  |
|  | Context Parsing & Habit State Machine Engine           |  |
|  +-------------------------------------------------------+  |
|  | Local Model Provider Interface (Ollama / Qwen-2.5)     |  |
|  +-------------------------------------------------------+  |
|  | Edge Heuristic Parser (Deterministic <5ms Fallback)    |  |
|  +-------------------------------------------------------+  |
|  | Cosine Similarity Vector Index                        |  |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|                      Local Storage                          |
|  - SQLite (WAL Mode, ACID Tasks, Habits, Logs, Embeddings)  |
|  - Quantized Model Binaries (e.g. Qwen-2.5 1.5B / Phi-3)    |
+-------------------------------------------------------------+
```

---

## 🚀 Key Features

1. **The Context Stream (Capture Hub):**
   - Quick raw-input terminal for markdown notes, code snippets, or daily brain dumps.
   - `Ctrl + Enter` instant parsing trigger.
   - Real-time sidecar separating Direct Tasks, Tiny Habit Triplets, and Entity `#tags`.
   - One-click "Save All to SQLite" transaction.

2. **Habit Flow (Tiny Habits Protocol):**
   - Define and track habit triplets:
     - **Anchor / Cue:** Existing behavioral trigger (e.g., *"After switching Git branch"*).
     - **Tiny Action:** Frictionless micro-habit (e.g., *"Run test suite & write 2-line log"*).
     - **Celebration:** Emotional reinforcement (e.g., *"High five screen & whisper Clean shipping!"*).
   - Streak counters (🔥 Current Streak & Max Streak).
   - 30-day behavioral heatmap matrix.
   - Idempotent daily check-in with celebratory audio/visual feedback.

3. **Daily Action Queue:**
   - Filter by context domain (`@dev`, `@work`, `@academic`, `@personal`).
   - Filter by status (`Pending`, `In Progress`, `Completed`, `Blocked`).
   - Priority badges (`HIGH`, `MED`, `LOW`) and quick status toggles.

4. **Automated Standup & Sprint Recap:**
   - Generates instant standup reports based on SQLite state:
     - Accomplished tasks
     - In-flight priorities
     - Recorded blockers & risks
     - Behavioral habit adherence
   - One-click "Copy for Standup" to paste directly into Slack or Discord.

5. **Edge Vector Memory Search:**
   - 100% on-device character n-gram / TF-IDF cosine similarity search.
   - Zero external embedding API calls; runs offline with zero latency.

---

## ⚡ Quickstart

### Prerequisites
- Node.js v18+ (tested on Node v26.7.0)
- Ollama (optional, auto-detected if running with `qwen2.5-coder:1.5b` or `phi3:mini`)

### Installation & Running

```bash
# 1. Install root dependencies
npm install

# 2. Run both server and client with a single command
npm run dev
```

- **Frontend Client:** [http://localhost:5173/](http://localhost:5173/)
- **Backend Core Engine:** [http://localhost:3001/api/status](http://localhost:3001/api/status)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Ctrl + Enter` | Extract context from raw note in Context Stream |
| `1` | Switch to Context Stream view |
| `2` | Switch to Habit Flow view |
| `3` | Switch to Action Queue view |
| `4` | Switch to Daily Standup view |
| `5` | Switch to Edge Search view |
| `?` | Open keyboard shortcuts modal |
| `Esc` | Close modal / overlays |

---

## 📁 Repository Structure

```
MemSync/
├── docs/                      # Production Specifications
│   ├── PRD.md                 # Product Requirements Document
│   ├── ARCHITECTURE.md        # Technical System Architecture
│   ├── RULES.md               # Engineering & Privacy Principles
│   ├── DESIGN.md              # UI/UX Specifications
│   ├── TASKS.md               # Milestone Roadmap
│   └── MEMORY.md              # Runtime Context Memory
├── server/                    # Core Backend Engine
│   ├── src/
│   │   ├── db.js              # Native SQLite Database (WAL Mode)
│   │   ├── index.js           # Express Server Entry Point
│   │   ├── routes/api.js      # REST API Endpoints
│   │   └── services/
│   │       ├── edgeParser.js  # Deterministic <5ms Heuristic Extractor
│   │       ├── ollamaService.js # Ollama LLM Client + Fallback
│   │       ├── vectorSearch.js  # Edge Cosine Similarity Index
│   │       └── recapService.js  # Standup & Retro Generator
│   ├── test/api.test.js       # Automated Unit Tests
│   └── package.json
├── client/                    # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx     # Navigation & Edge Badges
│   │   │   ├── ContextStream.jsx # Split Capture Editor & Sidecar
│   │   │   ├── HabitFlow.jsx  # Tiny Habits Engine & Heatmap
│   │   │   ├── ActionQueue.jsx # Filterable Task Kanban/List
│   │   │   ├── DailyRecap.jsx # Automated Standup Generator
│   │   │   ├── EdgeSearch.jsx # Local Semantic Search
│   │   │   └── KeyboardShortcutsModal.jsx
│   │   ├── App.jsx            # Main App State & Key Listeners
│   │   ├── index.css          # Design System & Slate Theme
│   │   └── main.jsx
│   └── vite.config.js         # Proxy configuration to port 3001
└── package.json               # Root Orchestration
```
