import type { Task } from '../types';
import TaskItem from './TaskItem';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

export default function TaskList({ tasks, onToggle, onRemove, onEdit }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>Nothing here</h2>
        <p>No tasks match your filters. Try a different search, or add a new task above.</p>
      </div>
    );
  }
  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((t, i) => (
        <TaskItem key={t.id} task={t} index={i} onToggle={onToggle} onRemove={onRemove} onEdit={onEdit} />
      ))}
    </ul>
  );
}
