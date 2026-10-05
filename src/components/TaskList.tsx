import type { Task } from '../types';
import TaskItem from './TaskItem';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function TaskList({ tasks, onToggle, onRemove }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-icon" aria-hidden="true">&#10003;</div>
        <h2>Nothing here</h2>
        <p>No tasks match your filters. Try a different search, or add a new task above.</p>
      </div>
    );
  }
  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}
