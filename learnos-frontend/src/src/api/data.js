const API = 'http://localhost:8080/api';

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

export async function getUser() {
  try {
    const r = await fetch(`${API}/users/me`);
    return await r.json();
  } catch {
    return { exists: false };
  }
}

export async function submitSession(session) {
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
