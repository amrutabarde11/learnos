import React, { useState } from 'react';
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
  const [user, setUser] = useState(null); // null = show onboarding
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOnboardingComplete = (userData) => {
    setUser(userData);
  };

  const handleSessionLogged = () => {
    setRefreshKey(k => k + 1);
  };

  // Show onboarding if no user yet
  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard user={user} refreshKey={refreshKey} />;
      case 'goals': return <Goals user={user} onUpdateUser={setUser} />;
      case 'log': return <LogSession user={user} onSessionLogged={handleSessionLogged} />;
      case 'mastery': return <MasteryMap user={user} />;
      case 'reports': return <Reports user={user} />;
      default: return <Dashboard user={user} refreshKey={refreshKey} />;
    }
  };

  return (
    <div className={`app-root ${darkMode ? 'dark' : ''}`}>
      <Sidebar page={page} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} user={user} onReset={() => setUser(null)} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
