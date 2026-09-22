import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Smile, 
  Anchor, 
  Zap, 
  Calendar,
  Sparkles,
  Trophy,
  Filter
} from 'lucide-react';

export default function HabitFlow({ onDataUpdated }) {
  const [habits, setHabits] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState(null);

  // New Habit form state
  const [anchorCue, setAnchorCue] = useState('');
  const [tinyAction, setTinyAction] = useState('');
  const [celebration, setCelebration] = useState('Smile & whisper "Clean execution!"');
  const [contextTag, setContextTag] = useState('@dev');

  useEffect(() => {
    loadHabits();
    loadHeatmap();
  }, []);

  const loadHabits = async () => {
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (e) {
      console.error('Failed to load habits', e);
    }
  };

  const loadHeatmap = async () => {
    try {
      const res = await fetch('/api/habits/heatmap');
      if (res.ok) {
        const data = await res.json();
        setHeatmap(data);
      }
    } catch (e) {
      console.error('Failed to load heatmap', e);
    }
  };

  const handleCheckin = async (id) => {
    try {
      const res = await fetch(`/api/habits/${id}/checkin`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.celebration) {
        setCelebrationToast({
          celebration: data.celebration,
          streak: data.newStreak
        });
        setTimeout(() => setCelebrationToast(null), 4000);
      }

      loadHabits();
      loadHeatmap();
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      console.error('Checkin failed', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      loadHabits();
      loadHeatmap();
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!anchorCue.trim() || !tinyAction.trim()) return;

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchor_cue: anchorCue,
          tiny_action: tinyAction,
          celebration: celebration,
          context_tag: contextTag
        })
      });

      if (res.ok) {
        setShowModal(false);
        setAnchorCue('');
        setTinyAction('');
        loadHabits();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (e) {
      console.error('Create habit failed', e);
    }
  };

  const filteredHabits = habits.filter((h) => {
    if (activeFilter === 'all') return true;
    return h.context_tag === activeFilter;
  });

  const totalStreaks = habits.reduce((acc, h) => acc + (h.current_streak || 0), 0);
  const completedTodayCount = habits.filter((h) => h.completed_today).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CUMULATIVE STREAK</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{totalStreaks} days</div>
          </div>
        </div>

        <div className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>COMPLETED TODAY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{completedTodayCount} / {habits.length}</div>
          </div>
        </div>

        <div className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACTIVE ATOMIC HABITS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{habits.length}</div>
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap */}
      <div className="m-card">
        <div className="card-header">
          <div className="card-title">
            <Calendar size={16} color="#38bdf8" />
            <span>30-Day Behavioral Consistency Matrix</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Local SQLite Habit Logs
          </span>
        </div>

        <div className="heatmap-grid">
          {heatmap.map((cell, idx) => {
            let lvl = '';
            if (cell.count === 1) lvl = 'level-1';
            else if (cell.count === 2) lvl = 'level-2';
            else if (cell.count >= 3) lvl = 'level-3';

            return (
              <div
                key={idx}
                className={`heatmap-cell ${lvl}`}
                title={`${cell.date} (${cell.dayOfWeek}): ${cell.count} habits completed`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>30 days ago</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Less</span>
            <span className="heatmap-cell" style={{ width: 10, height: 10 }}></span>
            <span className="heatmap-cell level-1" style={{ width: 10, height: 10 }}></span>
            <span className="heatmap-cell level-2" style={{ width: 10, height: 10 }}></span>
            <span className="heatmap-cell level-3" style={{ width: 10, height: 10 }}></span>
            <span>More</span>
          </div>
          <span>Today</span>
        </div>
      </div>

      {/* Habits List Header & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CONTEXT:</span>
          {['all', '@dev', '@work', '@personal', '@academic'].map((ctx) => (
            <button
              key={ctx}
              className={`btn-ghost ${activeFilter === ctx ? 'active' : ''}`}
              style={{
                fontSize: '0.75rem',
                border: activeFilter === ctx ? '1px solid #3b82f6' : '1px solid transparent',
                background: activeFilter === ctx ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: activeFilter === ctx ? '#60a5fa' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveFilter(ctx)}
            >
              {ctx}
            </button>
          ))}
        </div>

        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} />
          <span>New Atomic Habit</span>
        </button>
      </div>

      {/* Habits Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
        {filteredHabits.map((habit) => (
          <div 
            key={habit.id} 
            className={`habit-card ${habit.completed_today ? 'completed-today' : ''}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="context-badge">{habit.context_tag}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="streak-pill">
                  <Flame size={13} fill="currentColor" />
                  <span>{habit.current_streak}d (Best: {habit.max_streak}d)</span>
                </span>
                <button
                  className="btn-ghost"
                  onClick={() => handleDelete(habit.id)}
                  style={{ color: '#ef4444', padding: '2px 4px' }}
                  title="Delete habit"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Triplet Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#0a1020', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div className="triplet-row">
                <span className="triplet-label" style={{ color: '#f59e0b' }}>
                  <Anchor size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Anchor / Cue
                </span>
                <span className="triplet-value">{habit.anchor_cue}</span>
              </div>

              <div className="triplet-row">
                <span className="triplet-label" style={{ color: '#38bdf8' }}>
                  <Zap size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Tiny Action
                </span>
                <span className="triplet-value" style={{ fontWeight: 600 }}>{habit.tiny_action}</span>
              </div>

              <div className="triplet-row">
                <span className="triplet-label" style={{ color: '#34d399' }}>
                  <Smile size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Celebration
                </span>
                <span className="triplet-value" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                  "{habit.celebration}"
                </span>
              </div>
            </div>

            {/* Checkin Action Button */}
            <button
              className={habit.completed_today ? 'btn-secondary' : 'btn-primary'}
              onClick={() => handleCheckin(habit.id)}
              disabled={habit.completed_today}
              style={{
                width: '100%',
                justifyContent: 'center',
                background: habit.completed_today ? 'rgba(16, 185, 129, 0.15)' : 'var(--accent-blue)',
                color: habit.completed_today ? '#34d399' : '#fff',
                borderColor: habit.completed_today ? 'rgba(16, 185, 129, 0.3)' : 'transparent'
              }}
            >
              {habit.completed_today ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Completed Today • Loop Closed</span>
                </>
              ) : (
                <>
                  <Zap size={16} fill="currentColor" />
                  <span>Complete Micro-Action & Celebrate</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Celebration Toast Modal */}
      {celebrationToast && (
        <div className="toast-celebration">
          <Sparkles size={24} color="#f59e0b" />
          <div>
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>
              Loop Closed! Streak: {celebrationToast.streak} Days 🔥
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '0.82rem', marginTop: '2px' }}>
              {celebrationToast.celebration}
            </div>
          </div>
        </div>
      )}

      {/* Create Habit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title">
                <Sparkles size={16} color="#f59e0b" />
                <span>Define New Habit Recipe</span>
              </div>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  1. ANCHOR / CUE (An existing behavioral trigger in your routine)
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. After closing a Git feature branch"
                  value={anchorCue}
                  onChange={(e) => setAnchorCue(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  2. TINY ACTION (A frictionless micro-habit taking &lt; 60 seconds)
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Run tests & write 2-line commit summary"
                  value={tinyAction}
                  onChange={(e) => setTinyAction(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  3. CELEBRATION (Immediate emotional reinforcement)
                </label>
                <input
                  className="form-input"
                  placeholder='e.g. High five screen & whisper "Clean shipping!"'
                  value={celebration}
                  onChange={(e) => setCelebration(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  CONTEXT DOMAIN
                </label>
                <select
                  className="form-select"
                  value={contextTag}
                  onChange={(e) => setContextTag(e.target.value)}
                >
                  <option value="@dev">@dev (Code, Git, Architecture)</option>
                  <option value="@work">@work (Team, Standup, Review)</option>
                  <option value="@academic">@academic (Papers, Research)</option>
                  <option value="@personal">@personal (Health, Evening)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save to SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
