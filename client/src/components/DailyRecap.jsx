import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame 
} from 'lucide-react';

export default function DailyRecap() {
  const [recapData, setRecapData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecap();
  }, []);

  const loadRecap = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/recap');
      if (res.ok) {
        const data = await res.json();
        setRecapData(data);
      }
    } catch (e) {
      console.error('Failed to load recap', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!recapData?.markdown) return;
    navigator.clipboard.writeText(recapData.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>COMPLETED TASKS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>{recapData?.stats?.completedCount || 0}</div>
          </div>
        </div>

        <div className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ACTIVE PRIORITIES</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3b82f6' }}>{recapData?.stats?.inProgressCount || 0}</div>
          </div>
        </div>

        <div className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>RECORDED BLOCKERS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f43f5e' }}>{recapData?.stats?.blockedCount || 0}</div>
          </div>
        </div>

        <div className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
            <Flame size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ACTIVE HABIT STREAKS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{recapData?.stats?.totalHabitStreaks || 0} days</div>
          </div>
        </div>
      </div>

      {/* Recap Content Card */}
      <div className="m-card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={16} color="#38bdf8" />
            <span>Automated Standup & Sprint Recap</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={loadRecap} disabled={isLoading}>
              <RefreshCw size={13} className={isLoading ? 'pulse-dot' : ''} />
              <span>Refresh</span>
            </button>

            <button
              className="btn-primary"
              onClick={handleCopy}
              style={{ background: copied ? '#10b981' : 'var(--accent-blue)' }}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied Markdown!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy for Standup</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Markdown Terminal Preview */}
        <div
          style={{
            background: 'var(--bg-terminal)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: 1.7,
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            maxHeight: '520px',
            overflowY: 'auto'
          }}
        >
          {recapData?.markdown || 'Generating sprint & standup recap...'}
        </div>
      </div>
    </div>
  );
}
