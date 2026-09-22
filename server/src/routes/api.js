const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkOllamaStatus, parseWithModel } = require('../services/ollamaService');
const { searchSimilar, indexItem } = require('../services/vectorSearch');
const { generateDailyRecap } = require('../services/recapService');

/**
 * GET /api/status - Engine status, SQLite stats, model availability
 */
router.get('/status', async (req, res) => {
  try {
    const ollamaStatus = await checkOllamaStatus();
    const taskCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
    const habitCount = db.prepare('SELECT COUNT(*) as c FROM habits').get().c;
    const noteCount = db.prepare('SELECT COUNT(*) as c FROM notes').get().c;

    res.json({
      status: 'healthy',
      engine: ollamaStatus.online ? 'Ollama Edge LLM' : 'Edge Heuristic Engine',
      model: ollamaStatus.activeModel,
      ollamaOnline: ollamaStatus.online,
      availableModels: ollamaStatus.models || [],
      privacyShield: '100% On-Device / Zero Cloud Leakage',
      stats: {
        tasks: taskCount,
        habits: habitCount,
        notes: noteCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/parse - Parse unstructured raw text/markdown into structured items
 */
router.post('/parse', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text body is required' });
    }

    const extraction = await parseWithModel(text);
    res.json(extraction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/notes - List notes
 */
router.get('/notes', (req, res) => {
  try {
    const notes = db.prepare('SELECT * FROM notes ORDER BY id DESC LIMIT 50').all();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/notes - Ingest note and optionally auto-commit extracted tasks & habits
 */
router.post('/notes', (req, res) => {
  try {
    const { title, raw_content, summary, tags, tasks, habits } = req.body;
    if (!raw_content) {
      return res.status(400).json({ error: 'raw_content is required' });
    }

    const noteTitle = title || (raw_content.split('\n')[0].replace(/^#+\s*/, '').substring(0, 50) || 'Untitled Note');
    const tagsStr = Array.isArray(tags) ? tags.join(', ') : (tags || '');

    // Insert note
    const insertNote = db.prepare(`
      INSERT INTO notes (title, raw_content, summary, tags)
      VALUES (?, ?, ?, ?)
    `);
    const noteRes = insertNote.run(noteTitle, raw_content, summary || '', tagsStr);
    const noteId = noteRes.lastInsertRowid;

    // Index note for vector search
    indexItem('note', noteId, `${noteTitle} ${raw_content} ${tagsStr}`);

    // Insert any accepted tasks
    let insertedTasksCount = 0;
    if (Array.isArray(tasks) && tasks.length > 0) {
      const insertTask = db.prepare(`
        INSERT INTO tasks (title, description, status, priority, context_tag, due_date, note_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of tasks) {
        if (!t.title) continue;
        const taskRes = insertTask.run(
          t.title,
          t.description || '',
          t.status || 'pending',
          t.priority || 'medium',
          t.context_tag || '@dev',
          t.due_date || null,
          noteId
        );
        indexItem('task', taskRes.lastInsertRowid, `${t.title} ${t.description || ''} ${t.context_tag || ''}`);
        insertedTasksCount++;
      }
    }

    // Insert any accepted habits
    let insertedHabitsCount = 0;
    if (Array.isArray(habits) && habits.length > 0) {
      const insertHabit = db.prepare(`
        INSERT INTO habits (anchor_cue, tiny_action, celebration, context_tag)
        VALUES (?, ?, ?, ?)
      `);
      for (const h of habits) {
        if (!h.anchor_cue || !h.tiny_action) continue;
        insertHabit.run(
          h.anchor_cue,
          h.tiny_action,
          h.celebration || 'Take a breath and smile',
          h.context_tag || '@dev'
        );
        insertedHabitsCount++;
      }
    }

    res.json({
      success: true,
      noteId,
      tasksAdded: insertedTasksCount,
      habitsAdded: insertedHabitsCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tasks - List tasks
 */
router.get('/tasks', (req, res) => {
  try {
    const { status, context } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (context && context !== 'all') {
      query += ' AND context_tag = ?';
      params.push(context);
    }

    query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, id DESC";
    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tasks - Create single task
 */
router.post('/tasks', (req, res) => {
  try {
    const { title, description, priority, context_tag, due_date, status } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const insert = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, context_tag, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const r = insert.run(
      title,
      description || '',
      status || 'pending',
      priority || 'medium',
      context_tag || '@dev',
      due_date || null
    );

    indexItem('task', r.lastInsertRowid, `${title} ${description || ''} ${context_tag || ''}`);
    res.json({ id: r.lastInsertRowid, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/tasks/:id - Update task
 */
router.patch('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, title, description, context_tag } = req.body;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const newStatus = status !== undefined ? status : task.status;
    const newPriority = priority !== undefined ? priority : task.priority;
    const newTitle = title !== undefined ? title : task.title;
    const newDesc = description !== undefined ? description : task.description;
    const newCtx = context_tag !== undefined ? context_tag : task.context_tag;
    const completedAt = (newStatus === 'completed' && task.status !== 'completed') 
      ? new Date().toISOString() 
      : (newStatus !== 'completed' ? null : task.completed_at);

    db.prepare(`
      UPDATE tasks 
      SET status = ?, priority = ?, title = ?, description = ?, context_tag = ?, completed_at = ?
      WHERE id = ?
    `).run(newStatus, newPriority, newTitle, newDesc, newCtx, completedAt, id);

    indexItem('task', id, `${newTitle} ${newDesc || ''} ${newCtx || ''}`);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/tasks/:id - Delete task
 */
router.delete('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    db.prepare('DELETE FROM embeddings WHERE source_type = "task" AND source_id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/habits - List habits with today's status
 */
router.get('/habits', (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const habits = db.prepare('SELECT * FROM habits ORDER BY current_streak DESC, id DESC').all();

    const habitsWithStatus = habits.map((h) => {
      const logToday = db.prepare('SELECT * FROM habit_logs WHERE habit_id = ? AND log_date = ?').get(h.id, todayStr);
      return {
        ...h,
        completed_today: !!logToday
      };
    });

    res.json(habitsWithStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/habits - Create atomic habit triplet
 */
router.post('/habits', (req, res) => {
  try {
    const { anchor_cue, tiny_action, celebration, context_tag } = req.body;
    if (!anchor_cue || !tiny_action) {
      return res.status(400).json({ error: 'anchor_cue and tiny_action are required' });
    }

    const insert = db.prepare(`
      INSERT INTO habits (anchor_cue, tiny_action, celebration, context_tag)
      VALUES (?, ?, ?, ?)
    `);
    const r = insert.run(
      anchor_cue,
      tiny_action,
      celebration || 'Smile & whisper "Yes!"',
      context_tag || '@dev'
    );

    res.json({ id: r.lastInsertRowid, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/habits/:id/checkin - Idempotent habit check-in
 */
router.post('/habits/:id/checkin', (req, res) => {
  try {
    const { id } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];

    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    // Check if already checked in today (idempotency requirement)
    const existingLog = db.prepare('SELECT * FROM habit_logs WHERE habit_id = ? AND log_date = ?').get(id, todayStr);
    if (existingLog) {
      return res.json({
        success: true,
        alreadyCompleted: true,
        message: 'Habit already completed today!',
        habit
      });
    }

    // Insert log
    db.prepare(`
      INSERT INTO habit_logs (habit_id, log_date, status)
      VALUES (?, ?, 'completed')
    `).run(id, todayStr);

    // Calculate streak
    const newStreak = (habit.current_streak || 0) + 1;
    const newMax = Math.max(habit.max_streak || 0, newStreak);

    db.prepare(`
      UPDATE habits
      SET current_streak = ?, max_streak = ?, last_completed_at = ?
      WHERE id = ?
    `).run(newStreak, newMax, todayStr, id);

    const updatedHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);

    res.json({
      success: true,
      celebration: habit.celebration,
      newStreak,
      habit: {
        ...updatedHabit,
        completed_today: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/habits/:id - Delete habit
 */
router.delete('/habits/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM habits WHERE id = ?').run(id);
    db.prepare('DELETE FROM habit_logs WHERE habit_id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/habits/heatmap - 30-day activity matrix
 */
router.get('/habits/heatmap', (req, res) => {
  try {
    const days = 30;
    const matrix = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const count = db.prepare('SELECT COUNT(*) as c FROM habit_logs WHERE log_date = ?').get(dateStr).c;
      matrix.push({
        date: dateStr,
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: count
      });
    }

    res.json(matrix);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/search - Semantic vector search
 */
router.post('/search', (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const results = searchSimilar(query, 10);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/recap - Generate daily standup & sprint recap
 */
router.get('/recap', (req, res) => {
  try {
    const recap = generateDailyRecap();
    res.json(recap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
