export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueDate: string; // ISO date, e.g. "2026-10-12"
  createdAt: string; // ISO datetime
  tags: string[];
}

export type StatusFilter = 'all' | 'active' | 'completed';
export type SortKey = 'newest' | 'oldest' | 'priority' | 'due';
export type PriorityFilter = 'all' | Priority;
export type ViewMode = 'list' | 'calendar';

export interface FilterState {
  query: string;
  status: StatusFilter;
  sort: SortKey;
  priority: PriorityFilter;
  tag: string; // 'all' or a tag name
}

export interface Stats {
  total: number;
  completed: number;
  active: number;
  completionRate: number; // 0-100
}

export type DueTone = 'danger' | 'warn' | 'muted';

export interface DueInfo {
  text: string;
  tone: DueTone;
}

export interface DayCell {
  iso: string; // YYYY-MM-DD
  inMonth: boolean;
}
