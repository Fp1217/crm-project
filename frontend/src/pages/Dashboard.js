import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4f8aff', '#7c5cff', '#00e5a0', '#ffb547', '#ff5470'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen" style={{minHeight: 300}}><div className="spinner"/></div>;

  const monthlyData = stats?.monthlyDeals?.map(d => ({
    name: MONTHS[d._id.month - 1],
    deals: d.count,
    value: d.value
  })) || [];

  const pieData = stats?.leadsByStatus?.map(d => ({
    name: d._id?.replace(/_/g,' '),
    value: d.count
  })) || [];

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">👥</div>
          <div className="stat-value">{stats?.totalCustomers ?? 0}</div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-change up">↑ {stats?.activeCustomers ?? 0} active</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple">🎯</div>
          <div className="stat-value">{stats?.totalLeads ?? 0}</div>
          <div className="stat-label">Total Leads</div>
          <div className="stat-change up">↑ {stats?.newLeadsThisMonth ?? 0} this month</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">💰</div>
          <div className="stat-value">₹{((stats?.totalRevenue ?? 0) / 100000).toFixed(1)}L</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-change up">↑ {stats?.wonDeals ?? 0} won deals</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">✓</div>
          <div className="stat-value">{stats?.pendingTasks ?? 0}</div>
          <div className="stat-label">Pending Tasks</div>
          <div className="stat-change down">Needs attention</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Monthly Deal Pipeline</span>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" />
                <XAxis dataKey="name" tick={{ fill: '#8896b3', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8896b3', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#141d2f', border: '1px solid #1e2d47', borderRadius: 8 }}
                  labelStyle={{ color: '#e8edf5' }}
                />
                <Bar dataKey="deals" fill="#4f8aff" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">No deal data yet. Add deals to see analytics.</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Leads by Status</span>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#141d2f', border: '1px solid #1e2d47', borderRadius: 8 }}
                  labelStyle={{ color: '#e8edf5' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-text">No leads data yet.</div>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {pieData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
