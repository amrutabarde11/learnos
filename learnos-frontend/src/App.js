import React, { useState } from 'react';
import { SignedIn, SignedOut, SignIn, useUser } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import LogSession from './pages/LogSession';
import Reports from './pages/Reports';
import MasteryMap from './pages/MasteryMap';
import Sidebar from './components/Sidebar';
import './App.css';

const DEFAULT_GOALS = [
  { id: 1, title: 'Data Structures & Algorithms', category: 'ACADEMIC', why: 'Crack placements and internships', deadline: '2026-05-01', targetMastery: 'PROFICIENT',
    topics: [{name:'Arrays',mastery:'COMPETENT'},{name:'Linked Lists',mastery:'FAMILIAR'},{name:'Trees & BST',mastery:'EXPOSED'},{name:'Graphs',mastery:'UNAWARE'},{name:'Dynamic Programming',mastery:'UNAWARE'}]},
  { id: 2, title: 'Learn React', category: 'SKILL', why: 'Build real full-stack projects', deadline: '2026-04-01', targetMastery: 'COMPETENT',
    topics: [{name:'Hooks',mastery:'FAMILIAR'},{name:'State Management',mastery:'EXPOSED'},{name:'Routing',mastery:'COMPETENT'},{name:'API Integration',mastery:'FAMILIAR'}]},
  { id: 3, title: 'AWS Cloud Practitioner', category: 'CERTIFICATION', why: 'Add cloud skills to resume', deadline: '2026-06-01', targetMastery: 'COMPETENT',
    topics: [{name:'Core Services',mastery:'EXPOSED'},{name:'IAM & Security',mastery:'UNAWARE'},{name:'Pricing & Billing',mastery:'UNAWARE'}]}
];

function AppInner() {
  const { user } = useUser();
  const [page, setPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const appUser = {
    name: user?.firstName || user?.username || 'Learner',
    goals: DEFAULT_GOALS,
    learnerType: 'BOTH',
    dailyTarget: 2,
    clerkId: user?.id,
  };

  const handleSessionLogged = () => setRefreshKey(k => k + 1);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard user={appUser} refreshKey={refreshKey} />;
      case 'goals': return <Goals user={appUser} />;
      case 'log': return <LogSession user={appUser} onSessionLogged={handleSessionLogged} />;
      case 'mastery': return <MasteryMap user={appUser} />;
      case 'reports': return <Reports user={appUser} />;
      default: return <Dashboard user={appUser} refreshKey={refreshKey} />;
    }
  };

  return (
    <div className={`app-root ${darkMode ? 'dark' : ''}`}>
      <Sidebar page={page} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} user={appUser} onReset={null} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <div style={{
          minHeight: '100vh', background: '#F7F3EC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#1B2A4A', marginBottom: 4 }}>LearnOS</div>
            <div style={{ fontSize: 13, color: '#8A9AB0', marginBottom: 32 }}>Your personal learning intelligence</div>
            <SignIn routing="hash" />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <AppInner />
      </SignedIn>
    </>
  );
}
