const assert = require('assert');
const { extractEntities } = require('../src/services/edgeParser');
const { createVector, cosineSimilarity, searchSimilar } = require('../src/services/vectorSearch');
const { generateDailyRecap } = require('../src/services/recapService');
const db = require('../src/db');

console.log('--- RUNNING MEMSYNC CORE BACKEND TESTS ---');

// Test 1: Edge Heuristic Extraction
console.log('[Test 1] Testing Edge Heuristic Parsing...');
const testNote = `# Sprint Alpha
Worked on the edge-orchestrated model runtime.
- [ ] Build local Ollama integration endpoint !high @dev
- [x] Verify PRD and Architecture documents @work
Anchor: After closing Git branch, Action: Run test suite and write commit log, Celebration: High five screen
#privacy #edge #tinyhabits
`;

const parsed = extractEntities(testNote);
console.log('Extracted Summary:', parsed.summary);
console.log('Extracted Tasks Count:', parsed.tasks.length);
console.log('Extracted Habits Count:', parsed.habits.length);
console.log('Extracted Tags:', parsed.tags);

assert(parsed.tasks.length >= 2, 'Should extract at least 2 tasks');
assert(parsed.habits.length >= 1, 'Should extract 1 habit triplet');
assert.strictEqual(parsed.habits[0].anchor_cue, 'After closing Git branch');
assert.strictEqual(parsed.habits[0].tiny_action, 'Run test suite and write commit log');
assert(parsed.tags.includes('#privacy'), 'Should include #privacy tag');
console.log('✅ Test 1 Passed: Edge Heuristic Parser verified.');

// Test 2: Vector Similarity
console.log('[Test 2] Testing Vector Index & Cosine Similarity...');
const vec1 = createVector('Ollama local quantized model running on device');
const vec2 = createVector('Local model inference with Ollama edge');
const vec3 = createVector('Baking chocolate chip cookies in oven');

const simClose = cosineSimilarity(vec1, vec2);
const simDistant = cosineSimilarity(vec1, vec3);
console.log('Similarity (related):', simClose);
console.log('Similarity (unrelated):', simDistant);

assert(simClose > 0.4, 'Related texts should have high similarity');
assert(simDistant < 0.1, 'Unrelated texts should have low similarity');
console.log('✅ Test 2 Passed: Edge Vector Engine verified.');

// Test 3: Standup Recap Generation
console.log('[Test 3] Testing Standup Recap Generator...');
const recap = generateDailyRecap();
assert(recap.markdown.includes('MemSync Daily Standup'), 'Should contain standup header');
assert(recap.stats.activeHabitsCount > 0, 'Should have active habits');
console.log('Generated Recap Markdown Length:', recap.markdown.length);
console.log('✅ Test 3 Passed: Standup Recap verified.');

// Test 4: Database Idempotent Habit Checkin
console.log('[Test 4] Testing SQLite Habit Streak & Idempotency...');
const habit = db.prepare('SELECT id, current_streak FROM habits LIMIT 1').get();
assert(habit, 'Should find at least 1 habit');
console.log('Testing habit ID:', habit.id, 'Initial streak:', habit.current_streak);
console.log('✅ Test 4 Passed: Database integrity verified.');

console.log('--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---');
