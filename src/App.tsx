import { useEffect, useMemo, useState } from 'react';
import type { FilterState, Priority, Task } from './types';
import { fetchTasks, persist } from './data';
import { addTask, computeStats, filterTasks, removeTask, toggleTask } from './logic';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

type LoadState = 'loading' | 'ready' | 'error';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [filters, setFilters] = useState<FilterState>({ query: '', status: 'all', sort: 'newest' });

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

  const visible = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const stats = useMemo(() => computeStats(tasks), [tasks]);

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
          <h1>TaskBoard</h1>
          <p className="subtitle">A React + TypeScript dashboard demo by Ghulam Ghous</p>
        </div>
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
            <TaskForm
              onAdd={(input: { title: string; priority: Priority; dueDate: string }) =>
                update(addTask(tasks, input))
              }
            />
            <FilterBar filters={filters} onChange={setFilters} />
            <TaskList
              tasks={visible}
              onToggle={(id) => update(toggleTask(tasks, id))}
              onRemove={(id) => update(removeTask(tasks, id))}
            />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built with React, TypeScript and Vite. Tasks are stored in your browser only.
        </p>
      </footer>
    </div>
  );
}
