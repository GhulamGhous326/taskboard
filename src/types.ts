export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueDate: string; // ISO date, e.g. "2026-10-12"
  createdAt: string; // ISO datetime
}

export type StatusFilter = 'all' | 'active' | 'completed';
export type SortKey = 'newest' | 'oldest' | 'priority';

export interface FilterState {
  query: string;
  status: StatusFilter;
  sort: SortKey;
}

export interface Stats {
  total: number;
  completed: number;
  active: number;
  completionRate: number; // 0-100
}
