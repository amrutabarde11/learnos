import React, { useState } from 'react';

const MASTERY_ORDER = ['UNAWARE', 'EXPOSED', 'FAMILIAR', 'COMPETENT', 'PROFICIENT', 'MASTERED'];
const CATEGORIES = ['ACADEMIC', 'SKILL', 'CERTIFICATION', 'KNOWLEDGE'];
const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function MasteryBadge({ level }) {
  const icons = { UNAWARE: '○', EXPOSED: '◔', FAMILIAR: '◑', COMPETENT: '◕', PROFICIENT: '●', MASTERED: '★' };
  return <span className={`mastery-badge ${level}`}>{icons[level]} {level}</span>;
}

function GoalDetail({ goal, onClose }) {
  const done = goal.topics?.filter(t => ['COMPETENT','PROFICIENT','MASTERED'].includes(t.mastery)).length || 0;
  const total = goal.topics?.length || 1;
  const progress = Math.round((done / total) * 100);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(27,42,74,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div className="card" style={{ width:520, maxHeight:'80vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <span className={`goal-category category-${goal.category}`}>{goal.category}</span>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, marginTop:8 }}>{goal.title}</h2>
            {goal.why && <p style={{ fontSize:13, color:'var(--text-muted)', fontStyle:'italic', marginTop:4 }}>"{goal.why}"</p>}
          </div>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:20, cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-muted)', marginBottom:8 }}>
            <span>Progress toward {goal.targetMastery}</span>
            <span>{progress}%</span>
          </div>
          <div className="goal-progress-bar-track" style={{ height:8 }}>
            <div className="goal-progress-bar-fill" style={{ width:`${progress}%` }} />
          </div>
        </div>
        <div className="divider" />
        <div style={{ fontWeight:600, fontSize:13, color:'var(--text-secondary)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.8px' }}>Topics</div>
        {goal.topics?.map(t => (
          <div key={t.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--card-border)' }}>
            <span style={{ fontSize:14, color:'var(--text-primary)' }}>{t.name}</span>
            <MasteryBadge level={t.mastery} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Goals({ user, onUpdateUser }) {
  const goals = user?.goals || [];
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGoal, setNewGoal] = useState({ title:'', category:'SKILL', why:'', deadline:'', targetMastery:'COMPETENT' });
  const [topics, setTopics] = useState([{ name:'', mastery:'UNAWARE' }]);

  const addTopic = () => setTopics([...topics, { name:'', mastery:'UNAWARE' }]);
  const updateTopic = (i, field, val) => { const t = [...topics]; t[i] = { ...t[i], [field]: val }; setTopics(t); };
  const removeTopic = (i) => setTopics(topics.filter((_,idx) => idx !== i));

  const handleCreate = async () => {
    if (!newGoal.title.trim()) return;
    setSaving(true);
    const validTopics = topics.filter(t => t.name.trim());
    const goal = {
      id: Date.now(),
      ...newGoal,
      topics: validTopics.length > 0 ? validTopics : [{ name: newGoal.title, mastery: 'UNAWARE' }]
    };
    const updatedGoals = [...goals, goal];
    const updatedUser = { ...user, goals: updatedGoals };

    // Save to backend
    try {
      await fetch(`${API}/users/goals?userId=${user.clerkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
    } catch(e) { console.error(e); }

    // Update local state
    if (onUpdateUser) onUpdateUser(updatedUser);
    setShowAdd(false);
    setNewGoal({ title:'', category:'SKILL', why:'', deadline:'', targetMastery:'COMPETENT' });
    setTopics([{ name:'', mastery:'UNAWARE' }]);
    setSaving(false);
  };

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-greeting">Your <em>Goals</em></h1>
          <p className="page-subtitle">{goals.length} active · Click any goal to see topic breakdown</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>＋ New Goal</button>
      </div>

      {goals.length === 0 && (
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>◎</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--text-secondary)', marginBottom:8 }}>No goals yet</div>
          <div style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>Add your first goal to start tracking progress</div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>＋ Add Goal</button>
        </div>
      )}

      <div className="grid-3">
        {goals.map(g => {
          const done = g.topics?.filter(t => ['COMPETENT','PROFICIENT','MASTERED'].includes(t.mastery)).length || 0;
          const total = g.topics?.length || 1;
          const progress = Math.round((done / total) * 100);
          return (
            <div key={g.id} className="goal-card fade-up" onClick={() => setSelected(g)}>
              <span className={`goal-category category-${g.category}`}>{g.category}</span>
              <div className="goal-title">{g.title}</div>
              {g.why && <div className="goal-why">"{g.why}"</div>}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                {g.topics?.slice(0,4).map(t => <MasteryBadge key={t.name} level={t.mastery} />)}
                {g.topics?.length > 4 && <span style={{ fontSize:11, color:'var(--text-muted)', padding:'3px 0' }}>+{g.topics.length - 4} more</span>}
              </div>
              <div className="goal-progress-bar-track">
                <div className="goal-progress-bar-fill" style={{ width:`${progress}%` }} />
              </div>
              <div className="goal-progress-label">
                <span>Progress</span><span>{progress}%</span>
              </div>
              {g.deadline && (
                <div style={{ marginTop:12, fontSize:12, color:'var(--text-muted)' }}>
                  📅 Due: {new Date(g.deadline).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected && <GoalDetail goal={selected} onClose={() => setSelected(null)} />}

      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(27,42,74,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }}
          onClick={() => setShowAdd(false)}>
          <div className="card" style={{ width:480, maxHeight:'85vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:22 }}>New Learning Goal</h2>
              <button onClick={() => setShowAdd(false)} style={{ border:'none', background:'none', fontSize:20, cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">What do you want to learn?</label>
              <input className="form-input" placeholder="e.g. Learn React, Pass AWS exam..." value={newGoal.title} onChange={e => setNewGoal({...newGoal, title:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setNewGoal({...newGoal, category:c})}
                    style={{ padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit', fontWeight:600,
                      background:newGoal.category===c?'#1B2A4A':'#F0EBE0', color:newGoal.category===c?'white':'#5A6A80' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Why does this matter to you?</label>
              <textarea className="form-textarea" placeholder="Your motivation — shown back when you're slipping..." value={newGoal.why} onChange={e => setNewGoal({...newGoal, why:e.target.value})} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input type="date" className="form-input" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Mastery</label>
                <select className="form-select" value={newGoal.targetMastery} onChange={e => setNewGoal({...newGoal, targetMastery:e.target.value})}>
                  {MASTERY_ORDER.slice(2).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="divider" />
            <div style={{ fontWeight:600, fontSize:13, color:'var(--text-secondary)', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.8px' }}>Topics</div>
            {topics.map((t, i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:10, alignItems:'center' }}>
                <input className="form-input" style={{ flex:2 }} value={t.name} onChange={e => updateTopic(i,'name',e.target.value)} placeholder={`Topic ${i+1}`} />
                <select className="form-select" style={{ flex:1 }} value={t.mastery} onChange={e => updateTopic(i,'mastery',e.target.value)}>
                  {MASTERY_ORDER.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {topics.length > 1 && (
                  <button onClick={() => removeTopic(i)} style={{ padding:'8px 10px', borderRadius:8, border:'none', background:'#F0EBE0', color:'#C9857A', cursor:'pointer' }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={addTopic} style={{ width:'100%', padding:'10px', borderRadius:10, border:'1.5px dashed rgba(27,42,74,0.2)', background:'transparent', color:'#5A6A80', cursor:'pointer', fontFamily:'inherit', fontSize:13, marginBottom:20 }}>
              + Add topic
            </button>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={handleCreate} disabled={saving || !newGoal.title.trim()}>
              {saving ? 'Saving...' : 'Create Goal ✦'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
