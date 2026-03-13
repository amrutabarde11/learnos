import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import LogSession from './pages/LogSession';
import Reports from './pages/Reports';
import MasteryMap from './pages/MasteryMap';
import Sidebar from './components/Sidebar';
import Onboarding from './pages/Onboarding';
import './App.css';

const MOCK_USER = {
  name: 'Amruta', learnerType: 'BOTH', dailyTarget: 2,
  goals: [
    { id: 1, title: 'Data Structures & Algorithms', category: 'ACADEMIC', why: 'Crack placements', deadline: '2026-05-01', targetMastery: 'PROFICIENT',
      topics: [{name:'Arrays',mastery:'COMPETENT'},{name:'Linked Lists',mastery:'FAMILIAR'},{name:'Trees & BST',mastery:'EXPOSED'},{name:'Graphs',mastery:'UNAWARE'},{name:'Dynamic Programming',mastery:'UNAWARE'}]},
    { id: 2, title: 'Learn React', category: 'SKILL', why: 'Build real projects', deadline: '2026-04-01', targetMastery: 'COMPETENT',
      topics: [{name:'Hooks',mastery:'FAMILIAR'},{name:'State Management',mastery:'EXPOSED'},{name:'Routing',mastery:'COMPETENT'},{name:'API Integration',mastery:'FAMILIAR'}]},
    { id: 3, title: 'AWS Cloud Practitioner', category: 'CERTIFICATION', why: 'Add cloud skills', deadline: '2026-06-01', targetMastery: 'COMPETENT',
      topics: [{name:'Core Services',mastery:'EXPOSED'},{name:'IAM & Security',mastery:'UNAWARE'},{name:'Pricing & Billing',mastery:'UNAWARE'}]}
  ]
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(MOCK_USER);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOnboardingComplete = (userData) => {
    setUser(userData);
    setShowOnboarding(false);
    setPage('dashboard');
  };

  const handleSessionLogged = () => {
    setRefreshKey(k => k + 1);
  };

  if (showOnboarding) {
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
      <Sidebar page={page} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} user={user} onReset={() => setShowOnboarding(true)} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
