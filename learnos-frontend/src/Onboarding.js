import React, { useState } from 'react';

const MASTERY_LEVELS = ['COMPETENT', 'PROFICIENT', 'MASTERED'];
const CATEGORIES = ['ACADEMIC', 'SKILL', 'CERTIFICATION', 'KNOWLEDGE'];

const CATEGORY_COLORS = {
  ACADEMIC: '#8B7BAD',
  SKILL: '#7A9E87',
  CERTIFICATION: '#C4A84F',
  KNOWLEDGE: '#C9857A',
};

const SUGGESTED_TOPICS = {
  ACADEMIC: ['Lectures', 'Assignments', 'Lab Work', 'Exam Prep', 'Project'],
  SKILL: ['Fundamentals', 'Practice Projects', 'Documentation', 'Tutorials', 'Portfolio'],
  CERTIFICATION: ['Core Concepts', 'Practice Tests', 'Weak Areas', 'Review', 'Mock Exam'],
  KNOWLEDGE: ['Reading', 'Note Taking', 'Research', 'Summary', 'Application'],
};

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({ name: '', learnerType: 'BOTH', dailyTarget: 2 });
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState({
    title: '', category: 'SKILL', why: '',
    deadline: '', targetMastery: 'COMPETENT', topics: [],
  });
  const [topicInput, setTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTopic = (name) => {
    if (!name.trim()) return;
    if (currentGoal.topics.find(t => t.name === name)) return;
    setCurrentGoal(g => ({
      ...g,
      topics: [...g.topics, { name: name.trim(), mastery: 'UNAWARE', priority: 'MEDIUM' }],
    }));
    setTopicInput('');
  };

  const removeTopic = (name) => {
    setCurrentGoal(g => ({ ...g, topics: g.topics.filter(t => t.name !== name) }));
  };

  const addGoal = () => {
    if (!currentGoal.title || !currentGoal.why) {
      setError('Please fill in the goal title and your motivation!');
      return;
    }
    setError('');
    setGoals(prev => [...prev, { ...currentGoal, id: prev.length + 1 }]);
    setCurrentGoal({ title: '', category: 'SKILL', why: '', deadline: '', targetMastery: 'COMPETENT', topics: [] });
  };

  const handleComplete = async () => {
    if (step === 1 && !user.name.trim()) {
      setError('Please enter your name!');
      return;
    }
    if (step === 3 && goals.length === 0) {
      setError('Add at least one goal to continue!');
      return;
    }
    setError('');

    if (step < 3) { setStep(s => s + 1); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/users/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, goals }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('learnos_user', JSON.stringify({ ...user, goals }));
        onComplete({ ...user, goals });
      }
    } catch (e) {
      // Even if backend fails, save locally and continue
      localStorage.setItem('learnos_user', JSON.stringify({ ...user, goals }));
      onComplete({ ...user, goals });
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F7F3EC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 8, height: 8, borderRadius: 4,
              background: s <= step ? '#1B2A4A' : '#D4CBB8',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Step 1 — Who are you */}
        {step === 1 && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#8A9AB0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Step 1 of 3
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#1B2A4A', marginBottom: 8, lineHeight: 1.2 }}>
              Welcome to <em style={{ color: '#7A9E87' }}>LearnOS</em>
            </h1>
            <p style={{ color: '#8A9AB0', fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
              Your personal learning intelligence. Let's set you up in 3 quick steps.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                Your name
              </label>
              <input
                style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid rgba(27,42,74,0.12)', fontSize: 16, fontFamily: 'inherit', color: '#1B2A4A', background: 'white', outline: 'none' }}
                placeholder="e.g. Amruta"
                value={user.name}
                onChange={e => setUser({ ...user, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleComplete()}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                I am a...
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'STUDENT', label: '🎓 Student' },
                  { value: 'SELF_LEARNER', label: '🛠 Self-learner' },
                  { value: 'BOTH', label: '✦ Both' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setUser({ ...user, learnerType: opt.value })}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s',
                      background: user.learnerType === opt.value ? '#1B2A4A' : 'white',
                      color: user.learnerType === opt.value ? 'white' : '#5A6A80',
                      boxShadow: user.learnerType === opt.value ? '0 4px 12px rgba(27,42,74,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                Daily learning target: <span style={{ color: '#1B2A4A' }}>{user.dailyTarget} hours</span>
              </label>
              <input type="range" min="0.5" max="8" step="0.5"
                value={user.dailyTarget}
                onChange={e => setUser({ ...user, dailyTarget: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#1B2A4A' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A9AB0', marginTop: 4 }}>
                <span>30 min</span><span>8 hours</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Add a goal */}
        {step === 2 && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#8A9AB0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Step 2 of 3</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#1B2A4A', marginBottom: 8, lineHeight: 1.2 }}>
              Add your first <em style={{ color: '#7A9E87' }}>goal</em>
            </h1>
            <p style={{ color: '#8A9AB0', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
              What are you trying to learn? Be specific — the more detail, the smarter the system.
            </p>

            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 20px rgba(27,42,74,0.08)', marginBottom: 16 }}>
              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Category</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCurrentGoal(g => ({ ...g, category: cat }))}
                      style={{
                        padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 700, fontFamily: 'inherit', letterSpacing: '0.5px',
                        background: currentGoal.category === cat ? CATEGORY_COLORS[cat] : 'rgba(0,0,0,0.05)',
                        color: currentGoal.category === cat ? 'white' : '#8A9AB0',
                        transition: 'all 0.2s',
                      }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>What do you want to learn?</label>
                <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(27,42,74,0.1)', fontSize: 14, fontFamily: 'inherit', color: '#1B2A4A', background: '#F7F3EC', outline: 'none' }}
                  placeholder="e.g. Learn React, Pass AWS exam..."
                  value={currentGoal.title}
                  onChange={e => setCurrentGoal(g => ({ ...g, title: e.target.value }))}
                />
              </div>

              {/* Why */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Why does this matter to you?</label>
                <textarea style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(27,42,74,0.1)', fontSize: 14, fontFamily: 'inherit', color: '#1B2A4A', background: '#F7F3EC', outline: 'none', resize: 'vertical', minHeight: 70 }}
                  placeholder="This is shown back to you when you're losing motivation..."
                  value={currentGoal.why}
                  onChange={e => setCurrentGoal(g => ({ ...g, why: e.target.value }))}
                />
              </div>

              {/* Deadline + Target */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Deadline</label>
                  <input type="date" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(27,42,74,0.1)', fontSize: 13, fontFamily: 'inherit', color: '#1B2A4A', background: '#F7F3EC', outline: 'none' }}
                    value={currentGoal.deadline}
                    onChange={e => setCurrentGoal(g => ({ ...g, deadline: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Target Mastery</label>
                  <select style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(27,42,74,0.1)', fontSize: 13, fontFamily: 'inherit', color: '#1B2A4A', background: '#F7F3EC', outline: 'none' }}
                    value={currentGoal.targetMastery}
                    onChange={e => setCurrentGoal(g => ({ ...g, targetMastery: e.target.value }))}>
                    {MASTERY_LEVELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Topics */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A6A80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Topics to cover</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid rgba(27,42,74,0.1)', fontSize: 13, fontFamily: 'inherit', background: '#F7F3EC', outline: 'none', color: '#1B2A4A' }}
                    placeholder="Type a topic and press Enter..."
                    value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTopic(topicInput)}
                  />
                  <button onClick={() => addTopic(topicInput)}
                    style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#1B2A4A', color: 'white', cursor: 'pointer', fontSize: 16 }}>
                    +
                  </button>
                </div>
                {/* Suggested topics */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {SUGGESTED_TOPICS[currentGoal.category].map(t => (
                    <button key={t} onClick={() => addTopic(t)}
                      style={{ padding: '4px 10px', borderRadius: 20, border: '1px dashed rgba(27,42,74,0.2)', background: 'transparent', fontSize: 11, color: '#8A9AB0', cursor: 'pointer', fontFamily: 'inherit' }}>
                      + {t}
                    </button>
                  ))}
                </div>
                {/* Added topics */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {currentGoal.topics.map(t => (
                    <span key={t.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: '#1B2A4A', color: 'white', fontSize: 12 }}>
                      {t.name}
                      <button onClick={() => removeTopic(t.name)} style={{ border: 'none', background: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={addGoal}
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px dashed rgba(27,42,74,0.2)', background: 'transparent', color: '#5A6A80', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}>
              + Save this goal & add another
            </button>

            {/* Saved goals list */}
            {goals.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {goals.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'white', borderRadius: 10, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[g.category], flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#1B2A4A', fontWeight: 500 }}>{g.title}</span>
                    <span style={{ fontSize: 11, color: '#8A9AB0', marginLeft: 'auto' }}>{g.topics.length} topics</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#8A9AB0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Step 3 of 3</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#1B2A4A', marginBottom: 8, lineHeight: 1.2 }}>
              You're all <em style={{ color: '#7A9E87' }}>set</em>
            </h1>
            <p style={{ color: '#8A9AB0', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
              Here's what LearnOS will track for you. You can add more goals anytime.
            </p>

            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 20px rgba(27,42,74,0.08)', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: 16, background: '#F7F3EC', borderRadius: 10 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1B2A4A' }}>{user.dailyTarget}h</div>
                  <div style={{ fontSize: 11, color: '#8A9AB0', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 4 }}>Daily Target</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: 16, background: '#F7F3EC', borderRadius: 10 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1B2A4A' }}>{goals.length}</div>
                  <div style={{ fontSize: 11, color: '#8A9AB0', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 4 }}>Goals</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: 16, background: '#F7F3EC', borderRadius: 10 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1B2A4A' }}>{goals.reduce((sum, g) => sum + g.topics.length, 0)}</div>
                  <div style={{ fontSize: 11, color: '#8A9AB0', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 4 }}>Topics</div>
                </div>
              </div>

              {goals.map(g => (
                <div key={g.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(27,42,74,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[g.category] }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1B2A4A' }}>{g.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8A9AB0', fontStyle: 'italic', marginBottom: 6 }}>"{g.why}"</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {g.topics.map(t => (
                      <span key={t.name} style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(27,42,74,0.06)', fontSize: 11, color: '#5A6A80' }}>{t.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {goals.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: '#C9857A', marginBottom: 16 }}>
                ⚠ Go back and add at least one goal!
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && <div style={{ color: '#C9857A', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</div>}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ padding: '14px 24px', borderRadius: 12, border: '1.5px solid rgba(27,42,74,0.15)', background: 'transparent', color: '#5A6A80', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
              ← Back
            </button>
          )}
          <button onClick={handleComplete} disabled={loading}
            style={{ flex: 1, padding: '14px 24px', borderRadius: 12, border: 'none', background: '#1B2A4A', color: 'white', fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}>
            {loading ? 'Setting up...' : step === 3 ? "Let's go →" : 'Continue →'}
          </button>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}