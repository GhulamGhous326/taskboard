import type { Task } from './types';

const STORAGE_KEY = 'taskboard.tasks.v1';

// Demo seed data shown on first run.
// Due dates are RELATIVE to today (computed at load time) so the demo never
// goes stale: fixed calendar dates would leave the calendar empty once the
// month has passed. Dates are UTC-based, matching the calendar grid logic.
const DAY_MS = 86_400_000;
const isoDate = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);
const isoDateTime = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * DAY_MS).toISOString();

const SEED: Task[] = [
  { id: 'seed-1', title: 'Review pull request #42', done: true, priority: 'high', dueDate: isoDate(-4), createdAt: isoDateTime(-8), tags: ['work'] },
  { id: 'seed-2', title: 'Update landing page hero copy', done: false, priority: 'medium', dueDate: isoDate(-2), createdAt: isoDateTime(-6), tags: ['client', 'design'] },
  { id: 'seed-3', title: 'Fix mobile nav overlap on small screens', done: false, priority: 'high', dueDate: isoDate(0), createdAt: isoDateTime(-5), tags: ['work', 'urgent'] },
  { id: 'seed-4', title: 'Write release notes for v2.1', done: false, priority: 'low', dueDate: isoDate(2), createdAt: isoDateTime(-3), tags: ['docs'] },
  { id: 'seed-5', title: 'Refactor date formatting helpers', done: true, priority: 'low', dueDate: isoDate(4), createdAt: isoDateTime(-2), tags: ['work'] },
  { id: 'seed-6', title: 'Add empty-state illustration', done: false, priority: 'medium', dueDate: isoDate(7), createdAt: isoDateTime(-1), tags: ['design'] },
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
