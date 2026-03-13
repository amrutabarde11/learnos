import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8080/api';

export default function Quiz({ topic, goalTitle, mastery, onFinish, onSkip }) {
  const [phase, setPhase] = useState('loading'); // loading | quiz | result
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, goalTitle, mastery }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.questions?.length > 0) {
          setQuestions(data.questions);
          setPhase('quiz');
        } else {
          setError('Could not generate questions. Try again!');
          setPhase('error');
        }
      })
      .catch(() => { setError('Backend unreachable.'); setPhase('error'); });
  }, [topic, goalTitle, mastery]);

  const handleSelect = (opt) => {
    if (selected) return;
    setSelected(opt);
    setShowExplanation(true);
  };

  const handleNext = async () => {
    const q = questions[current];
    const optLetter = selected?.charAt(0);
    const newAnswers = [...answers, { questionId: q.id, given: optLetter, correct: q.correct }];
    setAnswers(newAnswers);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      // evaluate
      const res = await fetch(`${API}/quiz/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers }),
      }).then(r => r.json());
      setResult(res);
      setPhase('result');
    }
  };

  const q = questions[current];
  const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0;

  if (phase === 'loading') return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 16, animation: 'spin 1s linear infinite' }}>✦</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1B2A4A', marginBottom: 8 }}>
            Generating your quiz...
          </div>
          <div style={{ color: '#8A9AB0', fontSize: 14 }}>Asking Gemini about {topic}</div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (phase === 'error') return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠</div>
          <div style={{ color: '#C9857A', marginBottom: 20 }}>{error}</div>
          <button style={styles.btnOutline} onClick={onSkip}>Skip Quiz</button>
        </div>
      </div>
    </div>
  );

  if (phase === 'result') return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>
            {result.percentage === 100 ? '🏆' : result.percentage >= 66 ? '🎯' : result.percentage >= 33 ? '📚' : '💪'}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1B2A4A', marginBottom: 6 }}>
            {result.score}/{result.total} correct
          </div>
          <div style={{
            display: 'inline-block', padding: '4px 16px', borderRadius: 20,
            background: result.percentage >= 66 ? 'rgba(122,158,135,0.15)' : 'rgba(196,168,79,0.15)',
            color: result.percentage >= 66 ? '#4A8A60' : '#A08020',
            fontSize: 13, fontWeight: 600, marginBottom: 16
          }}>
            {result.percentage}%
          </div>
          <p style={{ color: '#5A6A80', fontSize: 14, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.6 }}>
            {result.feedback}
          </p>
        </div>

        {/* Answer review */}
        {questions.map((q, i) => {
          const given = answers[i]?.given;
          const correct = q.correct;
          const isCorrect = given === correct;
          return (
            <div key={q.id} style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 10, background: isCorrect ? 'rgba(122,158,135,0.1)' : 'rgba(201,133,122,0.1)', border: `1px solid ${isCorrect ? 'rgba(122,158,135,0.3)' : 'rgba(201,133,122,0.3)'}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1B2A4A', marginBottom: 6 }}>{q.question}</div>
              <div style={{ fontSize: 12, color: isCorrect ? '#4A8A60' : '#C9857A' }}>
                {isCorrect ? '✓' : '✗'} Your answer: {given || '—'} · Correct: {correct}
              </div>
              <div style={{ fontSize: 12, color: '#8A9AB0', marginTop: 4, fontStyle: 'italic' }}>{q.explanation}</div>
            </div>
          );
        })}

        <button style={{ ...styles.btnPrimary, width: '100%', marginTop: 8 }} onClick={onFinish}>
          Back to Dashboard →
        </button>
      </div>
    </div>
  );

  // Quiz phase
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: '#8A9AB0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
              Quick Quiz · {topic}
            </div>
            <div style={{ fontSize: 13, color: '#5A6A80' }}>Question {current + 1} of {questions.length}</div>
          </div>
          <button onClick={onSkip} style={{ border: 'none', background: 'none', color: '#8A9AB0', fontSize: 13, cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}>
            Skip →
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(27,42,74,0.08)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#7A9E87', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>

        {/* Question */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1B2A4A', marginBottom: 24, lineHeight: 1.4 }}>
          {q.question}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map(opt => {
            const optLetter = opt.charAt(0);
            const isSelected = selected === opt;
            const isCorrect = optLetter === q.correct;
            let bg = 'white', border = 'rgba(27,42,74,0.1)', color = '#1B2A4A';
            if (selected) {
              if (isCorrect) { bg = 'rgba(122,158,135,0.15)'; border = '#7A9E87'; color = '#2A6A40'; }
              else if (isSelected) { bg = 'rgba(201,133,122,0.15)'; border = '#C9857A'; color = '#A03020'; }
            }
            return (
              <button key={opt} onClick={() => handleSelect(opt)}
                style={{ padding: '14px 18px', borderRadius: 12, border: `1.5px solid ${border}`, background: bg, color, fontSize: 14, fontFamily: 'inherit', textAlign: 'left', cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s', fontWeight: isSelected || (selected && isCorrect) ? 600 : 400 }}>
                {opt}
                {selected && isCorrect && <span style={{ float: 'right' }}>✓</span>}
                {selected && isSelected && !isCorrect && <span style={{ float: 'right' }}>✗</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(139,123,173,0.1)', border: '1px solid rgba(139,123,173,0.2)', marginBottom: 20, fontSize: 13, color: '#5A3A80', lineHeight: 1.55 }}>
            💡 {q.explanation}
          </div>
        )}

        {selected && (
          <button style={{ ...styles.btnPrimary, width: '100%' }} onClick={handleNext}>
            {current + 1 < questions.length ? 'Next Question →' : 'See Results →'}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 580, margin: '0 auto', padding: '20px 0' },
  card: { background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 32px rgba(27,42,74,0.1)' },
  btnPrimary: { padding: '13px 24px', borderRadius: 12, border: 'none', background: '#1B2A4A', color: 'white', fontSize: 15, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' },
  btnOutline: { padding: '13px 24px', borderRadius: 12, border: '1.5px solid rgba(27,42,74,0.15)', background: 'transparent', color: '#5A6A80', fontSize: 15, fontFamily: 'inherit', cursor: 'pointer' },
};