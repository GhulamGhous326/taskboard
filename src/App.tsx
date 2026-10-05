import { useEffect, useMemo, useState } from 'react';
import type { FilterState, Priority, Task, ViewMode } from './types';
import { fetchTasks, persist } from './data';
import {
  addTask,
  allTags,
  clearCompleted,
  computeStats,
  editTask,
  filterTasks,
  isOverdue,
  removeTask,
  toggleTask,
} from './logic';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Calendar from './components/Calendar';

type LoadState = 'loading' | 'ready' | 'error';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [view, setView] = useState<ViewMode>('list');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    status: 'all',
    sort: 'newest',
    priority: 'all',
    tag: 'all',
  });

  useEffect(() => {
    let cancelled = false;
    fetchTasks()
      .then((t) => {
        if (!cancelled) {
          setTasks(t);
          setLoadState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function update(next: Task[]) {
    setTasks(next);
    persist(next);
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const visible = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const shown = useMemo(
    () => (onlyOverdue ? visible.filter((t) => isOverdue(t, todayIso)) : visible),
    [visible, onlyOverdue, todayIso],
  );
  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const overdueCount = useMemo(() => tasks.filter((t) => isOverdue(t, todayIso)).length, [tasks, todayIso]);
  const tags = useMemo(() => allTags(tasks), [tasks]);

  const listHandlers = {
    onToggle: (id: string) => update(toggleTask(tasks, id)),
    onRemove: (id: string) => update(removeTask(tasks, id)),
    onEdit: (id: string, title: string) => update(editTask(tasks, id, title)),
  };

  function retry() {
    setLoadState('loading');
    fetchTasks()
      .then((t) => {
        setTasks(t);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>
            TaskBoard<i>.</i>
          </h1>
          <p className="subtitle">A React + TypeScript dashboard demo by Ghulam Ghous</p>
        </div>
        {stats.completed > 0 && loadState === 'ready' && (
          <button type="button" className="btn-ghost" onClick={() => update(clearCompleted(tasks))}>
            Clear completed
          </button>
        )}
      </header>

      <main>
        {loadState === 'loading' && (
          <div className="skeleton-list" role="status" aria-label="Loading tasks">
            {[0, 1, 2, 3].map((i) => (
              <div className="skeleton" key={i} />
            ))}
          </div>
        )}

        {loadState === 'error' && (
          <div className="error-state" role="alert">
            <h2>Could not load tasks</h2>
            <p>Something went wrong while fetching your tasks. Check your connection and try again.</p>
            <button type="button" className="btn-primary" onClick={retry}>
              Retry
            </button>
          </div>
        )}

        {loadState === 'ready' && (
          <>
            <StatsCards stats={stats} />

            {overdueCount > 0 && (
              <button
                type="button"
                className={'overdue-banner' + (onlyOverdue ? ' active' : '')}
                onClick={() => setOnlyOverdue((v) => !v)}
                aria-pressed={onlyOverdue}
              >
                {overdueCount} overdue task{overdueCount === 1 ? '' : 's'}
                <span>{onlyOverdue ? ' · show all' : ' · show only overdue'}</span>
              </button>
            )}

            <div className="view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={view === 'list' ? 'chip active' : 'chip'}
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
              >
                List
              </button>
              <button
                type="button"
                className={view === 'calendar' ? 'chip active' : 'chip'}
                aria-pressed={view === 'calendar'}
                onClick={() => setView('calendar')}
              >
                Calendar
              </button>
            </div>

            {view === 'list' ? (
              <>
                <TaskForm
                  onAdd={(input: { title: string; priority: Priority; dueDate: string; tags: string[] }) =>
                    update(addTask(tasks, input))
                  }
                />
                <FilterBar filters={filters} tags={tags} onChange={setFilters} />
                <TaskList
                  tasks={shown}
                  onToggle={listHandlers.onToggle}
                  onRemove={listHandlers.onRemove}
                  onEdit={listHandlers.onEdit}
                />
              </>
            ) : (
              <Calendar
                tasks={tasks}
                onToggle={listHandlers.onToggle}
                onRemove={listHandlers.onRemove}
                onEdit={listHandlers.onEdit}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React, TypeScript and Vite. Tasks are stored in your browser only.</p>
      </footer>
    </div>
  );
}
