import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Flame, 
  CheckSquare, 
  FileText, 
  Search, 
  HelpCircle 
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  engineStatus, 
  onOpenShortcuts 
}) {
  const tabs = [
    { id: 'stream', label: 'Context Stream', icon: Layers, key: '1' },
    { id: 'habits', label: 'Habit Flow', icon: Flame, key: '2' },
    { id: 'tasks', label: 'Action Queue', icon: CheckSquare, key: '3' },
    { id: 'recap', label: 'Daily Standup', icon: FileText, key: '4' },
    { id: 'search', label: 'Edge Search', icon: Search, key: '5' },
  ];

  return (
    <header className="top-navbar">
      <div className="brand-section">
        <div className="brand-logo" aria-hidden="true">
          <Zap size={18} />
        </div>
        <div>
          <h1 className="brand-title">
            MemSync
            <span className="brand-subtitle">v1.0 • Edge Copilot</span>
          </h1>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Main Navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-label={`${tab.label} (Shortcut: ${tab.key})`}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{tab.label}</span>
              <span className="nav-shortcut" aria-hidden="true">
                <kbd>{tab.key}</kbd>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="status-cluster">
        {/* Issue 5: Streamlined Status Indicator reducing visual clutter */}
        <div 
          className="status-pill status-pill--info" 
          title={`100% On-Device Privacy (Zero Cloud Leakage) • Active Model: ${engineStatus?.ollamaOnline ? engineStatus.model : 'Edge Heuristic Engine'}`}
          role="status"
          aria-label={`Privacy: Zero Cloud Leakage. Engine: ${engineStatus?.ollamaOnline ? engineStatus.model : 'Edge Heuristic Engine'}`}
        >
          <ShieldCheck size={14} color="#34d399" aria-hidden="true" />
          <span className="pulse-dot" aria-hidden="true"></span>
          <span>
            {engineStatus?.ollamaOnline ? (
              <>
                <span className="status-model-full">Ollama ({engineStatus.model})</span>
                <span className="status-model-compact">Ollama (1.5b)</span>
              </>
            ) : (
              'Edge Engine'
            )}
          </span>
        </div>

        <button 
          className="btn-ghost" 
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts"
          aria-label="Keyboard shortcuts"
        >
          <HelpCircle size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
