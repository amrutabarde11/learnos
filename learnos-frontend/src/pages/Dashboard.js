import React, { useState, useEffect } from 'react';
import { getLEI, getInsights, mockLEI, mockInsights } from '../api/data';

function AgentBar({ name, score, color }) {
  return (
    <div className="agent-bar-wrap">
      <div className="agent-bar-header">
        <span className="agent-bar-name">{name}</span>
        <span className="agent-bar-score">{score}</span>
      </div>
      <div className="agent-bar-track">
        <div className="agent-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function ProgressRing({ value, size = 64, stroke = 5, color = '#7A9E87' }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size * 0.22}
        fill="currentColor" fontFamily="inherit" fontWeight="600">{value}%</text>
    </svg>
  );
}

export default function Dashboard({ user, refreshKey }) {
  const [greeting, setGreeting] = useState('');
  const [lei, setLei] = useState(mockLEI);
  const [insights, setInsights] = useState(mockInsights);
  const goals = user?.goals || [];

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  useEffect(() => {
    if (!user?.userId) return;
    getLEI(user.userId).then(data => { if (data) setLei(data); });
    getInsights(user.userId).then(data => { if (data && data.length) setInsights(data); });
  }, [user?.userId, refreshKey]);

  const riskClass = lei.score >= 75 ? 'low' : lei.score >= 50 ? 'medium' : 'high';
  const numClass = lei.score >= 75 ? 'green' : lei.score >= 50 ? 'yellow' : 'red';

  const agents = [
    { name: 'Productivity',       score: lei.productivity  || 0, color: '#7A9E87' },
    { name: 'Mastery Velocity',   score: lei.mastery       || 0, color: '#8B7BAD' },
    { name: 'Retention',          score: lei.retention     || 0, color: '#C9857A' },
    { name: 'Topic Priority',     score: lei.topicPriority || 0, color: '#C4A84F' },
    { name: 'Deadline Adherence', score: lei.deadline      || 0, color: '#D4956A' },
    { name: 'Goal Progress',      score: lei.goalProgress  || 0, color: '#7A9E87' },
    { name: 'Cognitive Load',     score: lei.cognitive     || 0, color: '#8B7BAD' },
    { name: 'Motivation',         score: lei.motivation    || 0, color: '#C9857A' },
  ];

  const typeLabels = {
    DEADLINE: '⏰ Deadline Alert', FORGETTING: '🧠 Forgetting Alert',
    PLATEAU: '📊 Mastery Plateau', STREAK: '🔥 Streak',
    AVOIDANCE: '⚠ Avoidance', GOAL_RISK: '🎯 Goal At Risk',
    MOTIVATION: '💬 Motivation', INFO: 'ℹ Info',
  };

  const focusGoal = goals[0];
  const focusTopic = focusGoal?.topics?.find(t => t.mastery === 'UNAWARE' || t.mastery === 'EXPOSED') || focusGoal?.topics?.[0];
  const catColors = { ACADEMIC: '#8B7BAD', SKILL: '#7A9E87', CERTIFICATION: '#C4A84F', KNOWLEDGE: '#C9857A' };

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-greeting">{greeting}, <em>{user?.name || 'Learner'}</em></h1>
        <p className="page-subtitle">{goals.length} active goal{goals.length !== 1 ? 's' : ''} · Log a session to update your score</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.2fr', gap: 20, marginBottom: 24 }}>
        <div className="lei-card fade-up">
          <div className="lei-label">Learning Efficiency Index</div>
          <div className={`lei-number ${numClass}`}>{lei.score}</div>
          <div style={{ marginTop: 12 }}>
            <span className={`lei-risk ${riskClass}`}>
              {lei.score === 0 ? '→ Log sessions to score' : `Risk: ${lei.risk}`}
            </span>
          </div>
        </div>

        {focusGoal && focusTopic ? (
          <div className="focus-card fade-up" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="focus-label">Today's Focus</div>
              <div className="focus-topic">{focusTopic.name}</div>
              <div className="focus-goal">Part of: {focusGoal.title}</div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7, fontStyle: 'italic' }}>Highest priority unstarted topic</div>
          </div>
        ) : (
          <div className="card fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>◎</div>
              <div style={{ fontSize: 14 }}>Add goals to see your daily focus</div>
            </div>
          </div>
        )}

        <div className="card fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="stat-chip">
            <div className="stat-chip-value">{goals.length}</div>
            <div className="stat-chip-label">Active Goals</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-value">{goals.reduce((s, g) => s + (g.topics?.length || 0), 0)}</div>
            <div className="stat-chip-label">Total Topics</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20, marginBottom: 24 }}>
        <div className="card fade-up">
          <div className="section-title">Agent Analysis</div>
          {agents.map(a => <AgentBar key={a.name} {...a} />)}
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Scores update after each logged session
          </div>
        </div>

        <div className="fade-up">
          <div className="section-title">Live Insights</div>
          {insights.map(ins => (
            <div key={ins.id} className={`insight-card ${ins.severity}`}>
              <div className="insight-type">{typeLabels[ins.type] || ins.type}</div>
              <div className="insight-msg">{ins.message}</div>
            </div>
          ))}
        </div>
      </div>

      {goals.length > 0 && (
        <div className="card fade-up">
          <div className="section-title">Your Goals</div>
          <div className="grid-3">
            {goals.map((g, i) => {
              const done = g.topics?.filter(t => ['COMPETENT','PROFICIENT','MASTERED'].includes(t.mastery)).length || 0;
              const total = g.topics?.length || 1;
              const pct = Math.round((done / total) * 100);
              return (
                <div key={i} style={{ padding: '0 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                    <ProgressRing value={pct} color={catColors[g.category] || '#7A9E87'} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{g.title}</div>
                      <span className={`goal-category category-${g.category}`}>{g.category}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{g.why}"</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}