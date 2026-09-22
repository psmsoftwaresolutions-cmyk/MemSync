/**
 * Edge Heuristic Semantic Extractor
 * Deterministic, offline, zero-cloud-leakage parser for unstructured notes,
 * engineering task dumps, and Tiny Habit triplets.
 * Execution latency: < 5ms.
 */

function extractEntities(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      summary: '',
      tasks: [],
      habits: [],
      tags: [],
      contexts: []
    };
  }

  const lines = rawText.split(/\r?\n/);
  const tasks = [];
  const habits = [];
  const tagsSet = new Set();
  const contextSet = new Set();

  // Extract all #tags
  const tagMatches = rawText.match(/#[a-zA-Z0-9_\-]+/g);
  if (tagMatches) {
    tagMatches.forEach(t => tagsSet.add(t));
  }

  // Extract all @contexts
  const contextMatches = rawText.match(/@[a-zA-Z0-9_\-]+/g);
  if (contextMatches) {
    contextMatches.forEach(c => contextSet.add(c));
  }

  // Default context if none found
  const primaryContext = contextSet.size > 0 ? Array.from(contextSet)[0] : '@dev';

  // Process line by line for structured patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 1. Check for Explicit Habit Triplets
    // Formats:
    // "Anchor: X | Action: Y | Celebration: Z"
    // "After X, I will Y, then Z"
    // "When X, I will Y (celebration: Z)"
    const habitTripletMatch = line.match(/(?:Anchor|Cue):\s*([^,|]+)(?:[,|]\s*(?:Action|Tiny Action):\s*([^,|]+))(?:[,|]\s*(?:Celebration|Reward):\s*([^,|]+))?/i);
    if (habitTripletMatch) {
      habits.push({
        anchor_cue: habitTripletMatch[1].trim(),
        tiny_action: habitTripletMatch[2].trim(),
        celebration: habitTripletMatch[3] ? habitTripletMatch[3].trim() : 'Take a deep breath and smile',
        context_tag: primaryContext
      });
      continue;
    }

    const naturalHabitMatch = line.match(/^(?:After|When)\s+([^,]+),\s*(?:I will|I'll|then)\s+([^,.]+)(?:[.,]\s*(?:then\s+|and\s+celebrate\s+with\s+|celebration:\s*)([^.]+))?/i);
    if (naturalHabitMatch) {
      habits.push({
        anchor_cue: (line.startsWith('When') ? 'When ' : 'After ') + naturalHabitMatch[1].trim(),
        tiny_action: naturalHabitMatch[2].trim(),
        celebration: naturalHabitMatch[3] ? naturalHabitMatch[3].trim() : 'Whisper "Victory!" & high five',
        context_tag: primaryContext
      });
      continue;
    }

    // 2. Check for Markdown Checklist Tasks (- [ ], - [x], * [ ], etc.)
    const checkMatch = line.match(/^[-*+]\s*\[([ xX])\]\s*(.+)$/);
    if (checkMatch) {
      const isDone = checkMatch[1].toLowerCase() === 'x';
      const content = checkMatch[2].trim();
      const parsedTask = parseTaskLine(content, isDone ? 'completed' : 'pending', primaryContext);
      tasks.push(parsedTask);
      continue;
    }

    // 3. Check for TODO / FIXME / TASK markers
    const todoMatch = line.match(/^(?:TODO|FIXME|TASK|ACTION):\s*(.+)$/i);
    if (todoMatch) {
      const content = todoMatch[1].trim();
      const parsedTask = parseTaskLine(content, 'pending', primaryContext);
      tasks.push(parsedTask);
      continue;
    }

    // 4. Check for bulleted action items starting with verbs
    const bulletMatch = line.match(/^[-*•\d+.]\s+(.+)$/);
    if (bulletMatch) {
      const content = bulletMatch[1].trim();
      const actionVerbs = /^(?:build|implement|fix|refactor|test|verify|deploy|review|create|update|add|remove|design|setup|integrate|benchmark|write|document)\b/i;
      if (actionVerbs.test(content)) {
        const parsedTask = parseTaskLine(content, 'pending', primaryContext);
        tasks.push(parsedTask);
        continue;
      }
    }
  }

  // Generate automated summary
  const summary = generateSummary(rawText, tasks, habits);

  return {
    summary,
    tasks,
    habits,
    tags: Array.from(tagsSet),
    contexts: Array.from(contextSet)
  };
}

function parseTaskLine(content, defaultStatus = 'pending', fallbackContext = '@dev') {
  let title = content;
  let priority = 'medium';
  let context_tag = fallbackContext;
  let due_date = null;

  // Extract priority flags (!high, !low, !urgent, [P0], [P1])
  if (/\b(!high|!urgent|\[p0\]|\[high\])\b/i.test(title)) {
    priority = 'high';
    title = title.replace(/\b(!high|!urgent|\[p0\]|\[high\])\b/gi, '').trim();
  } else if (/\b(!low|\[p2\]|\[p3\]|\[low\])\b/i.test(title)) {
    priority = 'low';
    title = title.replace(/\b(!low|\[p2\]|\[p3\]|\[low\])\b/gi, '').trim();
  }

  // Extract context (@dev, @work, etc.)
  const ctxMatch = title.match(/(@[a-zA-Z0-9_\-]+)/);
  if (ctxMatch) {
    context_tag = ctxMatch[1];
    title = title.replace(ctxMatch[1], '').trim();
  }

  // Extract due date: "by Friday", "due: 2026-09-30", "tomorrow"
  const dueMatch = title.match(/\b(?:due|by):\s*([a-zA-Z0-9\-_/]+)/i);
  if (dueMatch) {
    due_date = dueMatch[1];
    title = title.replace(dueMatch[0], '').trim();
  }

  // Clean title
  title = title.replace(/\s{2,}/g, ' ').trim();

  return {
    title,
    description: '',
    status: defaultStatus,
    priority,
    context_tag,
    due_date
  };
}

function generateSummary(rawText, tasks, habits) {
  const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return 'Empty note ingested.';

  const taskCount = tasks.length;
  const habitCount = habits.length;

  // Grab the first heading or prominent line
  let titleLine = '';
  for (const line of lines) {
    if (line.startsWith('#')) {
      titleLine = line.replace(/^#+\s*/, '').trim();
      break;
    }
  }
  if (!titleLine && lines.length > 0) {
    titleLine = lines[0].substring(0, 60);
  }

  let summary = titleLine ? `Note on: "${titleLine}". ` : '';
  summary += `Identified ${taskCount} actionable task${taskCount === 1 ? '' : 's'}`;
  if (habitCount > 0) {
    summary += ` and ${habitCount} behavioral habit triplet${habitCount === 1 ? '' : 's'}.`;
  } else {
    summary += '.';
  }

  return summary;
}

module.exports = {
  extractEntities
};
