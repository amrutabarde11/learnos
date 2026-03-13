import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import LogSession from './pages/LogSession';
import Reports from './pages/Reports';
import MasteryMap from './pages/MasteryMap';
import Sidebar from './components/Sidebar';
import Onboarding from './pages/Onboarding';
import './App.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('learnos_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setLoading(false);
      return;
    }
    fetch('http://localhost:8080/api/users/me')
      .then(r => r.json())
      .then(data => {
        if (data.exists) {
          setUser(data);
          localStorage.setItem('learnos_user', JSON.stringify(data));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F3EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'sans-serif', color: '#8A9AB0' }}>Loading LearnOS...</p>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={(u) => setUser(u)} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'goals': return <Goals user={user} />;
      case 'log': return <LogSession user={user} />;
      case 'mastery': return <MasteryMap user={user} />;
      case 'reports': return <Reports user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className={`app-root ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        page={page}
        setPage={setPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onReset={() => { localStorage.removeItem('learnos_user'); setUser(null); }}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
