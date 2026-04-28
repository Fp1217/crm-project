import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '▦', label: 'Dashboard' },
  { path: '/customers', icon: '👥', label: 'Customers' },
  { path: '/leads', icon: '🎯', label: 'Leads' },
  { path: '/deals', icon: '💼', label: 'Deals' },
  { path: '/tasks', icon: '✓', label: 'Tasks' },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/leads': 'Leads',
  '/deals': 'Deal Pipeline',
  '/tasks': 'Tasks',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'CRM';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">C</div>
          <span className="logo-text">CRM<span>Pro</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Main Menu</div>
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">⎋</button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-actions">
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
