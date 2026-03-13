import React from 'react';

const MASTERY_SHORT = { UNAWARE:'UNA', EXPOSED:'EXP', FAMILIAR:'FAM', COMPETENT:'COMP', PROFICIENT:'PROF', MASTERED:'★' };
const MASTERY_DESC = { UNAWARE:"Haven't started", EXPOSED:"Seen, still confused", FAMILIAR:"Know the basics", COMPETENT:"Can apply it", PROFICIENT:"Mostly automatic", MASTERED:"Can teach it" };

export default function MasteryMap({ user }) {
  const goals = user?.goals || [];

  if (goals.length === 0) {
    return (
      <div className="fade-up" style={{ textAlign:'center', padding:'80px 20px' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⬡</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text-secondary)', marginBottom:8 }}>No goals yet</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>Add goals with topics to see your mastery map.</p>
      </div>
    );
  }

  const allTopics = goals.flatMap(g => g.topics || []);
  const total = allTopics.length;

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-greeting">Mastery <em>Map</em></h1>
        <p className="page-subtitle">Every goal, every topic — where you stand right now</p>
      </div>

      <div className="card" style={{ marginBottom:24, padding:'16px 24px' }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px' }}>Scale:</span>
          {Object.entries(MASTERY_SHORT).map(([level, short]) => (
            <div key={level} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div className={`mastery-cell ${level}`} style={{ width:44, height:26, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, borderRadius:6 }}>{short}</div>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>{MASTERY_DESC[level]}</span>
            </div>
          ))}
        </div>
      </div>

      {goals.map(g => (
        <div key={g.id} className="card fade-up" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <span className={`goal-category category-${g.category}`}>{g.category}</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--text-primary)' }}>{g.title}</span>
          </div>
          {(!g.topics || g.topics.length === 0) ? (
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>No topics added to this goal yet.</p>
          ) : (
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {g.topics.map(t => (
                <div key={t.name} style={{ textAlign:'center', minWidth:80 }}>
                  <div className={`mastery-cell ${t.mastery}`}
                    style={{ width:'100%', height:40, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, marginBottom:6, fontSize:11 }}
                    title={`${t.name}: ${t.mastery}`}>
                    {MASTERY_SHORT[t.mastery]}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.3 }}>{t.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {total > 0 && (
        <div className="card fade-up">
          <div className="section-title">Overall Distribution</div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {Object.keys(MASTERY_SHORT).map(level => {
              const count = allTopics.filter(t => t.mastery === level).length;
              const pct = total ? Math.round((count/total)*100) : 0;
              return (
                <div key={level} style={{ flex:'1 1 80px', textAlign:'center' }}>
                  <div className={`mastery-cell ${level}`} style={{ width:'100%', height:48, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, fontSize:22, fontWeight:700, marginBottom:6 }}>{count}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:2 }}>{MASTERY_SHORT[level]}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
