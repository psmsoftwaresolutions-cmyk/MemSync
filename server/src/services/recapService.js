const db = require('../db');

/**
 * Generate an automated daily standup / recap based on SQLite tasks, habits, and notes.
 */
function generateDailyRecap() {
  const completedTasks = db.prepare(`
    SELECT title, context_tag, completed_at
    FROM tasks
    WHERE status = 'completed'
    ORDER BY id DESC
    LIMIT 5
  `).all();

  const inProgressTasks = db.prepare(`
    SELECT title, context_tag, priority
    FROM tasks
    WHERE status = 'in_progress' OR status = 'pending'
    ORDER BY priority = 'high' DESC, id DESC
    LIMIT 5
  `).all();

  const blockedTasks = db.prepare(`
    SELECT title, description, context_tag
    FROM tasks
    WHERE status = 'blocked'
    LIMIT 5
  `).all();

  const habits = db.prepare(`
    SELECT anchor_cue, tiny_action, current_streak, max_streak, last_completed_at
    FROM habits
    ORDER BY current_streak DESC
  `).all();

  const totalHabitStreaks = habits.reduce((acc, h) => acc + (h.current_streak || 0), 0);
  const activeHabitsCount = habits.length;

  const todayStr = new Date().toISOString().split('T')[0];

  let markdown = `# MemSync Daily Standup & Workflow Recap (${todayStr})\n\n`;

  markdown += `### 1. What was accomplished / completed:\n`;
  if (completedTasks.length > 0) {
    completedTasks.forEach((t) => {
      markdown += `- [x] ${t.title} \`${t.context_tag || '@dev'}\`\n`;
    });
  } else {
    markdown += `- *No completed tasks logged yet today.*\n`;
  }
  markdown += `\n`;

  markdown += `### 2. Today's focus & in-flight priorities:\n`;
  if (inProgressTasks.length > 0) {
    inProgressTasks.forEach((t) => {
      const pBadge = t.priority === 'high' ? '🔥 HIGH' : t.priority === 'medium' ? '⚡ MED' : 'LOW';
      markdown += `- [ ] [${pBadge}] ${t.title} \`${t.context_tag || '@dev'}\`\n`;
    });
  } else {
    markdown += `- *Queue is clear! Capture raw notes to populate new tasks.*\n`;
  }
  markdown += `\n`;

  markdown += `### 3. Blockers & Risks:\n`;
  if (blockedTasks.length > 0) {
    blockedTasks.forEach((t) => {
      markdown += `- ⚠️ **${t.title}**: ${t.description || 'Marked as blocked'}\n`;
    });
  } else {
    markdown += `- None identified. Zero blockers recorded.\n`;
  }
  markdown += `\n`;

  markdown += `### 4. Behavioral Habit Adherence (Tiny Habits):\n`;
  habits.forEach((h) => {
    const isToday = h.last_completed_at === todayStr;
    const checkIcon = isToday ? '✅' : '⏳';
    markdown += `- ${checkIcon} **${h.tiny_action}** (Trigger: *${h.anchor_cue}*) — **Streak: ${h.current_streak} days** (Best: ${h.max_streak})\n`;
  });

  return {
    markdown,
    stats: {
      completedCount: completedTasks.length,
      inProgressCount: inProgressTasks.length,
      blockedCount: blockedTasks.length,
      activeHabitsCount,
      totalHabitStreaks
    },
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  generateDailyRecap
};
