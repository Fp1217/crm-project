import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const STAGES = [
  { key: 'prospecting', label: 'Prospecting', color: '#4f8aff' },
  { key: 'qualification', label: 'Qualification', color: '#7c5cff' },
  { key: 'proposal', label: 'Proposal', color: '#ffb547' },
  { key: 'negotiation', label: 'Negotiation', color: '#ff8547' },
  { key: 'closed_won', label: 'Closed Won', color: '#00e5a0' },
  { key: 'closed_lost', label: 'Closed Lost', color: '#ff5470' },
];

function DealModal({ deal, customers, onClose, onSave }) {
  const EMPTY = { title: '', customer: '', value: '', stage: 'prospecting', probability: 0, expectedCloseDate: '', description: '' };
  const [form, setForm] = useState(deal ? { ...deal, customer: deal.customer?._id || deal.customer } : EMPTY);
  const [loading, setLoading] = useState(false);
  const isEdit = !!deal?._id;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (isEdit) {
        const res = await axios.put(`/api/deals/${deal._id}`, form);
        onSave(res.data, 'edit'); toast.success('Deal updated!');
      } else {
        const res = await axios.post('/api/deals', form);
        onSave(res.data, 'add'); toast.success('Deal added!');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Deal' : 'New Deal'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Deal Title *</label>
            <input className="form-input" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Enterprise Software License" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select className="form-select" name="customer" value={form.customer} onChange={handleChange} required>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name} — {c.company || c.email}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Value (₹) *</label>
              <input className="form-input" type="number" name="value" value={form.value} onChange={handleChange} required placeholder="100000" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="form-select" name="stage" value={form.stage} onChange={handleChange}>
                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Probability (%)</label>
              <input className="form-input" type="number" name="probability" min="0" max="100" value={form.probability} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Expected Close Date</label>
            <input className="form-input" type="date" name="expectedCloseDate" value={form.expectedCloseDate?.substring(0,10) || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update' : 'Create Deal'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/deals'),
      axios.get('/api/customers', { params: { limit: 100 } })
    ]).then(([dealsRes, custRes]) => {
      setDeals(dealsRes.data);
      setCustomers(custRes.data.customers);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (deal, type) => {
    if (type === 'add') setDeals(prev => [deal, ...prev]);
    else setDeals(prev => prev.map(d => d._id === deal._id ? deal : d));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    try {
      await axios.delete(`/api/deals/${id}`);
      setDeals(prev => prev.filter(d => d._id !== id));
      toast.success('Deal deleted');
    } catch { toast.error('Delete failed'); }
  };

  const getDealsByStage = (stage) => deals.filter(d => d.stage === stage);
  const totalPipelineValue = deals.filter(d => !['closed_won','closed_lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0);

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>;

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 150, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Total Deals</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{deals.length}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 150, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Pipeline Value</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--accent)' }}>₹{totalPipelineValue.toLocaleString('en-IN')}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 150, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Won Revenue</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--accent-green)' }}>₹{wonValue.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => setModal('add')}>+ New Deal</button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="pipeline-board">
        {STAGES.map(stage => {
          const stageDeals = getDealsByStage(stage.key);
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage.key} className="pipeline-column">
              <div className="pipeline-col-header">
                <span className="pipeline-col-title" style={{ color: stage.color }}>{stage.label}</span>
                <span className="pipeline-col-count">{stageDeals.length}</span>
              </div>
              {stageValue > 0 && (
                <div style={{ padding: '6px 14px', fontSize: 11, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                  ₹{stageValue.toLocaleString('en-IN')}
                </div>
              )}
              <div className="pipeline-cards">
                {stageDeals.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--text-muted)' }}>No deals</div>
                )}
                {stageDeals.map(deal => (
                  <div key={deal._id} className="pipeline-card">
                    <div className="pipeline-card-title">{deal.title}</div>
                    <div className="pipeline-card-company">{deal.customer?.name || '—'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="pipeline-card-value">₹{deal.value?.toLocaleString('en-IN')}</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(deal)} style={{ padding: '3px 8px', fontSize: 11 }}>✎</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deal._id)} style={{ padding: '3px 8px', fontSize: 11 }}>×</button>
                      </div>
                    </div>
                    {deal.probability > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${deal.probability}%`, background: stage.color, borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{deal.probability}% probability</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <DealModal
          deal={modal === 'add' ? null : modal}
          customers={customers}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
