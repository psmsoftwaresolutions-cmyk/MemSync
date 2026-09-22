# Engineering Rules & Ground Principles

### 1. Codebase & Implementation Standards
- **Zero Cloud Leakage by Default:** Never make external network requests containing note bodies, task descriptions, or private logs without explicit user toggle.
- **Strict Structured Outputs:** All local LLM prompts must require deterministic JSON outputs matching standard schemas. Never accept unstructured natural language for backend state updates.
- **Single Responsibility Modules:** Keep parser logic, database interfaces, and model calling pipelines in distinct directories.
- **Low-Memory Priority:** Avoid heavy background daemon workers that exceed 350 MB RAM idle footprint. Ensure lightweight model quantization (Q4).

### 2. State & Data Integrity
- **Local SQLite First:** All writes must complete to SQLite before UI confirmation.
- **Idempotent Actions:** Habit completion check-ins, task parsing, and note synchronizations must be idempotent.
