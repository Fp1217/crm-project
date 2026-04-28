import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EMPTY = { name: '', email: '', phone: '', company: '', status: 'new', source: 'other', estimatedValue: '', priority: 'medium', notes: '' };

function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead || EMPTY);
  const [loading, setLoading] = useState(false);
  const isEdit = !!lead?._id;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (isEdit) {
        const res = await axios.put(`/api/leads/${lead._id}`, form);
        onSave(res.data, 'edit'); toast.success('Lead updated!');
      } else {
        const res = await axios.post('/api/leads', form);
        onSave(res.data, 'add'); toast.success('Lead added!');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Lead' : 'Add Lead'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" name="company" value={form.company} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                {['new','contacted','qualified','proposal','negotiation','closed_won','closed_lost'].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Est. Value (₹)</label>
              <input className="form-input" type="number" name="estimatedValue" value={form.estimatedValue} onChange={handleChange} placeholder="50000" />
            </div>
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="form-select" name="source" value={form.source} onChange={handleChange}>
                {['website','referral','social','email','cold_call','other'].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update' : 'Add Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/leads', { params: { page, limit: 10, status: statusFilter, priority: priorityFilter } });
      setLeads(res.data.leads); setTotal(res.data.total);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, [page, statusFilter, priorityFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleSave = (lead, type) => {
    if (type === 'add') setLeads(prev => [lead, ...prev]);
    else setLeads(prev => prev.map(l => l._id === lead._id ? lead : l));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axios.delete(`/api/leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
      toast.success('Lead deleted');
    } catch { toast.error('Delete failed'); }
  };

  const pages = Math.ceil(total / 10);

  return (
    <div>
      <div className="toolbar">
        <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {['new','contacted','qualified','proposal','negotiation','closed_won','closed_lost'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
        <select className="filter-select" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Lead</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Leads ({total})</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-text">No leads yet. Start adding leads!</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Company</th><th>Status</th><th>Priority</th><th>Est. Value</th><th>Source</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{l.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.email}</div>
                      </div>
                    </td>
                    <td>{l.company || '—'}</td>
                    <td><span className={`badge badge-${l.status}`}>{l.status.replace(/_/g,' ')}</span></td>
                    <td><span className={`badge badge-${l.priority}`}>{l.priority}</span></td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                      {l.estimatedValue ? `₹${l.estimatedValue.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{l.source.replace(/_/g,' ')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(l)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <LeadModal
          lead={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
