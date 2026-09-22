# System Architecture & Technical Specifications
## MemSync Prototype

### 1. High-Level Architectural Flow

```
+-------------------------------------------------------------+
|                      Client UI                              |
|           (React / Next.js / Mobile WebView Shell)          |
+------------------------------+------------------------------+
                               | IPC / REST / gRPC
+------------------------------v------------------------------+
|                   MemSync Core Engine (Node.js/Go/Python)   |
|  +-------------------------------------------------------+  |
|  | Context Parsing & Habit State Machine Engine           |  |
|  +-------------------------------------------------------+  |
|  | Embedding & Similarity Search (sqlite-vec / Chroma)   |  |
|  +-------------------------------------------------------+  |
|  | Local Model Provider Interface (Ollama / ONNX Runtime) |  |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|                      Local Storage                          |
|  - SQLite (Structured Habits, Tasks, Logs)                  |
|  - Local Vector Index (`sqlite-vec` or local embeddings)    |
|  - Quantized Model Binaries (e.g., Qwen-2.5-1.5B / 3B)       |
+-------------------------------------------------------------+
```

### 2. Component Breakdown
1. **Presentation Layer:**
   - Unified Dashboard: Fast keyboard-driven input (Vim-inspired shortcuts, Markdown preview, Habit checklist, Task Kanban).
2. **Local Inference Runtime:**
   - Primary: Quantized Small Language Model via Ollama REST API (`http://localhost:11434/api/generate`) or local ONNX runtime.
   - Recommended Default Model: `qwen2.5:1.5b-instruct-q4_K_M` or `phi3:mini` for minimal memory overhead and fast JSON output.
3. **Storage & Vector Index:**
   - Relational: Embedded SQLite for ACID compliance on tasks, habit logs, and streaks.
   - Vector Extension: `sqlite-vec` or in-memory cosine similarity over local embeddings (e.g., `all-MiniLM-L6-v2`).
4. **Data Sync & Fallback:**
   - Decoupled model provider interface allowing seamless switching between local Ollama endpoints and cloud fallbacks (e.g., Gemini API via environment variable toggles).
