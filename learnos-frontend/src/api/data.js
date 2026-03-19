onst API = process.env.REACT_APP_API_URL || 'https://learnos-production.up.railway.app/api';

export async function getLEI(userId) {
  try {
    const url = userId ? `${API}/sessions/lei?userId=${encodeURIComponent(userId)}` : `${API}/sessions/lei`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Failed');
    return await r.json();
  } catch (e) {
    console.error('getLEI error:', e);
    return mockLEI;
  }
}

export async function getInsights(userId) {
  try {
    const url = userId ? `${API}/sessions/insights?userId=${encodeURIComponent(userId)}` : `${API}/sessions/insights`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Failed');
    return await r.json();
  } catch (e) {
    console.error('getInsights error:', e);
    return mockInsights;
  }
}

export async function logSession(session) {
  try {
    const r = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    if (!r.ok) throw new Error('Failed');
    return await r.json();
  } catch (e) {
    console.error('logSession error:', e);
    return { success: false };
  }
}

export async function getSessions(userId) {
  try {
    const url = userId ? `${API}/sessions?userId=${encodeURIComponent(userId)}` : `${API}/sessions`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Failed');
    return await r.json();
  } catch (e) {
    console.error('getSessions error:', e);
    return [];
  }
}

export async function setupUser(userData) {
  try {
    const r = await fetch(`${API}/users/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!r.ok) throw new Error('Failed');
    return await r.json();
  } catch (e) {
    console.error('setupUser error:', e);
    return { success: false };
  }
}

export const submitSession = logSession;

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

export const mockUser = {
  name: 'Learner',
  learnerType: 'BOTH',
  dailyTarget: 2,
};

export const mockGoals = [];