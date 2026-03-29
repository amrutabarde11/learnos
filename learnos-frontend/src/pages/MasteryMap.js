import React from 'react';

const MASTERY_SHORT = {
  UNAWARE: 'UNA',
  EXPOSED: 'EXP',
  FAMILIAR: 'FAM',
  COMPETENT: 'COMP',
  PROFICIENT: 'PROF',
  MASTERED: '★',
};

const MASTERY_DESC = {
  UNAWARE: "Haven't touched this yet",
  EXPOSED: "Seen it once, still confused",
  FAMILIAR: "Understand the basics",
  COMPETENT: "Can apply with some effort",
  PROFICIENT: "Comfortable, mostly automatic",
  MASTERED: "Can teach it, handle edge cases",
};

export default function MasteryMap({ user }) {
  // FIX: use real goals from user prop, not mockGoals
  const goals = user?.goals || [];

  if (goals.length === 0) {
    return (
      <div className="fade-up" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>◎</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-secondary)', marginBottom: 8 }}>No goals yet</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Add goals to see your mastery map.</div>
      </div>
    );
  }

  const allTopics = goals.flatMap(g => g.topics || []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-greeting">Mastery <em>Map</em></h1>
        <p className="page-subtitle">Your complete learning landscape — every goal, every topic, where you stand</p>
      </div>

      {/* Legend */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mastery Scale:</span>
          {Object.entries(MASTERY_SHORT).map(([level, short]) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className={`mastery-cell ${level}`} style={{ width: 44, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, borderRadius: 6 }}>
                {short}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{MASTERY_DESC[level]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Maps */}
      {goals.map((g, gi) => {
        const done = g.topics?.filter(t => ['COMPETENT','PROFICIENT','MASTERED'].includes(t.mastery)).length || 0;
        const total = g.topics?.length || 1;
        const progress = Math.round((done / total) * 100);
        return (
          <div key={g.id || gi} className="card fade-up" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span className={`goal-category category-${g.category}`}>{g.category}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>{g.title}</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
                {progress}% to {g.targetMastery}
              </span>
            </div>

            {/* Topic grid */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(g.topics || []).map((t, ti) => (
                <div key={t.name || ti} style={{ textAlign: 'center', minWidth: 90 }}>
                  <div
                    className={`mastery-cell ${t.mastery}`}
                    style={{ width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginBottom: 6, fontSize: 11 }}
                    title={`${t.name}: ${t.mastery} — ${MASTERY_DESC[t.mastery]}`}
                  >
                    {MASTERY_SHORT[t.mastery]}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3, maxWidth: 90 }}>{t.name}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: 16 }}>
              <div className="goal-progress-bar-track">
                <div className="goal-progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary stats */}
      <div className="card fade-up">
        <div className="section-title">Overall Mastery Distribution</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['UNAWARE', 'EXPOSED', 'FAMILIAR', 'COMPETENT', 'PROFICIENT', 'MASTERED'].map(level => {
            const count = allTopics.filter(t => t.mastery === level).length;
            const total = allTopics.length;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={level} style={{ flex: '1 1 120px', textAlign: 'center' }}>
                <div className={`mastery-cell ${level}`} style={{ width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  {count}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{MASTERY_SHORT[level]}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
