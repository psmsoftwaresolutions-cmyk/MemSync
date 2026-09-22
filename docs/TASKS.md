# Implementation Roadmap & Hackathon Task List

### Milestone 1: Local Backbone Setup (Hours 0 - 6)
- [x] Initialize project monorepo with client UI and backend service.
- [x] Set up SQLite schema for `tasks`, `habits`, and `habit_logs`.
- [x] Implement Ollama API integration client with local model verification check.

### Milestone 2: Context Parsing & Extraction (Hours 6 - 14)
- [x] Construct zero-shot extraction prompt template with JSON Schema enforcement.
- [x] Build parser service to map raw notes into structured database entries.
- [x] Implement embedding index for local semantic note search.

### Milestone 3: Interface & Behavioral Trigger Engine (Hours 14 - 20)
- [x] Build Context Stream input view with Markdown preview.
- [x] Implement Habit tracker UI with streak calculations and anchor triggers.
- [x] Implement automated Daily Standup / Recap generator.

### Milestone 4: Polish, Packaging & Demo Prep (Hours 20 - 24)
- [x] Package local demo run script (`docker-compose up` or simple `npm run dev`).
- [ ] Record 90-second workflow walkthrough.
- [x] Export 4-slide pitch deck summarizing edge efficiency, privacy, and UX.
