# Product Requirements Document (PRD)
## MemSync: Edge-Orchestrated Habit & Workflow Copilot

### 1. Executive Summary
MemSync is a local-first, privacy-preserving productivity engine designed for engineers, researchers, and knowledge workers. It bridges unstructured workspace artifacts (markdown notes, shell/git activity logs, and brain dumps) with deterministic behavioral habit loops (cues, low-friction micro-actions, and daily reviews). All contextual parsing, indexing, and habit extraction happen locally on-device.

### 2. Objectives & Value Proposition
- **Total Local Privacy:** Zero sensitive file leakage. No enterprise code, personal notes, or proprietary research are sent to cloud LLMs.
- **Context Fragmentation Reduction:** Automatically converts messy daily notes into structured task queues, scheduled micro-habits, and sprint recaps.
- **Behavioral Loop Closure:** Bridges intent and execution through contextual prompts triggered by active development context.

### 3. Core Features & Scope
#### 3.1 Unstructured Note Ingestion & Parsing
- Ingest local markdown (`.md`), raw text, or pasted task dumps.
- Parse entities: `#tags`, deadlines, implicit checklist items, and project references.

#### 3.2 Local Semantic Extraction Engine
- Classify text items into three schemas: `Direct Tasks`, `Atomic Habits`, and `Contextual References`.
- Generate automated daily summaries, blocker highlights, and review recaps.

#### 3.3 Habit Execution Engine (Tiny Habits Protocol)
- Define habit triplets: **Anchor / Cue** (e.g., "After closing Git branch"), **Tiny Action** (e.g., "Run test suite & write 2-line log"), **Celebration / Confirmation**.
- Track consistency streaks and trigger friction-reducing contextual prompts.

#### 3.4 Edge-Only Vector Search
- Local embeddings and vector similarity for past notes, sprint retros, and habit tracking history.

### 4. Non-Functional Requirements
- **Latency:** Local inference response under 1.5 seconds on edge hardware.
- **Resource Footprint:** Operable on 8 GB RAM machines using quantized GGUF/ONNX models (4-bit quantization).
- **Availability:** 100% offline capability; cloud connectivity optional for cloud-fallback modes only.
