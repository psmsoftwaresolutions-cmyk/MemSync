import React, { useState } from 'react';
import { Search, Sparkles, FileText, CheckSquare, ShieldCheck, ArrowRight } from 'lucide-react';

export default function EdgeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const quickSearches = ['Ollama', 'Git branch', 'Privacy', 'Streak', 'SQLite'];

  const handleSearch = async (searchQuery) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search Bar Card */}
      <div className="m-card">
        {/* Issue 6: Group status badge directly with title to maintain proximity */}
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Search size={16} color="#38bdf8" aria-hidden="true" />
            <span>Edge Vector Memory Search</span>
            <div className="shield-badge" style={{ marginLeft: '0.25rem' }}>
              <ShieldCheck size={12} aria-hidden="true" />
              <span>100% In-Memory Vector Similarity</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.92rem' }}
              placeholder="Search across historical notes, tasks, and sprint retros..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {/* Issue 7: Primary action uses solid prominent styling */}
          <button
            type="button"
            className="btn-primary btn-primary-solid"
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? (
              <>
                <span className="pulse-dot" aria-hidden="true"></span>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} aria-hidden="true" />
                <span>Vector Query</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Search Suggestions (Issues 3 & 4: distinct pill affordance and >=16px spacing) */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.85rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            QUICK QUERIES:
          </span>
          {quickSearches.map((term) => (
            <button
              key={term}
              type="button"
              className="quick-query-pill"
              onClick={() => {
                setQuery(term);
                handleSearch(term);
              }}
              title={`Search for "${term}"`}
              aria-label={`Search memories for ${term}`}
            >
              <span>{term}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="m-card">
        <div className="card-header">
          <div className="card-title">
            <span>Query Matches ({results.length})</span>
          </div>
          {/* Issue 1: Body text size increased to 13px (0.8125rem) for WCAG/heuristic readability */}
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Sorted by Cosine Distance
          </span>
        </div>

        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Search size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.88rem' }}>
              {hasSearched ? 'No matching memories found for this query.' : 'Type a query or select a quick keyword above.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {results.map((r, idx) => {
              const isNote = r.source_type === 'note';
              const pct = Math.round(r.similarity * 100);

              return (
                <div
                  key={idx}
                  style={{
                    background: '#0d1424',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isNote ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                          <FileText size={11} /> Note
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                          <CheckSquare size={11} /> Task
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Item ID #{r.source_id}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: pct > 60 ? '#10b981' : pct > 30 ? '#f59e0b' : '#94a3b8'
                        }}
                      >
                        {pct}% Similarity
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {r.text_content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
