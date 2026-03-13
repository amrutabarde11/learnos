import React, { useState } from 'react';

const MASTERY_ORDER = ['UNAWARE','EXPOSED','FAMILIAR','COMPETENT','PROFICIENT','MASTERED'];
const MASTERY_ICONS = { UNAWARE:'○', EXPOSED:'◔', FAMILIAR:'◑', COMPETENT:'◕', PROFICIENT:'●', MASTERED:'★' };
const CAT_COLORS = { ACADEMIC:'#8B7BAD', SKILL:'#7A9E87', CERTIFICATION:'#C4A84F', KNOWLEDGE:'#C9857A' };

export default function Goals({ user }) {
  const [goals, setGoals] = useState(user?.goals || []);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title:'', category:'SKILL', why:'', deadline:'', targetMastery:'COMPETENT', topics:[] });
  const [topicInput, setTopicInput] = useState('');

  const addTopic = (name) => {
    if (!name.trim() || newGoal.topics.find(t => t.name === name)) return;
    setNewGoal(g => ({ ...g, topics: [...g.topics, { name: name.trim(), mastery: 'UNAWARE', priority: 'MEDIUM' }] }));
    setTopicInput('');
  };

  const saveGoal = () => {
    if (!newGoal.title) return;
    const updated = [...goals, { ...newGoal, id: goals.length + 1 }];
    setGoals(updated);
    localStorage.setItem('learnos_user', JSON.stringify({ ...user, goals: updated }));
    setShowAdd(false);
    setNewGoal({ title:'', category:'SKILL', why:'', deadline:'', targetMastery:'COMPETENT', topics:[] });
    setTopicInput('');
  };

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-greeting">Your <em>Goals</em></h1>
          <p className="page-subtitle">{goals.length} active · Click any goal to see topics</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>＋ New Goal</button>
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>◎</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text-secondary)', marginBottom:8 }}>No goals yet</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>Add your first learning goal to get started</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>＋ Add Your First Goal</button>
        </div>
      ) : (
        <div className="grid-3">
          {goals.map(g => {
            const done = g.topics?.filter(t => ['COMPETENT','PROFICIENT','MASTERED'].includes(t.mastery)).length || 0;
            const total = g.topics?.length || 1;
            const pct = Math.round((done/total)*100);
            return (
              <div key={g.id} className="goal-card fade-up" onClick={() => setSelected(g)}>
                <span className={`goal-category category-${g.category}`}>{g.category}</span>
                <div className="goal-title">{g.title}</div>
                <div className="goal-why">"{g.why}"</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                  {g.topics?.slice(0,4).map(t => (
                    <span key={t.name} className={`mastery-badge ${t.mastery}`}>{MASTERY_ICONS[t.mastery]} {t.mastery}</span>
                  ))}
                  {g.topics?.length > 4 && <span style={{ fontSize:11, color:'var(--text-muted)' }}>+{g.topics.length-4} more</span>}
                </div>
                <div className="goal-progress-bar-track">
                  <div className="goal-progress-bar-fill" style={{ width:`${pct}%` }} />
                </div>
                <div className="goal-progress-label"><span>Progress</span><span>{pct}%</span></div>
                {g.deadline && <div style={{ marginTop:10, fontSize:12, color:'var(--text-muted)' }}>📅 {new Date(g.deadline).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(27,42,74,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }} onClick={() => setSelected(null)}>
          <div className="card" style={{ width:520, maxHeight:'80vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <span className={`goal-category category-${selected.category}`}>{selected.category}</span>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, marginTop:8, color:'var(--text-primary)' }}>{selected.title}</h2>
                <p style={{ fontSize:13, color:'var(--text-muted)', fontStyle:'italic', marginTop:4 }}>"{selected.why}"</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ border:'none', background:'none', fontSize:20, cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
            </div>
            <div className="divider" />
            <div style={{ fontWeight:600, fontSize:12, color:'var(--text-secondary)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.8px' }}>Topics</div>
            {selected.topics?.map(t => (
              <div key={t.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--card-border)' }}>
                <span style={{ fontSize:14, color:'var(--text-primary)' }}>{t.name}</span>
                <span className={`mastery-badge ${t.mastery}`}>{MASTERY_ICONS[t.mastery]} {t.mastery}</span>
              </div>
            ))}
            {(!selected.topics || selected.topics.length === 0) && <p style={{ color:'var(--text-muted)', fontSize:14 }}>No topics added.</p>}
          </div>
        </div>
      )}

      {/* Add goal modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(27,42,74,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }} onClick={() => setShowAdd(false)}>
          <div className="card" style={{ width:480, maxHeight:'85vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text-primary)' }}>New Learning Goal</h2>
              <button onClick={() => setShowAdd(false)} style={{ border:'none', background:'none', fontSize:20, cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ marginBottom:14 }}>
              <label className="form-label">Category</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {Object.keys(CAT_COLORS).map(c => (
                  <button key={c} onClick={() => setNewGoal(g => ({...g, category:c}))}
                    style={{ padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'inherit', background:newGoal.category===c ? CAT_COLORS[c] : 'rgba(0,0,0,0.05)', color:newGoal.category===c ? 'white' : '#8A9AB0', transition:'all 0.2s' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Goal title</label>
              <input className="form-input" placeholder="What do you want to learn?" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Why does this matter?</label>
              <textarea className="form-textarea" placeholder="Your motivation..." value={newGoal.why} onChange={e => setNewGoal({...newGoal, why:e.target.value})} />
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
            <div className="form-group">
              <label className="form-label">Topics</label>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <input className="form-input" style={{ flex:1 }} placeholder="Type a topic + Enter" value={topicInput} onChange={e => setTopicInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addTopic(topicInput)} />
                <button onClick={() => addTopic(topicInput)} style={{ padding:'11px 16px', borderRadius:10, border:'none', background:'var(--navy)', color:'white', cursor:'pointer', fontSize:20 }}>+</button>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {newGoal.topics.map(t => (
                  <span key={t.name} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'var(--navy)', color:'white', fontSize:12 }}>
                    {t.name}
                    <button onClick={() => setNewGoal(g => ({...g, topics:g.topics.filter(x=>x.name!==t.name)}))} style={{ border:'none', background:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:15, padding:0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={saveGoal}>Save Goal</button>
          </div>
        </div>
      )}
    </div>
  );
}
