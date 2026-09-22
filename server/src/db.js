const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'memsync.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance
db.exec(`PRAGMA journal_mode = WAL;`);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    raw_content TEXT NOT NULL,
    summary TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'blocked'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    context_tag TEXT DEFAULT '@dev', -- '@dev', '@work', '@academic', '@personal'
    due_date TEXT,
    note_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anchor_cue TEXT NOT NULL,
    tiny_action TEXT NOT NULL,
    celebration TEXT NOT NULL,
    context_tag TEXT DEFAULT '@dev',
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_completed_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    log_date TEXT NOT NULL, -- YYYY-MM-DD
    status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, log_date),
    FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL, -- 'note' or 'task'
    source_id INTEGER NOT NULL,
    text_content TEXT NOT NULL,
    vector_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Check if initial seeding is needed
const habitCount = db.prepare('SELECT COUNT(*) as count FROM habits').get().count;
if (habitCount === 0) {
  const insertHabit = db.prepare(`
    INSERT INTO habits (anchor_cue, tiny_action, celebration, context_tag, current_streak, max_streak, last_completed_at)
    VALUES (?, ?, ?, ?, ?, ?, date('now', '-1 day'))
  `);

  insertHabit.run(
    'After switching or closing a Git feature branch',
    'Run test suite & write a 2-line commit summary',
    'High five screen & whisper "Clean shipping!"',
    '@dev',
    3,
    5
  );

  insertHabit.run(
    'After first morning coffee cup',
    'Review MemSync Action Queue & pick 1 priority task',
    'Take one deep breath and smile',
    '@work',
    7,
    12
  );

  insertHabit.run(
    'Before shutting down laptop terminal at night',
    'Dump open mental tabs into MemSync Context Stream',
    'Close laptop lid with quiet satisfaction',
    '@personal',
    4,
    4
  );

  // Seed sample tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, context_tag)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertTask.run(
    'Verify local Qwen-2.5 inference endpoint',
    'Ensure Ollama responds under 1.5s or falls back to edge parser',
    'pending',
    'high',
    '@dev'
  );

  insertTask.run(
    'Review PRD and Tiny Habits protocol specs',
    'Examine anchor-cue triplets in docs/PRD.md',
    'completed',
    'medium',
    '@work'
  );

  insertTask.run(
    'Benchmark SQLite query latency and vector search',
    'Verify WAL mode read latency is under 5ms',
    'in_progress',
    'medium',
    '@dev'
  );

  // Seed sample note
  const insertNote = db.prepare(`
    INSERT INTO notes (title, raw_content, summary, tags)
    VALUES (?, ?, ?, ?)
  `);

  insertNote.run(
    'Sprint Kickoff: Edge-First AI Architecture',
    `# Sprint Kickoff Notes
Worked on on-device model routing. Need to make sure zero cloud leakage is enforced.
- [ ] Implement fast edge heuristic fallback
- [ ] Connect Ollama endpoint for Qwen-2.5
Anchor: After closing Git branch, Action: Run test suite, Celebration: Fist pump
#edge #privacy #sprint`,
    'Sprint kickoff covering on-device model routing, zero cloud leakage, and Tiny Habits integration.',
    '#edge, #privacy, #sprint'
  );
}

module.exports = db;
