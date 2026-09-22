const http = require('http');
const edgeParser = require('./edgeParser');

const OLLAMA_HOST = process.env.OLLAMA_HOST || '127.0.0.1';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:1.5b';

/**
 * Check if Ollama is running locally and return available models
 */
async function checkOllamaStatus() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/tags',
        method: 'GET',
        timeout: 1000
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(data);
              const models = (parsed.models || []).map((m) => m.name);
              const hasTargetModel = models.some((m) => m.includes('qwen') || m.includes('phi') || m.includes(DEFAULT_MODEL));
              resolve({
                online: true,
                models,
                activeModel: hasTargetModel ? (models.find(m => m.includes('qwen')) || models[0]) : (models[0] || DEFAULT_MODEL),
                mode: 'ollama'
              });
            } catch {
              resolve({ online: false, mode: 'edge_fallback', activeModel: 'Edge Heuristic Engine' });
            }
          } else {
            resolve({ online: false, mode: 'edge_fallback', activeModel: 'Edge Heuristic Engine' });
          }
        });
      }
    );

    req.on('error', () => {
      resolve({
        online: false,
        mode: 'edge_fallback',
        activeModel: 'Edge Heuristic Engine (Offline-Safe)'
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        online: false,
        mode: 'edge_fallback',
        activeModel: 'Edge Heuristic Engine (Timeout Fallback)'
      });
    });

    req.end();
  });
}

/**
 * Extract structured tasks and Tiny Habits using Ollama (or seamless edge fallback)
 */
async function parseWithModel(rawText) {
  const startTime = Date.now();
  const status = await checkOllamaStatus();

  // If Ollama is offline, immediately run local edge heuristic parser
  if (!status.online) {
    const parsed = edgeParser.extractEntities(rawText);
    const latency = Date.now() - startTime;
    return {
      ...parsed,
      engine: 'Edge Heuristic Engine',
      latency_ms: latency,
      offline: true
    };
  }

  // Ollama is online - construct strict JSON extraction prompt
  const systemPrompt = `You are MemSync's edge contextual parser.
Given unstructured developer notes or brain dumps, extract structured items deterministically.
Return ONLY a valid JSON object strictly matching this schema:
{
  "summary": "1-2 sentence high-level overview of the note",
  "tasks": [
    {
      "title": "Clear action-oriented task title",
      "description": "Optional details or empty string",
      "status": "pending",
      "priority": "low | medium | high",
      "context_tag": "@dev | @work | @academic | @personal",
      "due_date": null or string
    }
  ],
  "habits": [
    {
      "anchor_cue": "Anchor or trigger event (e.g. After closing Git branch)",
      "tiny_action": "Micro-habit action (e.g. Run test suite & log 1 line)",
      "celebration": "Confirmation or celebration (e.g. Smile and fist pump)",
      "context_tag": "@dev | @work | @academic | @personal"
    }
  ],
  "tags": ["#tag1", "#tag2"],
  "contexts": ["@dev", "@work"]
}`;

  const prompt = `${systemPrompt}\n\nUnstructured Input Text:\n"""\n${rawText}\n"""\n\nJSON Response:`;

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      model: status.activeModel,
      prompt: prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1,
        num_predict: 1024
      }
    });

    const req = http.request(
      {
        host: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 20000 // 20s guardrail to allow cold model weight loading
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const latency = Date.now() - startTime;
          try {
            const ollamaRes = JSON.parse(data);
            const responseText = ollamaRes.response || '{}';
            const parsedJson = JSON.parse(responseText);

            resolve({
              summary: parsedJson.summary || '',
              tasks: Array.isArray(parsedJson.tasks) ? parsedJson.tasks : [],
              habits: Array.isArray(parsedJson.habits) ? parsedJson.habits : [],
              tags: Array.isArray(parsedJson.tags) ? parsedJson.tags : [],
              contexts: Array.isArray(parsedJson.contexts) ? parsedJson.contexts : [],
              engine: `Ollama (${status.activeModel})`,
              latency_ms: latency,
              offline: false
            });
          } catch {
            // If LLM returned invalid JSON, fall back to heuristic parser
            const fallback = edgeParser.extractEntities(rawText);
            resolve({
              ...fallback,
              engine: `Edge Heuristic (Sanitized from ${status.activeModel})`,
              latency_ms: latency,
              offline: false
            });
          }
        });
      }
    );

    req.on('error', () => {
      const fallback = edgeParser.extractEntities(rawText);
      resolve({
        ...fallback,
        engine: 'Edge Heuristic Engine (Connection Error Fallback)',
        latency_ms: Date.now() - startTime,
        offline: true
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const fallback = edgeParser.extractEntities(rawText);
      resolve({
        ...fallback,
        engine: 'Edge Heuristic Engine (Timeout Fallback)',
        latency_ms: Date.now() - startTime,
        offline: true
      });
    });

    req.write(postData);
    req.end();
  });
}

module.exports = {
  checkOllamaStatus,
  parseWithModel
};
