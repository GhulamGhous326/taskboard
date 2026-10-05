import type { DayCell, DueInfo, FilterState, Stats, Task } from './types';

// Pure business logic: filtering, sorting, stats, mutations, calendar helpers.
// Kept UI-free so it is unit-testable (see logic.test.ts).

const PRIORITY_RANK: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

export function filterTasks(tasks: Task[], f: FilterState): Task[] {
  const q = f.query.trim().toLowerCase();
  let out = tasks.filter((t) => {
    if (f.status === 'active' && t.done) return false;
    if (f.status === 'completed' && !t.done) return false;
    if (f.priority !== 'all' && t.priority !== f.priority) return false;
    if (f.tag !== 'all' && !t.tags.includes(f.tag)) return false;
    if (q && !t.title.toLowerCase().includes(q) && !t.tags.some((tag) => tag.includes(q))) return false;
    return true;
  });
  out = [...out].sort((a, b) => {
    if (f.sort === 'newest') return b.createdAt.localeCompare(a.createdAt);
    if (f.sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (f.sort === 'due') {
      const r = a.dueDate.localeCompare(b.dueDate);
      return r !== 0 ? r : PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    }
    // priority: high first, then newest
    const r = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return r !== 0 ? r : b.createdAt.localeCompare(a.createdAt);
  });
  return out;
}

export function computeStats(tasks: Task[]): Stats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const active = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, active, completionRate };
}

export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id);
}

export function clearCompleted(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.done);
}

export function editTask(tasks: Task[], id: string, title: string): Task[] {
  const v = title.trim();
  if (!v) return tasks;
  return tasks.map((t) => (t.id === id ? { ...t, title: v } : t));
}

export function addTask(
  tasks: Task[],
  input: { title: string; priority: Task['priority']; dueDate: string; tags: string[] },
): Task[] {
  const title = input.title.trim();
  if (!title) return tasks;
  const now = new Date().toISOString();
  const task: Task = {
    id: `t-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    title,
    done: false,
    priority: input.priority,
    dueDate: input.dueDate,
    createdAt: now,
    tags: input.tags,
  };
  return [task, ...tasks];
}

/** Parse a comma-separated tag input into a deduped, lowercased list (max 5). */
export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  for (const part of input.split(',')) {
    const v = part.trim().toLowerCase();
    if (v && !seen.has(v)) seen.add(v);
    if (seen.size >= 5) break;
  }
  return [...seen];
}

/** Sorted unique tag list across all tasks. */
export function allTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  for (const t of tasks) for (const tag of t.tags) set.add(tag);
  return [...set].sort();
}

export function isOverdue(t: Task, todayIso: string): boolean {
  return !t.done && t.dueDate < todayIso;
}

const DAY_MS = 86_400_000;

export function dueLabel(dueDate: string, todayIso: string, done: boolean): DueInfo {
  if (done) return { text: 'Done', tone: 'muted' };
  const diff = Math.round((Date.parse(dueDate) - Date.parse(todayIso)) / DAY_MS);
  if (diff < 0) return { text: diff === -1 ? 'Overdue by 1d' : `Overdue by ${-diff}d`, tone: 'danger' };
  if (diff === 0) return { text: 'Due today', tone: 'warn' };
  if (diff === 1) return { text: 'Due tomorrow', tone: 'warn' };
  return { text: `Due in ${diff}d`, tone: 'muted' };
}

/** 6-week month grid, weeks starting Monday. month is 0-11. */
export function getMonthGrid(year: number, month: number): DayCell[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const leadDays = (first.getUTCDay() + 6) % 7; // Monday-first offset
  const cursor = new Date(Date.UTC(year, month, 1 - leadDays));
  const weeks: DayCell[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        iso: cursor.toISOString().slice(0, 10),
        inMonth: cursor.getUTCMonth() === month,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Group tasks by their due-date ISO string. */
export function groupTasksByDue(tasks: Task[]): Record<string, Task[]> {
  const map: Record<string, Task[]> = {};
  for (const t of tasks) {
    (map[t.dueDate] ??= []).push(t);
  }
  return map;
}
