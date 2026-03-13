import React, { useState, useEffect } from 'react';
import { mockUser, mockLEI, mockInsights, mockGoals, mockFocus } from '../api/data';

function AgentBar({ name, score, color }) {
  return (
    <div className="agent-bar-wrap">
      <div className="agent-bar-header">
        <span className="agent-bar-name">{name}</span>
        <span className="agent-bar-score">{score}</span>
      </div>
      <div className="agent-bar-track">
        <div
          className="agent-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

function InsightCard({ insight }) {
  const severityClass = insight.severity;
  const typeLabels = {
    DEADLINE: '⏰ Deadline Alert',
    FORGETTING: '🧠 Forgetting Alert',
    PLATEAU: '📊 Mastery Plateau',
    STREAK: '🔥 Streak',
    AVOIDANCE: '⚠ Topic Avoidance',
    GOAL_RISK: '🎯 Goal At Risk',
    MOTIVATION: '💬 Motivation',
  };

  return (
    <div className={`insight-card ${severityClass}`}>
      <div className="insight-type">{typeLabels[insight.type] || insight.type}</div>
      <div className="insight-msg">{insight.message}</div>
    </div>
  );
}

function ProgressRing({ value, size = 64, stroke = 5, color = '#7A9E87' }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size * 0.22} fill="currentColor" fontFamily="inherit" fontWeight="600">
        {value}%
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const [time, setTime] = useState('');
  const lei = mockLEI;

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setTime('Good morning');
    else if (hr < 17) setTime('Good afternoon');
    else setTime('Good evening');
  }, []);

  const riskClass = lei.score >= 75 ? 'low' : lei.score >= 50 ? 'medium' : 'high';
  const numClass = lei.score >= 75 ? 'green' : lei.score >= 50 ? 'yellow' : 'red';

  const agents = [
    { name: 'Productivity', score: lei.productivity, color: '#7A9E87' },
    { name: 'Mastery Velocity', score: lei.mastery, color: '#8B7BAD' },
    { name: 'Retention', score: lei.retention, color: '#C9857A' },
    { name: 'Topic Priority', score: lei.topicPriority, color: '#C4A84F' },
    { name: 'Deadline Adherence', score: lei.deadline, color: '#D4956A' },
    { name: 'Goal Progress', score: lei.goalProgress, color: '#7A9E87' },
    { name: 'Cognitive Load', score: lei.cognitive, color: '#8B7BAD' },
    { name: 'Motivation', score: lei.motivation, color: '#C9857A' },
  ];

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-greeting">
          {time}, <em>{mockUser.name}</em>
        </h1>
        <p className="page-subtitle">
          {mockInsights.filter(i => i.severity === 'urgent').length} urgent alerts · {mockGoals.length} active goals
        </p>
      </div>

      {/* Top Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.2fr', gap: 20, marginBottom: 24 }}>
        {/* LEI */}
        <div className="lei-card fade-up">
          <div className="lei-label">Learning Efficiency Index</div>
          <div className={`lei-number ${numClass}`}>{lei.score}</div>
          <div style={{ marginTop: 12 }}>
            <span className={`lei-risk ${riskClass}`}>
              {riskClass === 'low' ? '✓ On Track' : riskClass === 'medium' ? '⚡ Room to Improve' : '⚠ Needs Attention'}
            </span>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="focus-card fade-up" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="focus-label">Today's Focus</div>
            <div className="focus-topic">{mockFocus.topic}</div>
            <div className="focus-goal">Part of: {mockFocus.goal}</div>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7, fontStyle: 'italic' }}>
            {mockFocus.reason}
          </div>
        </div>

        {/* Stats */}
        <div className="card fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="stat-chip">
            <div className="stat-chip-value">5</div>
            <div className="stat-chip-label">Day Streak 🔥</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-value">12h</div>
            <div className="stat-chip-label">This Week</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20, marginBottom: 24 }}>
        {/* Agent Scores */}
        <div className="card fade-up">
          <div className="section-title">Agent Analysis</div>
          {agents.map(a => (
            <AgentBar key={a.name} {...a} />
          ))}
        </div>

        {/* Insights Feed */}
        <div className="fade-up">
          <div className="section-title">Live Insights</div>
          {mockInsights.map(ins => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </div>
      </div>

      {/* Goal Progress */}
      <div className="card fade-up">
        <div className="section-title">Active Goals</div>
        <div className="grid-3">
          {mockGoals.map(g => (
            <div key={g.id} style={{ padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <ProgressRing
                  value={g.progress}
                  color={
                    g.category === 'ACADEMIC' ? '#8B7BAD' :
                    g.category === 'SKILL' ? '#7A9E87' :
                    g.category === 'CERTIFICATION' ? '#C4A84F' : '#C9857A'
                  }
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {g.title}
                  </div>
                  <span className={`goal-category category-${g.category}`}>{g.category}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                "{g.why}"
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
