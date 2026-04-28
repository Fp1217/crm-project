import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EMPTY = { name: '', email: '', phone: '', company: '', address: '', city: '', status: 'prospect', source: 'other', notes: '' };

function CustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState(customer || EMPTY);
  const [loading, setLoading] = useState(false);
  const isEdit = !!customer?._id;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (isEdit) {
        const res = await axios.put(`/api/customers/${customer._id}`, form);
        onSave(res.data, 'edit');
        toast.success('Customer updated!');
      } else {
        const res = await axios.post('/api/customers', form);
        onSave(res.data, 'add');
        toast.success('Customer added!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving customer');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Customer' : 'Add Customer'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="john@company.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" name="company" value={form.company} onChange={handleChange} placeholder="Company Ltd." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="form-select" name="source" value={form.source} onChange={handleChange}>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social">Social Media</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" name="city" value={form.city} onChange={handleChange} placeholder="Ahmedabad" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes..." />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update' : 'Add Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | customer object

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/customers', { params: { page, limit: 10, search, status: statusFilter } });
      setCustomers(res.data.customers);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSave = (customer, type) => {
    if (type === 'add') setCustomers(prev => [customer, ...prev]);
    else setCustomers(prev => prev.map(c => c._id === customer._id ? customer : c));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await axios.delete(`/api/customers/${id}`);
      setCustomers(prev => prev.filter(c => c._id !== id));
      toast.success('Customer deleted');
    } catch { toast.error('Delete failed'); }
  };

  const pages = Math.ceil(total / 10);

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
        </select>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Customer</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Customers ({total})</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">No customers found. Add your first customer!</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Company</th>
                  <th>City</th><th>Status</th><th>Source</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{c.name.charAt(0)}</div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                    <td>{c.company || '—'}</td>
                    <td>{c.city || '—'}</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{c.source}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Del</button>
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
        <CustomerModal
          customer={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
