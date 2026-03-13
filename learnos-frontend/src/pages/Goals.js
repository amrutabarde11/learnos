import React, { useState } from 'react';
import { mockGoals } from '../api/data';

const MASTERY_ORDER = ['UNAWARE', 'EXPOSED', 'FAMILIAR', 'COMPETENT', 'PROFICIENT', 'MASTERED'];

function MasteryBadge({ level }) {
  const icons = { UNAWARE: '○', EXPOSED: '◔', FAMILIAR: '◑', COMPETENT: '◕', PROFICIENT: '●', MASTERED: '★' };
  return (
    <span className={`mastery-badge ${level}`}>
      {icons[level]} {level}
    </span>
  );
}

function GoalDetail({ goal, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(27,42,74,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div
        className="card"
        style={{ width: 520, maxHeight: '80vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <span className={`goal-category category-${goal.category}`}>{goal.category}</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginTop: 8 }}>{goal.title}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
              "{goal.why}"
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            <span>Progress toward {goal.targetMastery}</span>
            <span>{goal.progress}%</span>
          </div>
          <div className="goal-progress-bar-track" style={{ height: 8 }}>
            <div className="goal-progress-bar-fill" style={{ width: `${goal.progress}%` }} />
          </div>
        </div>

        <div className="divider" />
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Topics
        </div>
        {goal.topics.map(t => (
          <div key={t.name} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: '1px solid var(--card-border)',
          }}>
            <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{t.name}</span>
            <MasteryBadge level={t.mastery} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Goals() {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'SKILL', why: '', deadline: '', targetMastery: 'COMPETENT' });

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-greeting">Your <em>Goals</em></h1>
          <p className="page-subtitle">{mockGoals.length} active · Click any goal to see topic breakdown</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>＋ New Goal</button>
      </div>

      <div className="grid-3">
        {mockGoals.map(g => (
          <div key={g.id} className="goal-card fade-up" onClick={() => setSelected(g)}>
            <span className={`goal-category category-${g.category}`}>{g.category}</span>
            <div className="goal-title">{g.title}</div>
            <div className="goal-why">"{g.why}"</div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {g.topics.slice(0, 4).map(t => (
                <MasteryBadge key={t.name} level={t.mastery} />
              ))}
              {g.topics.length > 4 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 0' }}>+{g.topics.length - 4} more</span>
              )}
            </div>

            <div className="goal-progress-bar-track">
              <div className="goal-progress-bar-fill" style={{ width: `${g.progress}%` }} />
            </div>
            <div className="goal-progress-label">
              <span>Progress</span>
              <span>{g.progress}%</span>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              📅 Due: {new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {selected && <GoalDetail goal={selected} onClose={() => setSelected(null)} />}

      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(27,42,74,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, backdropFilter: 'blur(4px)',
        }} onClick={() => setShowAdd(false)}>
          <div className="card" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>New Learning Goal</h2>
              <button onClick={() => setShowAdd(false)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">What do you want to learn?</label>
              <input className="form-input" placeholder="e.g. Learn React, Pass AWS exam..." value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})}>
                <option value="ACADEMIC">Academic</option>
                <option value="SKILL">Skill</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="KNOWLEDGE">Knowledge</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Why does this matter to you?</label>
              <textarea className="form-textarea" placeholder="This is your motivation — shown back to you when you're slipping..." value={newGoal.why} onChange={e => setNewGoal({...newGoal, why: e.target.value})} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input type="date" className="form-input" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Mastery</label>
                <select className="form-select" value={newGoal.targetMastery} onChange={e => setNewGoal({...newGoal, targetMastery: e.target.value})}>
                  {MASTERY_ORDER.slice(2).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowAdd(false)}>
              Create Goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
