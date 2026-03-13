// api/data.js — API client + mock fallbacks

const API_BASE = 'http://localhost:8080/api';

// ── Mock fallbacks (used only if backend is down) ──────────────
export const mockUser = {
  name: 'Amruta',
  learnerType: 'BOTH',
  dailyTarget: 3,
};

export const mockLEI = {
  score: 0, risk: 'HIGH',
  productivity: 0, mastery: 0, retention: 0,
  topicPriority: 0, deadline: 0, goalProgress: 0,
  cognitive: 100, motivation: 50,
};

export const mockInsights = [
  { id: 1, type: 'STREAK', severity: 'info', message: 'Welcome to LearnOS! Log your first session to start tracking your progress.' },
  { id: 2, type: 'GOAL_RISK', severity: 'warning', message: 'Add topics to your goals so the system can track your mastery over time.' },
];

export const mockGoals = [
  {
    id: 1,
    title: 'Data Structures & Algorithms',
    category: 'ACADEMIC',
    why: 'I want to crack top tech company interviews',
    deadline: '2026-04-15',
    targetMastery: 'PROFICIENT',
    progress: 48,
    topics: [
      { name: 'Arrays & Strings', mastery: 'PROFICIENT' },
      { name: 'Linked Lists', mastery: 'COMPETENT' },
      { name: 'Stacks & Queues', mastery: 'FAMILIAR' },
      { name: 'Trees & BST', mastery: 'EXPOSED' },
      { name: 'Graphs', mastery: 'UNAWARE' },
      { name: 'Dynamic Programming', mastery: 'UNAWARE' },
    ],
  },
  {
    id: 2,
    title: 'Learn React',
    category: 'SKILL',
    why: 'I want to build my own product from scratch',
    deadline: '2026-05-01',
    targetMastery: 'COMPETENT',
    progress: 62,
    topics: [
      { name: 'JSX & Components', mastery: 'PROFICIENT' },
      { name: 'Props & State', mastery: 'COMPETENT' },
      { name: 'Hooks', mastery: 'FAMILIAR' },
      { name: 'React Router', mastery: 'EXPOSED' },
      { name: 'Context API', mastery: 'UNAWARE' },
    ],
  },
  {
    id: 3,
    title: 'AWS Cloud Practitioner',
    category: 'CERTIFICATION',
    why: 'Cloud skills are essential for any developer role',
    deadline: '2026-06-01',
    targetMastery: 'COMPETENT',
    progress: 30,
    topics: [
      { name: 'Cloud Concepts', mastery: 'COMPETENT' },
      { name: 'IAM & Security', mastery: 'FAMILIAR' },
      { name: 'EC2 & Networking', mastery: 'EXPOSED' },
      { name: 'S3 & Storage', mastery: 'UNAWARE' },
      { name: 'Lambda & Serverless', mastery: 'UNAWARE' },
    ],
  },
];

export const mockFocus = {
  topic: 'Trees & BST',
  goal: 'Data Structures & Algorithms',
  reason: 'High priority, 12 days to exam, currently EXPOSED',
};

// ── Real API calls ─────────────────────────────────────────────

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (e) {
    return { status: 'offline' };
  }
}

export async function getLEI() {
  try {
    const res = await fetch(`${API_BASE}/sessions/lei`);
    return await res.json();
  } catch (e) {
    return mockLEI;
  }
}

export async function getInsights() {
  try {
    const res = await fetch(`${API_BASE}/sessions/insights`);
    return await res.json();
  } catch (e) {
    return mockInsights;
  }
}

export async function getSessions() {
  try {
    const res = await fetch(`${API_BASE}/sessions`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function logSession(session) {
  try {
    console.log('Submitting session:', session);
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    const data = await res.json();
    console.log('Session response:', data);
    return data;
  } catch (e) {
    console.error('Session error:', e);
    return { success: true };
  }
}

// alias so any old imports still work
export const submitSession = logSession;

export async function generateQuiz(topic, goalTitle, mastery) {
  try {
    const res = await fetch(`${API_BASE}/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, goalTitle, mastery }),
    });
    return await res.json();
  } catch (e) {
    return { questions: [] };
  }
}

export async function setupUser(data) {
  try {
    const res = await fetch(`${API_BASE}/users/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    return { success: true };
  }
}
