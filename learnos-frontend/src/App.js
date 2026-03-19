import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignIn, useUser } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import LogSession from './pages/LogSession';
import Reports from './pages/Reports';
import MasteryMap from './pages/MasteryMap';
import Sidebar from './components/Sidebar';
import './App.css';

const CATEGORIES = ['ACADEMIC','SKILL','CERTIFICATION','KNOWLEDGE'];
const MASTERY_LEVELS = ['UNAWARE','EXPOSED','FAMILIAR','COMPETENT','PROFICIENT','MASTERED'];

function Onboarding({ clerkUser, onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(clerkUser?.firstName || '');
  const [learnerType, setLearnerType] = useState('BOTH');
  const [dailyTarget, setDailyTarget] = useState(2);
  const [goal, setGoal] = useState({ title:'', category:'ACADEMIC', why:'', deadline:'', targetMastery:'COMPETENT' });
  const [topics, setTopics] = useState([{ name:'', mastery:'UNAWARE' }]);

  const addTopic = () => setTopics([...topics, { name:'', mastery:'UNAWARE' }]);
  const updateTopic = (i, field, val) => { const t = [...topics]; t[i] = { ...t[i], [field]: val }; setTopics(t); };
  const removeTopic = (i) => setTopics(topics.filter((_,idx) => idx !== i));

  const handleFinish = async () => {
    const validTopics = topics.filter(t => t.name.trim());
    const firstGoal = {
      id: 1,
      title: goal.title || 'My First Goal',
      category: goal.category,
      why: goal.why,
      deadline: goal.deadline,
      targetMastery: goal.targetMastery,
      topics: validTopics.length > 0 ? validTopics : [{ name: goal.title || 'General', mastery: 'UNAWARE' }]
    };
    const userData = {
      userId: clerkUser?.id,
      name: name || clerkUser?.firstName || 'Learner',
      learnerType,
      dailyTarget,
      goals: [firstGoal]
    };
    localStorage.setItem(`learnos_user_${clerkUser?.id}`, JSON.stringify(userData));
    try {
      await fetch((process.env.REACT_APP_API_URL || 'http://localhost:8080/api') + '/users/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    } catch(e) { console.error('Could not sync user to backend', e); }
    onComplete(userData);
  };

  const inputStyle = { width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid rgba(27,42,74,0.15)', background:'white', fontFamily:'inherit', fontSize:14, color:'#1B2A4A', boxSizing:'border-box', outline:'none' };
  const btnPrimary = { padding:'13px 28px', borderRadius:12, border:'none', background:'#1B2A4A', color:'white', fontSize:15, fontFamily:'inherit', fontWeight:600, cursor:'pointer' };
  const btnOutline = { padding:'13px 28px', borderRadius:12, border:'1.5px solid rgba(27,42,74,0.2)', background:'transparent', color:'#5A6A80', fontSize:15, fontFamily:'inherit', cursor:'pointer' };
  const wrap = { minHeight:'100vh', background:'#F7F3EC', display:'flex', alignItems:'center', justifyContent:'center' };
  const card = { background:'white', borderRadius:20, padding:32, boxShadow:'0 4px 32px rgba(27,42,74,0.08)', maxWidth:520, width:'100%' };

  if (step === 1) return (
    <div style={wrap}>
      <div style={{ maxWidth:520, width:'100%', padding:'0 20px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, color:'#1B2A4A', marginBottom:6 }}>Welcome to LearnOS</div>
          <div style={{ color:'#8A9AB0', fontSize:14 }}>Let's set you up. Takes 2 minutes.</div>
        </div>
        <div style={card}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5A6A80', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>What should we call you?</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5A6A80', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>How do you learn?</label>
            {['VISUAL','READING','BOTH'].map(t => (
              <button key={t} onClick={() => setLearnerType(t)}
                style={{ marginRight:8, marginBottom:8, padding:'8px 18px', borderRadius:20, border:'none', cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:600,
                  background:learnerType===t?'#1B2A4A':'#F0EBE0', color:learnerType===t?'white':'#5A6A80' }}>
                {t === 'BOTH' ? 'Both' : t === 'VISUAL' ? 'Visual' : 'Reading/Writing'}
              </button>
            ))}
          </div>
          <div style={{ marginBottom:28 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5A6A80', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Daily study target (hours)</label>
            <div style={{ display:'flex', gap:8 }}>
              {[1,1.5,2,3,4].map(h => (
                <button key={h} onClick={() => setDailyTarget(h)}
                  style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:14, fontFamily:'inherit', fontWeight:600,
                    background:dailyTarget===h?'#1B2A4A':'#F0EBE0', color:dailyTarget===h?'white':'#5A6A80' }}>
                  {h}h
                </button>
              ))}
            </div>
          </div>
          <button style={{ ...btnPrimary, width:'100%' }} onClick={() => setStep(2)} disabled={!name.trim()}>Continue →</button>
        </div>
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={wrap}>
      <div style={{ maxWidth:520, width:'100%', padding:'0 20px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:'#1B2A4A', marginBottom:6 }}>Your first learning goal</div>
          <div style={{ color:'#8A9AB0', fontSize:14 }}>You can add more later</div>
        </div>
        <div style={card}>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5A6A80', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Goal title</label>
            <input style={inputStyle} value={goal.title} onChange={e => setGoal({...goal, title:e.target.value})} placeholder="e.g. Learn React, Master DSA..." />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5A6A80', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Category</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setGoal({...goal, category:c})}
                  style={{ padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600,
                    background:goal.category===c?'#1B2A4A':'#F0EBE0', color:goal.category===c?'white':'#5A6A80' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5A6A80', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Why this goal?</label>
            <input style={inputStyle} value={goal.why} onChange={e => setGoal({...goal, why:e.target.value})} placeholder="e.g. Crack placements, get internship..." />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5A6A80', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Deadline</label>
              <input type="date" style={inputStyle} value={goal.deadline} onChange={e => setGoal({...goal, deadline:e.target.value})} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5A6A80', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Target mastery</label>
              <select style={inputStyle} value={goal.targetMastery} onChange={e => setGoal({...goal, targetMastery:e.target.value})}>
                {MASTERY_LEVELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button style={btnOutline} onClick={() => setStep(1)}>← Back</button>
            <button style={{ ...btnPrimary, flex:1 }} onClick={() => setStep(3)} disabled={!goal.title.trim()}>Add Topics →</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <div style={{ maxWidth:520, width:'100%', padding:'0 20px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:'#1B2A4A', marginBottom:6 }}>Topics in "{goal.title}"</div>
          <div style={{ color:'#8A9AB0', fontSize:14 }}>What specific topics does this goal cover?</div>
        </div>
        <div style={card}>
          {topics.map((t, i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center' }}>
              <input style={{ ...inputStyle, flex:2 }} value={t.name} onChange={e => updateTopic(i,'name',e.target.value)} placeholder={`Topic ${i+1}`} />
              <select style={{ ...inputStyle, flex:1 }} value={t.mastery} onChange={e => updateTopic(i,'mastery',e.target.value)}>
                {MASTERY_LEVELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {topics.length > 1 && (
                <button onClick={() => removeTopic(i)} style={{ padding:'8px 12px', borderRadius:8, border:'none', background:'#F0EBE0', color:'#C9857A', cursor:'pointer', fontSize:16 }}>✕</button>
              )}
            </div>
          ))}
          <button onClick={addTopic} style={{ ...btnOutline, width:'100%', marginBottom:24, fontSize:13 }}>+ Add topic</button>
          <div style={{ display:'flex', gap:12 }}>
            <button style={btnOutline} onClick={() => setStep(2)}>← Back</button>
            <button style={{ ...btnPrimary, flex:1 }} onClick={handleFinish}>Let's go ✦</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const { user } = useUser();
  const [page, setPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('learnos_dark') === 'true');
  const [refreshKey, setRefreshKey] = useState(0);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  if (!user?.id) return;
  const fetchUser = async () => {
    const stored = localStorage.getItem(`learnos_user_${user.id}`);
    if (stored) {
      setAppUser(JSON.parse(stored));
      setLoading(false);
      return;
    }
    try {
      const r = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:8080/api') + `/users/me?userId=${user.id}`);
      const data = await r.json();
      if (data.exists) {
        localStorage.setItem(`learnos_user_${user.id}`, JSON.stringify(data));
        setAppUser(data);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };
  fetchUser();
}, [user?.id]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('learnos_dark', String(next));
  };

  const handleSessionLogged = () => {
    setRefreshKey(k => k + 1);
    setPage('dashboard');
  };

  const handleUpdateUser = (updated) => {
    setAppUser(updated);
    localStorage.setItem(`learnos_user_${user.id}`, JSON.stringify(updated));
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#F7F3EC', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#8A9AB0' }}>Loading...</div>
    </div>
  );

  if (!appUser) return <Onboarding clerkUser={user} onComplete={setAppUser} />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard user={appUser} refreshKey={refreshKey} />;
      case 'goals':     return <Goals user={appUser} onUpdateUser={handleUpdateUser} />;
      case 'log':       return <LogSession user={appUser} onSessionLogged={handleSessionLogged} />;
      case 'mastery':   return <MasteryMap user={appUser} />;
      case 'reports':   return <Reports user={appUser} />;
      default:          return <Dashboard user={appUser} refreshKey={refreshKey} />;
    }
  };

  return (
    <div className={`app-root ${darkMode ? 'dark' : ''}`}>
      <Sidebar page={page} setPage={setPage} darkMode={darkMode} setDarkMode={toggleDark} user={appUser}
        onReset={() => { localStorage.removeItem(`learnos_user_${user.id}`); setAppUser(null); }} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <div style={{ minHeight:'100vh', background:'#F7F3EC', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, color:'#1B2A4A', marginBottom:4 }}>LearnOS</div>
            <div style={{ fontSize:13, color:'#8A9AB0', marginBottom:32 }}>Your personal learning intelligence</div>
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
