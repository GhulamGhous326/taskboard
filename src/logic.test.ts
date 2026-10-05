import { describe, it, expect } from 'vitest';
import {
  filterTasks,
  computeStats,
  toggleTask,
  removeTask,
  addTask,
  isOverdue,
} from './logic';
import type { Task } from './types';

const base: Task[] = [
  { id: '1', title: 'Fix login bug', done: true, priority: 'high', dueDate: '2026-10-01', createdAt: '2026-09-20T10:00:00Z' },
  { id: '2', title: 'Write docs', done: false, priority: 'low', dueDate: '2026-10-20', createdAt: '2026-09-22T10:00:00Z' },
  { id: '3', title: 'Login page redesign', done: false, priority: 'medium', dueDate: '2026-10-05', createdAt: '2026-09-21T10:00:00Z' },
];

describe('filterTasks', () => {
  it('filters by status', () => {
    expect(filterTasks(base, { query: '', status: 'completed', sort: 'newest' })).toHaveLength(1);
    expect(filterTasks(base, { query: '', status: 'active', sort: 'newest' })).toHaveLength(2);
    expect(filterTasks(base, { query: '', status: 'all', sort: 'newest' })).toHaveLength(3);
  });

  it('filters by search query (case-insensitive)', () => {
    const out = filterTasks(base, { query: 'LOGIN', status: 'all', sort: 'newest' });
    expect(out.map((t) => t.id).sort()).toEqual(['1', '3']);
  });

  it('sorts newest first by default', () => {
    const out = filterTasks(base, { query: '', status: 'all', sort: 'newest' });
    expect(out.map((t) => t.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by priority (high first)', () => {
    const out = filterTasks(base, { query: '', status: 'all', sort: 'priority' });
    expect(out.map((t) => t.id)).toEqual(['1', '3', '2']);
  });
});

describe('computeStats', () => {
  it('computes totals and rate', () => {
    expect(computeStats(base)).toEqual({ total: 3, completed: 1, active: 2, completionRate: 33 });
  });

  it('handles the empty list without dividing by zero', () => {
    expect(computeStats([])).toEqual({ total: 0, completed: 0, active: 0, completionRate: 0 });
  });
});

describe('mutations', () => {
  it('toggleTask flips done without mutating the original', () => {
    const out = toggleTask(base, '2');
    expect(out.find((t) => t.id === '2')?.done).toBe(true);
    expect(base.find((t) => t.id === '2')?.done).toBe(false);
  });

  it('removeTask drops the task', () => {
    expect(removeTask(base, '1')).toHaveLength(2);
    expect(removeTask(base, 'nope')).toHaveLength(3);
  });

  it('addTask prepends a valid task and rejects blank titles', () => {
    const out = addTask(base, { title: '  New task  ', priority: 'high', dueDate: '2026-11-01' });
    expect(out).toHaveLength(4);
    expect(out[0].title).toBe('New task');
    expect(out[0].done).toBe(false);
    expect(addTask(base, { title: '   ', priority: 'low', dueDate: '2026-11-01' })).toHaveLength(3);
  });
});

describe('isOverdue', () => {
  it('flags unfinished past-due tasks only', () => {
    expect(isOverdue(base[2], '2026-10-06')).toBe(true);
    expect(isOverdue(base[2], '2026-10-05')).toBe(false);
    expect(isOverdue(base[0], '2026-10-06')).toBe(false); // done
  });
});
