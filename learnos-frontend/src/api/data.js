const API = 'https://learnos-production.up.railway.app/api';

export async function getLEI(userId) {
  try {
    const url = userId ? `${API}/sessions/lei?userId=${encodeURIComponent(userId)}` : `${API}/sessions/lei`;
    const r = await fetch(url);
    return await r.json();
  } catch (e) { return mockLEI; }
}

export async function getInsights(userId) {
  try {
    const url = userId ? `${API}/sessions/insights?userId=${encodeURIComponent(userId)}` : `${API}/sessions/insights`;
    const r = await fetch(url);
    return await r.json();
  } catch (e) { return mockInsights; }
}

export async function logSession(session) {
  try {
    const r = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return await r.json();
  } catch (e) { return { success: false }; }
}

export async function getSessions(userId) {
  try {
    const url = userId ? `${API}/sessions?userId=${encodeURIComponent(userId)}` : `${API}/sessions`;
    const r = await fetch(url);
    return await r.json();
  } catch (e) { return []; }
}

export async function setupUser(userData) {
  try {
    const r = await fetch(`${API}/users/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await r.json();
  } catch (e) { return { success: false }; }
}

export const submitSession = logSession;

export const mockLEI = { score:0, risk:'HIGH', productivity:0, mastery:0, retention:0, topicPriority:0, deadline:0, goalProgress:0, cognitive:100, motivation:50 };
export const mockInsights = [
  { id:1, type:'STREAK', severity:'info', message:'Welcome to LearnOS! Log your first session to start tracking your progress.' },
  { id:2, type:'GOAL_RISK', severity:'warning', message:'Add topics to your goals so the system can track your mastery over time.' },
];
export const mockUser = { name:'Learner', learnerType:'BOTH', dailyTarget:2 };
export const mockGoals = [
  { id:1, title:'Data Structures & Algorithms', category:'ACADEMIC', why:'Crack placements', deadline:'2026-05-01', targetMastery:'PROFICIENT', progress:48,
    topics:[{name:'Arrays & Strings',mastery:'PROFICIENT'},{name:'Linked Lists',mastery:'COMPETENT'},{name:'Stacks & Queues',mastery:'FAMILIAR'},{name:'Trees & BST',mastery:'EXPOSED'},{name:'Graphs',mastery:'UNAWARE'},{name:'Dynamic Programming',mastery:'UNAWARE'}]},
  { id:2, title:'Learn React', category:'SKILL', why:'Build my own product', deadline:'2026-05-01', targetMastery:'COMPETENT', progress:62,
    topics:[{name:'JSX & Components',mastery:'PROFICIENT'},{name:'Props & State',mastery:'COMPETENT'},{name:'Hooks',mastery:'FAMILIAR'},{name:'React Router',mastery:'EXPOSED'},{name:'Context API',mastery:'UNAWARE'}]},
  { id:3, title:'AWS Cloud Practitioner', category:'CERTIFICATION', why:'Cloud skills for any dev role', deadline:'2026-06-01', targetMastery:'COMPETENT', progress:30,
    topics:[{name:'Cloud Concepts',mastery:'COMPETENT'},{name:'IAM & Security',mastery:'FAMILIAR'},{name:'EC2 & Networking',mastery:'EXPOSED'},{name:'S3 & Storage',mastery:'UNAWARE'},{name:'Lambda & Serverless',mastery:'UNAWARE'}]},
];
