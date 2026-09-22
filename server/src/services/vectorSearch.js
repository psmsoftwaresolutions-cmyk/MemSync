const db = require('../db');

/**
 * Tokenize and generate normalized term frequency vector
 */
function createVector(text) {
  if (!text) return {};
  const clean = text.toLowerCase().replace(/[^a-z0-9\s#@_-]/g, ' ');
  const tokens = clean.split(/\s+/).filter(t => t.length > 1);
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  // Also add 3-grams for fuzzy matching
  for (let i = 0; i < clean.length - 2; i++) {
    const gram = clean.substring(i, i + 3).trim();
    if (gram.length === 3) {
      tf[`_g:${gram}`] = (tf[`_g:${gram}`] || 0) + 0.5;
    }
  }

  // Calculate Euclidean norm
  let sumSq = 0;
  for (const k in tf) {
    sumSq += tf[k] * tf[k];
  }
  const norm = Math.sqrt(sumSq) || 1;

  // Normalize
  const normalized = {};
  for (const k in tf) {
    normalized[k] = tf[k] / norm;
  }
  return normalized;
}

/**
 * Cosine similarity between two normalized vectors
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  for (const key in vecA) {
    if (vecB[key]) {
      dotProduct += vecA[key] * vecB[key];
    }
  }
  return dotProduct;
}

/**
 * Index a note or task into SQLite embeddings table
 */
function indexItem(sourceType, sourceId, textContent) {
  const vec = createVector(textContent);
  const vecJson = JSON.stringify(vec);

  // Check if already exists
  const existing = db.prepare('SELECT id FROM embeddings WHERE source_type = ? AND source_id = ?').get(sourceType, sourceId);
  if (existing) {
    db.prepare('UPDATE embeddings SET text_content = ?, vector_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(textContent, vecJson, existing.id);
  } else {
    db.prepare('INSERT INTO embeddings (source_type, source_id, text_content, vector_json) VALUES (?, ?, ?, ?)').run(sourceType, sourceId, textContent, vecJson);
  }
}

/**
 * Search the local vector index using cosine similarity
 */
function searchSimilar(query, limit = 10) {
  const queryVec = createVector(query);
  const rows = db.prepare('SELECT id, source_type, source_id, text_content, vector_json FROM embeddings').all();

  const results = [];
  for (const row of rows) {
    try {
      const itemVec = JSON.parse(row.vector_json);
      const similarity = cosineSimilarity(queryVec, itemVec);
      if (similarity > 0.05) {
        results.push({
          source_type: row.source_type,
          source_id: row.source_id,
          text_content: row.text_content,
          similarity: Math.round(similarity * 100) / 100
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  // Sort descending by similarity
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, limit);
}

/**
 * Synchronize all notes and tasks into vector index
 */
function reindexAll() {
  const notes = db.prepare('SELECT id, title, raw_content, tags FROM notes').all();
  for (const n of notes) {
    const text = `${n.title || ''} ${n.raw_content} ${n.tags || ''}`;
    indexItem('note', n.id, text);
  }

  const tasks = db.prepare('SELECT id, title, description, context_tag FROM tasks').all();
  for (const t of tasks) {
    const text = `${t.title} ${t.description || ''} ${t.context_tag || ''}`;
    indexItem('task', t.id, text);
  }
}

// Initial index run
reindexAll();

module.exports = {
  createVector,
  cosineSimilarity,
  indexItem,
  searchSimilar,
  reindexAll
};
