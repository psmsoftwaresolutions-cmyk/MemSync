import React from 'react';
import { Command, X } from 'lucide-react';

export default function KeyboardShortcutsModal({ onClose }) {
  const shortcuts = [
    { key: 'Ctrl + Enter', desc: 'Extract context & parse tasks/habits (Context Stream)' },
    { key: '1', desc: 'Switch to Context Stream capture hub' },
    { key: '2', desc: 'Switch to Habit Flow & anchor tracker' },
    { key: '3', desc: 'Switch to Daily Action Queue' },
    { key: '4', desc: 'Switch to Daily Standup & recap generator' },
    { key: '5', desc: 'Switch to Edge Vector Search' },
    { key: '?', desc: 'Toggle keyboard shortcuts reference' },
    { key: 'Esc', desc: 'Close open dialogs & overlays' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div className="card-title">
            <Command size={16} color="#38bdf8" />
            <span>MemSync Keyboard Shortcuts</span>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.45rem 0.65rem',
                background: '#11192e',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>{s.desc}</span>
              <kbd>{s.key}</kbd>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
