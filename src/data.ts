import type { Task } from './types';

const STORAGE_KEY = 'taskboard.tasks.v1';

// Demo seed data shown on first run.
const SEED: Task[] = [
  { id: 'seed-1', title: 'Review pull request #42', done: true, priority: 'high', dueDate: '2026-10-02', createdAt: '2026-09-28T09:00:00Z', tags: ['work'] },
  { id: 'seed-2', title: 'Update landing page hero copy', done: false, priority: 'medium', dueDate: '2026-10-08', createdAt: '2026-09-29T09:00:00Z', tags: ['client', 'design'] },
  { id: 'seed-3', title: 'Fix mobile nav overlap on small screens', done: false, priority: 'high', dueDate: '2026-10-06', createdAt: '2026-09-30T09:00:00Z', tags: ['work', 'urgent'] },
  { id: 'seed-4', title: 'Write release notes for v2.1', done: false, priority: 'low', dueDate: '2026-10-15', createdAt: '2026-10-01T09:00:00Z', tags: ['docs'] },
  { id: 'seed-5', title: 'Refactor date formatting helpers', done: true, priority: 'low', dueDate: '2026-09-30', createdAt: '2026-09-27T09:00:00Z', tags: ['work'] },
  { id: 'seed-6', title: 'Add empty-state illustration', done: false, priority: 'medium', dueDate: '2026-10-12', createdAt: '2026-10-02T09:00:00Z', tags: ['design'] },
];

function readStored(): Task[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Task[]) : null;
  } catch {
    return null;
  }
}

export function persist(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // storage full or unavailable: the app still works in-memory
  }
}

// Simulated async fetch so the UI can demonstrate loading / error / empty states.
// Append ?demo=error to the URL to see the error state; ?demo=empty for the empty state.
export function fetchTasks(): Promise<Task[]> {
  const params = new URLSearchParams(window.location.search);
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (params.get('demo') === 'error') {
        reject(new Error('Failed to load tasks (demo error state).'));
        return;
      }
      if (params.get('demo') === 'empty') {
        resolve([]);
        return;
      }
      const stored = readStored();
      resolve(stored ?? SEED);
    }, 900);
  });
}
