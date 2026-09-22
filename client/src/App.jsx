import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ContextStream from './components/ContextStream';
import HabitFlow from './components/HabitFlow';
import ActionQueue from './components/ActionQueue';
import DailyRecap from './components/DailyRecap';
import EdgeSearch from './components/EdgeSearch';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('stream');
  const [engineStatus, setEngineStatus] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setEngineStatus(data);
      }
    } catch (e) {
      console.warn('API status check offline or connecting...', e);
      setEngineStatus({
        status: 'standby',
        engine: 'Edge Heuristic Engine',
        model: 'Deterministic Parser',
        ollamaOnline: false,
        privacyShield: '100% On-Device / Zero Cloud Leakage'
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation shortcuts (1-5, ?)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.key === '1') setActiveTab('stream');
      else if (e.key === '2') setActiveTab('habits');
      else if (e.key === '3') setActiveTab('tasks');
      else if (e.key === '4') setActiveTab('recap');
      else if (e.key === '5') setActiveTab('search');
      else if (e.key === '?') setShowShortcuts((prev) => !prev);
      else if (e.key === 'Escape') setShowShortcuts(false);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        engineStatus={engineStatus}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      <main className="main-viewport">
        {activeTab === 'stream' && <ContextStream onDataUpdated={fetchStatus} />}
        {activeTab === 'habits' && <HabitFlow onDataUpdated={fetchStatus} />}
        {activeTab === 'tasks' && <ActionQueue onDataUpdated={fetchStatus} />}
        {activeTab === 'recap' && <DailyRecap />}
        {activeTab === 'search' && <EdgeSearch />}
      </main>

      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
