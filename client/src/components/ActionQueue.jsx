import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Clock, 
  AlertCircle, 
  Filter, 
  CheckCircle,
  PlayCircle,
  CircleDot
} from 'lucide-react';

export default function ActionQueue({ onDataUpdated }) {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [contextFilter, setContextFilter] = useState('all');
  
  // Quick task creation
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newContext, setNewContext] = useState('@dev');

  useEffect(() => {
    loadTasks();
  }, [statusFilter, contextFilter]);

  const loadTasks = async () => {
    try {
      let url = '/api/tasks?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (contextFilter !== 'all') url += `context=${contextFilter}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          priority: newPriority,
          context_tag: newContext,
          status: 'pending'
        })
      });

      if (res.ok) {
        setNewTitle('');
        loadTasks();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (e) {
      console.error('Create task failed', e);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadTasks();
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      console.error('Update status failed', e);
    }
  };

  const handleUpdatePriority = async (id, newPriority) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority })
      });
      loadTasks();
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      console.error('Update priority failed', e);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      loadTasks();
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      console.error('Delete task failed', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Quick Add Task Bar */}
      <form onSubmit={handleCreateTask} className="m-card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: '240px' }}
            placeholder="Add new action item into queue (e.g. Implement edge test suite)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            <option value="high">🔥 High Priority</option>
            <option value="medium">⚡ Medium Priority</option>
            <option value="low">🌱 Low Priority</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
          >
            <option value="@dev">@dev</option>
            <option value="@work">@work</option>
            <option value="@academic">@academic</option>
            <option value="@personal">@personal</option>
          </select>

          <button type="submit" className="btn-primary">
            <Plus size={15} />
            <span>Add Task</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'blocked', label: 'Blocked' }
          ].map((tab) => (
            <button
              key={tab.id}
              className="btn-ghost"
              style={{
                fontSize: '0.78rem',
                border: statusFilter === tab.id ? '1px solid #3b82f6' : '1px solid transparent',
                background: statusFilter === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: statusFilter === tab.id ? '#60a5fa' : 'var(--text-secondary)'
              }}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Context Tag Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TAG:</span>
          {['all', '@dev', '@work', '@academic', '@personal'].map((ctx) => (
            <button
              key={ctx}
              className="btn-ghost"
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: contextFilter === ctx ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                color: contextFilter === ctx ? '#c084fc' : 'var(--text-secondary)'
              }}
              onClick={() => setContextFilter(ctx)}
            >
              {ctx}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="m-card" style={{ padding: '0.5rem' }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <CheckSquare size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.88rem' }}>No tasks found in this view.</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Add a task above or capture unstructured notes in Context Stream.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {tasks.map((task) => {
              const isDone = task.status === 'completed';
              const isBlocked = task.status === 'blocked';
              const isInProgress = task.status === 'in_progress';

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: isDone ? 'rgba(15, 23, 42, 0.5)' : '#11192e',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    opacity: isDone ? 0.65 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    {/* Status Toggle Button */}
                    <button
                      className="btn-ghost"
                      style={{ padding: 0 }}
                      onClick={() => handleUpdateStatus(task.id, isDone ? 'pending' : 'completed')}
                      title={isDone ? 'Mark Pending' : 'Mark Completed'}
                    >
                      {isDone ? (
                        <CheckCircle size={18} color="#10b981" />
                      ) : isInProgress ? (
                        <PlayCircle size={18} color="#3b82f6" />
                      ) : isBlocked ? (
                        <AlertCircle size={18} color="#f43f5e" />
                      ) : (
                        <CircleDot size={18} color="#64748b" />
                      )}
                    </button>

                    {/* Task Title */}
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 500,
                        textDecoration: isDone ? 'line-through' : 'none',
                        color: isDone ? 'var(--text-muted)' : '#f8fafc',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {task.title}
                    </span>

                    {/* Priority Selector Pill */}
                    <select
                      value={task.priority || 'medium'}
                      onChange={(e) => handleUpdatePriority(task.id, e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="high">HIGH</option>
                      <option value="medium">MED</option>
                      <option value="low">LOW</option>
                    </select>

                    <span className={`priority-badge priority-${task.priority || 'medium'}`}>
                      {task.priority || 'medium'}
                    </span>

                    {/* Context Tag */}
                    <span className="context-badge">{task.context_tag || '@dev'}</span>

                    {task.due_date && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Clock size={11} />
                        {task.due_date}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Status Dropdown */}
                    <select
                      className="form-select"
                      style={{ padding: '2px 6px', fontSize: '0.72rem', width: 'auto' }}
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>

                    {/* Delete */}
                    <button
                      className="btn-ghost"
                      onClick={() => handleDeleteTask(task.id)}
                      style={{ color: '#ef4444', padding: '2px 4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
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
