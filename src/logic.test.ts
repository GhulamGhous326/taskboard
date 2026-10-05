import { describe, it, expect } from 'vitest';
import {
  filterTasks,
  computeStats,
  toggleTask,
  removeTask,
  clearCompleted,
  editTask,
  addTask,
  isOverdue,
  dueLabel,
} from './logic';
import type { FilterState, Task } from './types';

const base: Task[] = [
  { id: '1', title: 'Fix login bug', done: true, priority: 'high', dueDate: '2026-10-01', createdAt: '2026-09-20T10:00:00Z' },
  { id: '2', title: 'Write docs', done: false, priority: 'low', dueDate: '2026-10-20', createdAt: '2026-09-22T10:00:00Z' },
  { id: '3', title: 'Login page redesign', done: false, priority: 'medium', dueDate: '2026-10-05', createdAt: '2026-09-21T10:00:00Z' },
];

const F = (over: Partial<FilterState> = {}): FilterState => ({
  query: '',
  status: 'all',
  sort: 'newest',
  priority: 'all',
  ...over,
});

describe('filterTasks', () => {
  it('filters by status', () => {
    expect(filterTasks(base, F({ status: 'completed' }))).toHaveLength(1);
    expect(filterTasks(base, F({ status: 'active' }))).toHaveLength(2);
    expect(filterTasks(base, F({ status: 'all' }))).toHaveLength(3);
  });

  it('filters by priority', () => {
    expect(filterTasks(base, F({ priority: 'high' })).map((t) => t.id)).toEqual(['1']);
    expect(filterTasks(base, F({ priority: 'low' })).map((t) => t.id)).toEqual(['2']);
    expect(filterTasks(base, F({ priority: 'all' }))).toHaveLength(3);
  });

  it('combines status and priority filters', () => {
    expect(filterTasks(base, F({ status: 'active', priority: 'medium' })).map((t) => t.id)).toEqual(['3']);
  });

  it('filters by search query (case-insensitive)', () => {
    const out = filterTasks(base, F({ query: 'LOGIN' }));
    expect(out.map((t) => t.id).sort()).toEqual(['1', '3']);
  });

  it('sorts newest first by default', () => {
    const out = filterTasks(base, F());
    expect(out.map((t) => t.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by priority (high first)', () => {
    const out = filterTasks(base, F({ sort: 'priority' }));
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

  it('clearCompleted keeps only active tasks', () => {
    const out = clearCompleted(base);
    expect(out.map((t) => t.id)).toEqual(['2', '3']);
  });

  it('editTask renames and rejects blank titles', () => {
    const out = editTask(base, '2', '  Write better docs  ');
    expect(out.find((t) => t.id === '2')?.title).toBe('Write better docs');
    expect(editTask(base, '2', '   ')).toHaveLength(3);
    expect(editTask(base, '2', '   ').find((t) => t.id === '2')?.title).toBe('Write docs');
  });

  it('addTask prepends a valid task and rejects blank titles', () => {
    const out = addTask(base, { title: '  New task  ', priority: 'high', dueDate: '2026-11-01' });
    expect(out).toHaveLength(4);
    expect(out[0].title).toBe('New task');
    expect(out[0].done).toBe(false);
    expect(addTask(base, { title: '   ', priority: 'low', dueDate: '2026-11-01' })).toHaveLength(3);
  });
});

describe('due dates', () => {
  it('isOverdue flags unfinished past-due tasks only', () => {
    expect(isOverdue(base[2], '2026-10-06')).toBe(true);
    expect(isOverdue(base[2], '2026-10-05')).toBe(false);
    expect(isOverdue(base[0], '2026-10-06')).toBe(false); // done
  });

  it('dueLabel describes relative dates', () => {
    expect(dueLabel('2026-10-05', '2026-10-06', false)).toEqual({ text: 'Overdue by 1d', tone: 'danger' });
    expect(dueLabel('2026-10-03', '2026-10-06', false)).toEqual({ text: 'Overdue by 3d', tone: 'danger' });
    expect(dueLabel('2026-10-06', '2026-10-06', false)).toEqual({ text: 'Due today', tone: 'warn' });
    expect(dueLabel('2026-10-07', '2026-10-06', false)).toEqual({ text: 'Due tomorrow', tone: 'warn' });
    expect(dueLabel('2026-10-11', '2026-10-06', false)).toEqual({ text: 'Due in 5d', tone: 'muted' });
    expect(dueLabel('2026-10-01', '2026-10-06', true)).toEqual({ text: 'Done', tone: 'muted' });
  });
});
