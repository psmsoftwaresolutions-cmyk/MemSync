# Runtime State & Context Memory

### Active Project Context
- **Project Name:** MemSync
- **Target Event:** Hackathon Prototype (On-site / Phase 1 Submission)
- **Track:** Productivity (Focus: On-device Edge AI, Local Habit/Task Copilot)
- **Primary Tech Stack:** Node.js / React, SQLite, Ollama (Qwen-2.5 / Phi-3 quantized), Docker.

### Key Architectural Assumptions & Constraints
- Development target is optimized for resource efficiency (operable on standard 8 GB RAM machines).
- Offline-first: Network disconnection does not interrupt note parsing or habit tracking.
- Fallback flag (`USE_CLOUD_FALLBACK=false`) ready to plug in Gemini API if local hardware fails during live judging.
