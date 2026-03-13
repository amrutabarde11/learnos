import React, { useState, useEffect, useRef } from 'react';

const CATEGORIES = ['ACADEMIC', 'SKILL', 'CERTIFICATION', 'KNOWLEDGE'];
const CAT_ICONS = { ACADEMIC: '📚', SKILL: '⚡', CERTIFICATION: '🏆', KNOWLEDGE: '🔭' };
const LEARNER_TYPES = [
  { value: 'ACADEMIC', label: 'Student', sub: 'Exams, degrees, structured learning' },
  { value: 'SKILL', label: 'Builder', sub: 'Side projects, new skills, self-taught' },
  { value: 'BOTH', label: 'Both', sub: 'I do it all' },
];

function FloatingOrb({ style }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none', ...style }} />;
}

function Particle({ delay, duration, x, y, size }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: '50%',
      background: 'white', opacity: 0,
      animation: `floatUp ${duration}s ${delay}s infinite ease-in-out`,
      pointerEvents: 'none',
    }} />
  );
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0); // 0=splash, 1=name+type, 2=goal, 3=done
  const [name, setName] = useState('');
  const [learnerType, setLearnerType] = useState('');
  const [dailyTarget, setDailyTarget] = useState(2);
  const [goal, setGoal] = useState({ title: '', category: 'ACADEMIC', deadline: '', why: '' });
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const inputRef = useRef();

  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 6,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 4,
  }));

  const transition = (nextStep) => {
    setAnimating(true);
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
      setAnimating(false);
    }, 400);
  };

  const addTopic = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && topicInput.trim()) {
      e.preventDefault();
      if (!topics.find(t => t.name === topicInput.trim())) {
        setTopics([...topics, { name: topicInput.trim(), mastery: 'UNAWARE' }]);
      }
      setTopicInput('');
    }
  };

  const removeTopic = (name) => setTopics(topics.filter(t => t.name !== name));

  const handleComplete = () => {
    const userData = {
      name, learnerType, dailyTarget,
      goals: [{
        id: 1,
        title: goal.title || 'My First Goal',
        category: goal.category,
        deadline: goal.deadline,
        why: goal.why,
        targetMastery: 'COMPETENT',
        topics: topics.length > 0 ? topics : [{ name: 'Getting Started', mastery: 'UNAWARE' }],
      }]
    };
    transition(3);
    setTimeout(() => onComplete(userData), 1800);
  };

  const canProceed1 = name.trim().length > 0 && learnerType;
  const canProceed2 = goal.title.trim().length > 0;

  return (
    <div style={{
      minHeight: '100vh', background: '#080C14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0px) scale(0.5); }
          20% { opacity: 0.6; }
          80% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-120px) scale(1.2); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-24px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ob-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: white;
          padding: 14px 18px;
          font-size: 16px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .ob-input:focus {
          border-color: rgba(122,158,135,0.6);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(122,158,135,0.1);
        }
        .ob-input::placeholder { color: rgba(255,255,255,0.25); }
        .ob-btn {
          padding: 14px 32px;
          border-radius: 50px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .ob-btn:hover { transform: translateY(-2px); }
        .ob-btn:active { transform: translateY(0); }
        .ob-btn-primary {
          background: linear-gradient(135deg, #7A9E87, #4A8A60);
          color: white;
          box-shadow: 0 4px 20px rgba(122,158,135,0.3);
        }
        .ob-btn-primary:disabled {
          opacity: 0.4; cursor: not-allowed; transform: none;
        }
        .ob-btn-ghost {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .type-card {
          padding: 16px 20px;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .type-card:hover { border-color: rgba(122,158,135,0.4); background: rgba(122,158,135,0.05); }
        .type-card.selected { border-color: #7A9E87; background: rgba(122,158,135,0.1); }
        .topic-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px;
          background: rgba(122,158,135,0.15);
          border: 1px solid rgba(122,158,135,0.3);
          color: #9DC4AC; font-size: 13px; font-weight: 500;
        }
        .topic-chip button {
          border: none; background: none; color: rgba(122,158,135,0.6);
          cursor: pointer; padding: 0; font-size: 14px; line-height: 1;
        }
        .step-dot {
          width: 6px; height: 6px; border-radius: 50%;
          transition: all 0.3s;
        }
      `}</style>

      {/* Floating orbs */}
      <FloatingOrb style={{ width: 400, height: 400, background: '#7A9E87', top: '-10%', right: '-5%', animation: 'orbFloat 8s ease-in-out infinite' }} />
      <FloatingOrb style={{ width: 300, height: 300, background: '#8B7BAD', bottom: '-5%', left: '-8%', animation: 'orbFloat 10s ease-in-out infinite reverse' }} />
      <FloatingOrb style={{ width: 200, height: 200, background: '#C4A84F', top: '40%', left: '10%', animation: 'orbFloat 12s ease-in-out infinite' }} />

      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: 520, padding: '0 24px',
        animation: visible ? 'slideIn 0.4s ease forwards' : 'slideOut 0.35s ease forwards',
      }}>

        {/* Step dots */}
        {step > 0 && step < 3 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 40 }}>
            {[1, 2].map(s => (
              <div key={s} className="step-dot" style={{
                background: step >= s ? '#7A9E87' : 'rgba(255,255,255,0.15)',
                width: step === s ? 20 : 6,
              }} />
            ))}
          </div>
        )}

        {/* STEP 0 — Splash */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 20, animation: 'pulse 3s ease-in-out infinite' }}>✦</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, color: 'white', margin: '0 0 16px', lineHeight: 1.15, fontWeight: 400 }}>
              Your personal<br /><em style={{ color: '#9DC4AC' }}>learning OS</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, lineHeight: 1.7, margin: '0 auto 48px', maxWidth: 360 }}>
              Track what you're learning. Know what to study next. Let AI show you exactly how you're improving.
            </p>
            <button className="ob-btn ob-btn-primary" onClick={() => transition(1)} style={{ fontSize: 16, padding: '16px 48px' }}>
              Get started →
            </button>
            <div style={{ marginTop: 20, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Takes less than 60 seconds</div>
          </div>
        )}

        {/* STEP 1 — Name + Type */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 36 }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>Step 1 of 2</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'white', margin: '0 0 8px', fontWeight: 400 }}>
                Let's get to know you
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, margin: 0 }}>Quick, we promise.</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 8 }}>Your name</label>
              <input ref={inputRef} className="ob-input" placeholder="What should we call you?" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canProceed1 && transition(2)}
                autoFocus />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 10 }}>I am a...</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LEARNER_TYPES.map(t => (
                  <div key={t.value} className={`type-card ${learnerType === t.value ? 'selected' : ''}`}
                    onClick={() => setLearnerType(t.value)}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{t.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{t.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 10 }}>
                Daily study target: <span style={{ color: '#9DC4AC' }}>{dailyTarget}h</span>
              </label>
              <input type="range" min="0.5" max="8" step="0.5" value={dailyTarget}
                onChange={e => setDailyTarget(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#7A9E87', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 4 }}>
                <span>30 min</span><span>8 hours</span>
              </div>
            </div>

            <button className="ob-btn ob-btn-primary" onClick={() => transition(2)} disabled={!canProceed1} style={{ width: '100%' }}>
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — First Goal */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>Step 2 of 2</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'white', margin: '0 0 8px', fontWeight: 400 }}>
                What are you learning?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, margin: 0 }}>Start with one goal. You can add more later.</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 8 }}>Goal title</label>
              <input className="ob-input" placeholder="e.g. Learn Python, Pass AWS exam..." value={goal.title}
                onChange={e => setGoal({ ...goal, title: e.target.value })} autoFocus />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 10 }}>Category</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setGoal({ ...goal, category: c })}
                    style={{
                      padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s',
                      background: goal.category === c ? 'rgba(122,158,135,0.25)' : 'rgba(255,255,255,0.05)',
                      color: goal.category === c ? '#9DC4AC' : 'rgba(255,255,255,0.35)',
                      borderColor: goal.category === c ? 'rgba(122,158,135,0.4)' : 'transparent',
                      outline: goal.category === c ? '1px solid rgba(122,158,135,0.4)' : '1px solid transparent',
                    }}>
                    {CAT_ICONS[c]} {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 8 }}>Target date <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none', fontSize: 11 }}>(optional)</span></label>
              <input type="date" className="ob-input" value={goal.deadline}
                onChange={e => setGoal({ ...goal, deadline: e.target.value })}
                style={{ colorScheme: 'dark' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 8 }}>Topics <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none', fontSize: 11 }}>(optional — press Enter to add)</span></label>
              <input className="ob-input" placeholder="e.g. Arrays, React Hooks, EC2..." value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                onKeyDown={addTopic} />
              {topics.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {topics.map(t => (
                    <span key={t.name} className="topic-chip">
                      {t.name}
                      <button onClick={() => removeTopic(t.name)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button className="ob-btn ob-btn-ghost" onClick={() => transition(1)}>← Back</button>
              <button className="ob-btn ob-btn-primary" onClick={handleComplete} disabled={!canProceed2} style={{ flex: 1 }}>
                Launch LearnOS ✦
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Done */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 20, animation: 'spin 2s linear infinite' }}>✦</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: 'white', margin: '0 0 12px', fontWeight: 400 }}>
              Welcome, <em style={{ color: '#9DC4AC' }}>{name}</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Setting up your learning OS...</p>
          </div>
        )}

      </div>
    </div>
  );
}
