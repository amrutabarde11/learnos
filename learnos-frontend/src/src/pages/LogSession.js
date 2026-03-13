import React, { useState } from 'react';
import { submitSession } from '../api/data';

const MASTERY_LEVELS = ['UNAWARE','EXPOSED','FAMILIAR','COMPETENT','PROFICIENT','MASTERED'];
const SESSION_TYPES = ['STUDY','PRACTICE','REVISION','ASSESSMENT'];
const MASTERY_COLORS = { UNAWARE:'#8A9AB0', EXPOSED:'#C9857A', FAMILIAR:'#C4A84F', COMPETENT:'#7A9E87', PROFICIENT:'#4A8A60', MASTERED:'#1B2A4A' };

export default function LogSession({ user }) {
  const goals = user?.goals || [];
  const [form, setForm] = useState({ goalId:'', topic:'', duration:1, sessionType:'STUDY', masteryBefore:'FAMILIAR', masteryAfter:'FAMILIAR', notes:'' });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedGoal = goals.find(g => g.id === parseInt(form.goalId));
  const topics = selectedGoal?.topics?.map(t => t.name) || [];

  const handleSave = async () => {
    if (!form.goalId || !form.topic) { alert('Please select a goal and topic!'); return; }
    setSaving(true);
    await submitSession({ ...form, userName: user?.name, date: new Date().toISOString() });
    setSaving(false);
    setSubmitted(true);
  };

  if (goals.length === 0) {
    return (
      <div className="fade-up" style={{ textAlign:'center', padding:'80px 20px' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>◎</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text-secondary)', marginBottom:8 }}>No goals yet</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>Add goals first, then log sessions against them.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fade-up" style={{ textAlign:'center', padding:'80px 20px' }}>
        <div style={{ fontSize:60, marginBottom:20 }}>✦</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, color:'var(--text-primary)', marginBottom:12 }}>Session logged!</h2>
        <p style={{ color:'var(--text-muted)', fontSize:15, maxWidth:400, margin:'0 auto' }}>Your agents are processing your progress. Keep it up!</p>
        <button className="btn btn-primary" style={{ marginTop:32 }} onClick={() => { setSubmitted(false); setForm({ goalId:'', topic:'', duration:1, sessionType:'STUDY', masteryBefore:'FAMILIAR', masteryAfter:'FAMILIAR', notes:'' }); }}>
          Log Another
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth:640, margin:'0 auto' }}>
      <div className="page-header">
        <h1 className="page-greeting">Log a <em>Session</em></h1>
        <p className="page-subtitle">Be honest — the system helps you as much as you help it</p>
      </div>

      <div className="card">
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Goal</label>
            <select className="form-select" value={form.goalId} onChange={e => setForm({...form, goalId:e.target.value, topic:''})}>
              <option value="">Select a goal...</option>
              {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Topic</label>
            <select className="form-select" value={form.topic} onChange={e => setForm({...form, topic:e.target.value})} disabled={!selectedGoal}>
              <option value="">Select topic...</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Duration (hours)</label>
            <input type="number" step="0.5" min="0.5" max="8" className="form-input" value={form.duration} onChange={e => setForm({...form, duration:parseFloat(e.target.value)})} />
          </div>
          <div className="form-group">
            <label className="form-label">Session Type</label>
            <select className="form-select" value={form.sessionType} onChange={e => setForm({...form, sessionType:e.target.value})}>
              {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="divider" />

        <div style={{ marginBottom:20 }}>
          <div className="form-label" style={{ marginBottom:12 }}>Mastery — Before this session</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
            {MASTERY_LEVELS.map(m => (
              <button key={m} onClick={() => setForm({...form, masteryBefore:m})}
                style={{ padding:'8px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all 0.2s', background:form.masteryBefore===m ? MASTERY_COLORS[m] : 'var(--cream-dark)', color:form.masteryBefore===m ? 'white' : 'var(--text-muted)' }}>
                {m}
              </button>
            ))}
          </div>
          <div className="form-label" style={{ marginBottom:12 }}>Mastery — After this session</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {MASTERY_LEVELS.map(m => (
              <button key={m} onClick={() => setForm({...form, masteryAfter:m})}
                style={{ padding:'8px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all 0.2s', background:form.masteryAfter===m ? MASTERY_COLORS[m] : 'var(--cream-dark)', color:form.masteryAfter===m ? 'white' : 'var(--text-muted)' }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-textarea" placeholder="What clicked? What's still confusing? Resources that helped?" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
        </div>

        <button className="btn btn-primary" style={{ width:'100%' }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Session ✦'}
        </button>
      </div>
    </div>
  );
}
