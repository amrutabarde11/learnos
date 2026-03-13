import React, { useState } from 'react';
import { submitSession as logSession } from '../api/data';
import Quiz from './Quiz';

const MASTERY_LEVELS = ['UNAWARE','EXPOSED','FAMILIAR','COMPETENT','PROFICIENT','MASTERED'];
const SESSION_TYPES = ['STUDY','PRACTICE','REVISION','ASSESSMENT'];
const MASTERY_COLORS = {
  UNAWARE:'#8A9AB0', EXPOSED:'#C9857A', FAMILIAR:'#C4A84F',
  COMPETENT:'#7A9E87', PROFICIENT:'#4A8A60', MASTERED:'#1B2A4A'
};

export default function LogSession({ user, onSessionLogged }) {
  const goals = user?.goals || [];
  const [form, setForm] = useState({
    goalId: '', topic: '', duration: 1,
    sessionType: 'STUDY', masteryBefore: 'FAMILIAR', masteryAfter: 'FAMILIAR', notes: ''
  });
  const [phase, setPhase] = useState('form'); // form | success | quiz
  const [saving, setSaving] = useState(false);
  const [leiResult, setLeiResult] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  const selectedGoal = goals.find(g => String(g.id) === String(form.goalId));
  const topics = selectedGoal?.topics?.map(t => t.name) || [];

  const handleSave = async () => {
    if (!form.goalId || !form.topic) { alert('Please select a goal and topic!'); return; }
    setSaving(true);
    const result = await logSession({
      ...form,
      goalTitle: selectedGoal?.title,
      userName: user?.name,
      date: new Date().toISOString().split('T')[0]
    });
    setSaving(false);
    if (result?.lei) setLeiResult(result.lei);
    setSessionData({ topic: form.topic, goalTitle: selectedGoal?.title, mastery: form.masteryAfter });
    setPhase('success');
    if (onSessionLogged) onSessionLogged(result);
  };

  const resetForm = () => {
    setForm({ goalId:'', topic:'', duration:1, sessionType:'STUDY', masteryBefore:'FAMILIAR', masteryAfter:'FAMILIAR', notes:'' });
    setPhase('form');
    setLeiResult(null);
    setSessionData(null);
  };

  // Success screen — choose quiz or skip
  if (phase === 'success') {
    return (
      <div className="fade-up" style={{ textAlign:'center', padding:'60px 20px', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✦</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize: 28, color:'var(--text-primary)', marginBottom: 8 }}>
          Session logged!
        </h2>
        <p style={{ color:'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          {sessionData?.duration}h of {sessionData?.sessionType?.toLowerCase()} on <strong>{sessionData?.topic}</strong>
        </p>

        {leiResult && (
          <div style={{ display:'inline-block', background:'var(--navy)', color:'white', borderRadius: 16, padding:'20px 40px', marginBottom: 28 }}>
            <div style={{ fontSize:11, opacity:0.6, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom: 4 }}>Updated LEI Score</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize: 52, fontWeight: 700, color: leiResult.score >= 75 ? '#7DD3A8' : leiResult.score >= 50 ? '#F5D87C' : '#F09090' }}>
              {leiResult.score}
            </div>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 20px rgba(27,42,74,0.08)', marginBottom: 16 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize: 18, color:'var(--text-primary)', marginBottom: 8 }}>
            Test your knowledge?
          </div>
          <p style={{ color:'var(--text-muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            Gemini will generate 3 questions on <strong>{sessionData?.topic}</strong> to reinforce what you just studied.
          </p>
          <div style={{ display:'flex', gap: 10 }}>
            <button
              onClick={() => setPhase('quiz')}
              style={{ flex:1, padding:'13px', borderRadius:12, border:'none', background:'#1B2A4A', color:'white', fontSize:14, fontFamily:'inherit', fontWeight:600, cursor:'pointer' }}>
              Take Quiz ✦
            </button>
            <button
              onClick={resetForm}
              style={{ flex:1, padding:'13px', borderRadius:12, border:'1.5px solid rgba(27,42,74,0.15)', background:'transparent', color:'#5A6A80', fontSize:14, fontFamily:'inherit', cursor:'pointer' }}>
              Skip for now
            </button>
          </div>
        </div>

        <button onClick={resetForm} style={{ border:'none', background:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          Log another session
        </button>
      </div>
    );
  }

  // Quiz phase
  if (phase === 'quiz') {
    return (
      <div className="fade-up">
        <div className="page-header">
          <h1 className="page-greeting">Quick <em>Quiz</em></h1>
          <p className="page-subtitle">AI-generated questions on {sessionData?.topic}</p>
        </div>
        <Quiz
          topic={sessionData?.topic}
          goalTitle={sessionData?.goalTitle}
          mastery={sessionData?.mastery}
          onFinish={resetForm}
          onSkip={resetForm}
        />
      </div>
    );
  }

  // Form phase
  if (goals.length === 0) {
    return (
      <div className="fade-up" style={{ textAlign:'center', padding:'80px 20px' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>◎</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text-secondary)', marginBottom:8 }}>No goals yet</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>Add goals first, then log sessions against them.</p>
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
            <select className="form-select" value={form.goalId}
              onChange={e => setForm({...form, goalId: e.target.value, topic: ''})}>
              <option value="">Select a goal...</option>
              {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Topic</label>
            <select className="form-select" value={form.topic}
              onChange={e => setForm({...form, topic: e.target.value})}
              disabled={!selectedGoal}>
              <option value="">Select topic...</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Duration (hours)</label>
            <input type="number" step="0.5" min="0.5" max="8" className="form-input"
              value={form.duration}
              onChange={e => setForm({...form, duration: parseFloat(e.target.value)})} />
          </div>
          <div className="form-group">
            <label className="form-label">Session Type</label>
            <select className="form-select" value={form.sessionType}
              onChange={e => setForm({...form, sessionType: e.target.value})}>
              {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="divider" />

        <div style={{ marginBottom: 20 }}>
          <div className="form-label" style={{ marginBottom: 12 }}>Mastery — Before this session</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom: 20 }}>
            {MASTERY_LEVELS.map(m => (
              <button key={m} onClick={() => setForm({...form, masteryBefore: m})}
                style={{ padding:'8px 14px', borderRadius:20, border:'none', cursor:'pointer',
                  fontSize:12, fontWeight:600, transition:'all 0.2s', fontFamily:'inherit',
                  background: form.masteryBefore === m ? MASTERY_COLORS[m] : 'var(--cream-dark)',
                  color: form.masteryBefore === m ? 'white' : 'var(--text-muted)' }}>
                {m}
              </button>
            ))}
          </div>
          <div className="form-label" style={{ marginBottom: 12 }}>Mastery — After this session</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {MASTERY_LEVELS.map(m => (
              <button key={m} onClick={() => setForm({...form, masteryAfter: m})}
                style={{ padding:'8px 14px', borderRadius:20, border:'none', cursor:'pointer',
                  fontSize:12, fontWeight:600, transition:'all 0.2s', fontFamily:'inherit',
                  background: form.masteryAfter === m ? MASTERY_COLORS[m] : 'var(--cream-dark)',
                  color: form.masteryAfter === m ? 'white' : 'var(--text-muted)' }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-textarea"
            placeholder="What clicked? What's still confusing? Resources that helped?"
            value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})} />
        </div>

        <button className="btn btn-primary" style={{ width:'100%' }}
          onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Session ✦'}
        </button>
      </div>
    </div>
  );
}
