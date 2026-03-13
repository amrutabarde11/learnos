import React from 'react';

const navItems = [
  { id: 'dashboard', icon: '✦', label: 'Home' },
  { id: 'goals', icon: '◎', label: 'Goals' },
  { id: 'log', icon: '＋', label: 'Log Session' },
  { id: 'mastery', icon: '⬡', label: 'Mastery Map' },
  { id: 'reports', icon: '↗', label: 'Reports' },
];

export default function Sidebar({ page, setPage, darkMode, setDarkMode, user, onReset }) {
  return (
    <nav className="sidebar">
      <div>
        <div className="sidebar-logo">LearnOS</div>
        <div className="sidebar-tagline">Your learning intelligence</div>
      </div>

      {user && (
        <div style={{
          padding: '10px 14px', marginBottom: 20,
          background: 'rgba(247,243,236,0.08)', borderRadius: 10,
        }}>
          <div style={{ fontSize: 12, color: 'rgba(247,243,236,0.45)', marginBottom: 2 }}>Signed in as</div>
          <div style={{ fontSize: 14, color: 'rgba(247,243,236,0.9)', fontWeight: 600 }}>{user.name}</div>
          {user.goals && (
            <div style={{ fontSize: 11, color: 'rgba(247,243,236,0.4)', marginTop: 2 }}>
              {user.goals.length} active goal{user.goals.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <div className="nav-section-label">Navigation</div>

      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${page === item.id ? 'active' : ''}`}
          onClick={() => setPage(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div className="sidebar-bottom">
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          <span>{darkMode ? '☀' : '◑'}</span>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        {onReset && (
          <button className="dark-toggle" onClick={onReset} style={{ color: 'rgba(201,133,122,0.6)' }}>
            <span>↺</span>
            Reset Profile
          </button>
        )}
      </div>
    </nav>
  );
}