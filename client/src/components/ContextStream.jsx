import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Database, 
  Check, 
  Trash2, 
  Sparkles, 
  Hash, 
  Tag, 
  Clock, 
  FileCode, 
  Plus, 
  Anchor, 
  Smile, 
  ArrowRight,
  BookOpen,
  RotateCcw
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Dev Sprint Note',
    content: `# Daily Sprint Log - Edge Pipeline
Focused on on-device vector search and deterministic extraction.
- [ ] Connect local Ollama REST client !high @dev
- [ ] Implement WAL mode SQLite database @dev
- [x] Review Tiny Habits behavioral cues @work
Anchor: After closing Git feature branch, Action: Run test suite & write 2-line commit summary, Celebration: High five screen & whisper "Clean shipping!"
Need to benchmark read latency before midnight. #privacy #edge #architecture`
  },
  {
    name: 'Brain Dump & Micro-Habits',
    content: `# Morning Mental Download
Woke up thinking about context fragmentation between Slack, Git, and Obsidian.
- [ ] Clean up redundant npm dependencies !urgent @dev
- [ ] Prepare 4-slide hackathon presentation deck @work
When closing evening laptop lid, I will dump mental tabs into MemSync (celebration: smile with satisfaction)
Also need to reply to team email by 4pm. #focus #habits`
  },
  {
    name: 'Research & Retro',
    content: `# Retro & Memory Optimization
Quantized models (Qwen-2.5 1.5B Q4) use less than 1GB RAM on Windows.
- [ ] Add vector similarity indexing over past retro notes @academic
- [ ] Test offline behavior when Ollama process is killed @dev
Anchor: After first morning coffee, Action: Open MemSync and pick 1 priority, Celebration: Take deep breath
#quantization #benchmark`
  }
];

export default function ContextStream({ onDataUpdated }) {
  const [rawText, setRawText] = useState(PRESETS[0].content);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentNotes, setRecentNotes] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    fetchRecentNotes();
  }, []);

  const fetchRecentNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setRecentNotes(data);
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  };

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      });
      const data = await res.json();
      setParsedData(data);
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleParse();
    }
  };

  const handleCommitToDatabase = async () => {
    if (!parsedData && !rawText.trim()) return;
    setIsSaving(true);

    try {
      const title = rawText.split('\n')[0].replace(/^#+\s*/, '').substring(0, 50) || 'Captured Note';
      const payload = {
        title,
        raw_content: rawText,
        summary: parsedData?.summary || '',
        tags: parsedData?.tags || [],
        tasks: parsedData?.tasks || [],
        habits: parsedData?.habits || []
      };

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccess(true);
        fetchRecentNotes();
        if (onDataUpdated) onDataUpdated();
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const removeParsedTask = (index) => {
    if (!parsedData) return;
    const updated = [...parsedData.tasks];
    updated.splice(index, 1);
    setParsedData({ ...parsedData, tasks: updated });
  };

  const removeParsedHabit = (index) => {
    if (!parsedData) return;
    const updated = [...parsedData.habits];
    updated.splice(index, 1);
    setParsedData({ ...parsedData, habits: updated });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner / Presets & Saved Notes (Issues 4 & 6) */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>PRESETS:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => {
                setRawText(p.content);
                setParsedData(null);
              }}
            >
              {p.name}
            </button>
          ))}
          {/* Issue 6: Clear styled distinctly as a destructive utility action */}
          <button
            type="button"
            className="btn-utility-clear"
            onClick={() => {
              setRawText('');
              setParsedData(null);
            }}
            title="Clear raw notes editor"
            aria-label="Clear raw notes editor"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>

        {/* Subtle separator */}
        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 0.25rem' }} aria-hidden="true" />

        {/* Issue 4: Grouped closer to presets rather than isolated on the far right */}
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setShowRecent(!showRecent)}
          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
          aria-expanded={showRecent}
        >
          <BookOpen size={14} aria-hidden="true" />
          <span>{showRecent ? 'Hide Saved Notes' : `Saved Notes (${recentNotes.length})`}</span>
        </button>
      </div>

      {/* Collapsible Recent Notes */}
      {showRecent && (
        <div className="m-card" style={{ padding: '0.85rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            LOCAL SQLITE NOTE REPOSITORY (WAL MODE)
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
            {recentNotes.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  setRawText(n.raw_content);
                  setParsedData(null);
                }}
                style={{
                  background: '#131b2e',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  minWidth: '220px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: '2px' }}>{n.title || 'Untitled'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stream Grid: Raw Terminal on Left, Extractor Sidecar on Right */}
      <div className="stream-grid">
        {/* Left: Raw Markdown Editor */}
        <div className="editor-wrapper">
          <div className="editor-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode size={15} color="#38bdf8" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                Capture Hub / Raw Notes
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Press <kbd>Ctrl + Enter</kbd> to parse
              </span>
              <button
                type="button"
                className="btn-primary"
                onClick={handleParse}
                disabled={isParsing || !rawText.trim()}
              >
                {isParsing ? (
                  <>
                    <span className="pulse-dot" aria-hidden="true"></span>
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} fill="currentColor" aria-hidden="true" />
                    <span>Extract Context</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            className="raw-textarea"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="# Paste your raw daily notes, brain dump, or terminal tasks here...
- [ ] Task 1 @dev
- [ ] Task 2 !high
Anchor: After closing Git branch, Action: Run tests, Celebration: Fist pump
#tags"
          />

          <div style={{ padding: '0.4rem 1rem', background: '#090d16', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>{rawText.length} characters • {rawText.split('\n').length} lines</span>
            <span>100% On-Device Isolation</span>
          </div>
        </div>

        {/* Right: Extractor Panel */}
        <div className="sidecar-container">
          <div className="editor-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={15} color="#f59e0b" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                EXTRACTED INSIGHTS
              </span>
            </div>

            {parsedData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  ⚡ {parsedData.latency_ms || '<5'}ms ({parsedData.engine || 'Edge Heuristic'})
                </span>
                <button
                  className="btn-primary"
                  onClick={handleCommitToDatabase}
                  disabled={isSaving}
                  style={{ 
                    padding: '0.35rem 0.8rem', 
                    fontSize: '0.78rem',
                    background: saveSuccess ? '#10b981' : 'var(--accent-blue)'
                  }}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={13} />
                      <span>Committed to SQLite!</span>
                    </>
                  ) : (
                    <>
                      <Database size={13} />
                      <span>Save All to SQLite</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="sidecar-scroll">
            {!parsedData ? (
              <div className="sidecar-empty">
                <Sparkles size={36} color="var(--accent-blue)" style={{ opacity: 0.45, marginBottom: '1rem' }} aria-hidden="true" />
                <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  No structured items extracted yet
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: 1.5 }}>
                  Convert your raw markdown notes into structured daily tasks, Tiny Habits recipes, and contextual tags.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleParse}
                  disabled={isParsing || !rawText.trim()}
                  style={{ marginTop: '1.25rem', padding: '0.5rem 1.25rem', height: '36px' }}
                >
                  {isParsing ? (
                    <>
                      <span className="pulse-dot" aria-hidden="true"></span>
                      <span>Extracting Context...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" aria-hidden="true" />
                      <span>Extract Context</span>
                      <kbd style={{ marginLeft: '0.4rem', fontSize: '0.7rem', padding: '1px 5px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.2)' }}>Ctrl+Enter</kbd>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Summary Card */}
                {parsedData.summary && (
                  <div style={{ background: '#131e36', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '0.2rem' }}>
                      AUTOMATED NOTE RECAP
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#e2e8f0' }}>{parsedData.summary}</div>
                  </div>
                )}

                {/* Extracted Direct Tasks */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Direct Tasks ({parsedData.tasks.length})
                    </span>
                  </div>

                  {parsedData.tasks.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>
                      No direct tasks detected in note.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {parsedData.tasks.map((task, idx) => (
                        <div key={idx} className="extracted-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }}></span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 500, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {task.title}
                            </span>
                            {task.priority && (
                              <span className={`priority-badge priority-${task.priority}`}>
                                {task.priority}
                              </span>
                            )}
                            {task.context_tag && (
                              <span className="context-badge">{task.context_tag}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => removeParsedTask(idx)}
                            style={{ color: '#ef4444', padding: '2px 4px' }}
                            aria-label={`Remove task: ${task.title}`}
                            title={`Remove task: ${task.title}`}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Extracted Habit Recipes */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Detected Habit Recipes ({parsedData.habits.length})
                    </span>
                  </div>

                  {parsedData.habits.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>
                      No habit recipes detected (use format: "Anchor: ... Action: ... Celebration: ...").
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {parsedData.habits.map((h, idx) => (
                        <div key={idx} className="extracted-item" style={{ borderLeft: '3px solid #f59e0b' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span className="context-badge">{h.context_tag || '@dev'}</span>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => removeParsedHabit(idx)}
                              style={{ color: '#ef4444', padding: '2px 4px' }}
                              aria-label={`Remove habit recipe: ${h.tiny_action}`}
                              title={`Remove habit recipe: ${h.tiny_action}`}
                            >
                              <Trash2 size={13} aria-hidden="true" />
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <span style={{ color: '#f59e0b', fontWeight: 600, width: '60px' }}>Anchor:</span>
                              <span style={{ color: '#e2e8f0' }}>{h.anchor_cue}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <span style={{ color: '#38bdf8', fontWeight: 600, width: '60px' }}>Action:</span>
                              <span style={{ color: '#ffffff', fontWeight: 500 }}>{h.tiny_action}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <span style={{ color: '#34d399', fontWeight: 600, width: '60px' }}>Celebrate:</span>
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>"{h.celebration}"</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags and Contexts */}
                {parsedData.tags && parsedData.tags.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Identified Entity Tags
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {parsedData.tags.map((tag, idx) => (
                        <span key={idx} className="tag-badge">
                          <Hash size={11} />
                          <span>{tag.replace('#', '')}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
