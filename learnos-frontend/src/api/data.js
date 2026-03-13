const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export async function setupUser(data) {
  try {
    const r = await fetch(`${API}/users/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await r.json();
  } catch {
    return { success: true };
  }
}

export async function getUser(userId) {
  try {
    const r = await fetch(`${API}/users/me?userId=${userId}`);
    return await r.json();
  } catch {
    return { exists: false };
  }
}

export async function logSession(session) {
  try {
    const r = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return await r.json();
  } catch {
    return { success: true };
  }
}

// keep old name as alias so nothing else breaks
export const submitSession = logSession;

export const mockInsights = [
  { id: 1, type: 'STREAK', severity: 'info', message: 'Welcome to LearnOS! Log your first session to start tracking your progress.' },
  { id: 2, type: 'GOAL_RISK', severity: 'warning', message: 'Add topics to your goals so the system can track your mastery over time.' },
];

export const mockLEI = {
  score: 0, risk: 'HIGH',
  productivity: 0, mastery: 0, retention: 0,
  topicPriority: 0, deadline: 0, goalProgress: 0,
  cognitive: 100, motivation: 50,
};

export const mockUser = {
  name: 'Amruta',
  learnerType: 'BOTH',
  dailyTarget: 2,
};

export const mockGoals = [
  {
    id: 1, title: 'Data Structures & Algorithms', category: 'ACADEMIC',
    why: 'Crack placements', deadline: '2026-05-01', targetMastery: 'PROFICIENT', progress: 48,
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
    id: 2, title: 'Learn React', category: 'SKILL',
    why: 'Build my own product', deadline: '2026-05-01', targetMastery: 'COMPETENT', progress: 62,
    topics: [
      { name: 'JSX & Components', mastery: 'PROFICIENT' },
      { name: 'Props & State', mastery: 'COMPETENT' },
      { name: 'Hooks', mastery: 'FAMILIAR' },
      { name: 'React Router', mastery: 'EXPOSED' },
      { name: 'Context API', mastery: 'UNAWARE' },
    ],
  },
  {
    id: 3, title: 'AWS Cloud Practitioner', category: 'CERTIFICATION',
    why: 'Cloud skills for any dev role', deadline: '2026-06-01', targetMastery: 'COMPETENT', progress: 30,
    topics: [
      { name: 'Cloud Concepts', mastery: 'COMPETENT' },
      { name: 'IAM & Security', mastery: 'FAMILIAR' },
      { name: 'EC2 & Networking', mastery: 'EXPOSED' },
      { name: 'S3 & Storage', mastery: 'UNAWARE' },
      { name: 'Lambda & Serverless', mastery: 'UNAWARE' },
    ],
  },
];
