import type { Priority, Task } from '../types';
import { isOverdue } from '../logic';

const PRIORITY_LABEL: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' };

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onRemove }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = isOverdue(task, today);

  return (
    <li className={'task-item' + (task.done ? ' done' : '') + (overdue ? ' overdue' : '')}>
      <label className="task-check">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.done ? 'active' : 'done'}`}
        />
        <span className="checkmark" aria-hidden="true" />
      </label>
      <div className="task-body">
        <span className="task-title">{task.title}</span>
        <span className="task-meta">
          <span className={'priority priority-' + task.priority}>{PRIORITY_LABEL[task.priority]}</span>
          <span className="due">Due {formatDate(task.dueDate)}</span>
          {overdue && <span className="overdue-tag">Overdue</span>}
        </span>
      </div>
      <button
        type="button"
        className="task-delete"
        onClick={() => onRemove(task.id)}
        aria-label={`Delete "${task.title}"`}
      >
        &times;
      </button>
    </li>
  );
}
