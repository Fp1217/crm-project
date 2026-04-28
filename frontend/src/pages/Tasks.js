import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EMPTY = { title: '', description: '', dueDate: '', priority: 'medium', status: 'pending', type: 'other' };

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task || EMPTY);
  const [loading, setLoading] = useState(false);
  const isEdit = !!task?._id;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (isEdit) {
        const res = await axios.put(`/api/tasks/${task._id}`, form);
        onSave(res.data, 'edit'); toast.success('Task updated!');
      } else {
        const res = await axios.post('/api/tasks', form);
        onSave(res.data, 'add'); toast.success('Task created!');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" name="title" value={form.title} onChange={handleChange} required placeholder="Task title..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                {['call','email','meeting','follow_up','other'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="datetime-local" name="dueDate" value={form.dueDate?.substring(0,16) || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Task details..." />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TYPE_ICONS = { call: '📞', email: '📧', meeting: '🗓', follow_up: '🔄', other: '📌' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tasks', { params: { status: statusFilter, priority: priorityFilter } });
      setTasks(res.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [statusFilter, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = (task, type) => {
    if (type === 'add') setTasks(prev => [task, ...prev]);
    else setTasks(prev => prev.map(t => t._id === task._id ? task : t));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await axios.put(`/api/tasks/${task._id}`, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));
    } catch { toast.error('Failed to update'); }
  };

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div>
      <div className="toolbar">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ New Task</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Tasks ({tasks.length})</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {tasks.filter(t => t.status === 'completed').length} completed
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <div className="empty-state-text">No tasks found. Create your first task!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map(task => (
              <div key={task._id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', background: 'var(--bg-hover)',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${isOverdue(task) ? 'rgba(255,84,112,0.3)' : 'var(--border)'}`,
                opacity: task.status === 'completed' ? 0.6 : 1,
                transition: 'all 0.2s'
              }}>
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task)}
                  style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: task.status === 'completed' ? 'var(--accent-green)' : 'transparent',
                    border: `2px solid ${task.status === 'completed' ? 'var(--accent-green)' : 'var(--border-light)'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 11, transition: 'all 0.15s'
                  }}
                >{task.status === 'completed' ? '✓' : ''}</button>

                <span style={{ fontSize: 16 }}>{TYPE_ICONS[task.type] || '📌'}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: 14,
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    color: task.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)'
                  }}>{task.title}</div>
                  {task.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  <span className={`badge badge-${task.status}`}>{task.status.replace(/_/g,' ')}</span>
                  {task.dueDate && (
                    <span style={{ fontSize: 11, color: isOverdue(task) ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                      {isOverdue(task) ? '⚠ ' : ''}
                      {new Date(task.dueDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                    </span>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => setModal(task)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <TaskModal
          task={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
