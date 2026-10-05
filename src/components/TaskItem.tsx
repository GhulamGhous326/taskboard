import { useState } from 'react';
import type { Priority, Task } from '../types';
import { dueLabel } from '../logic';

const PRIORITY_LABEL: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' };

interface Props {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

export default function TaskItem({ task, index, onToggle, onRemove, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  const today = new Date().toISOString().slice(0, 10);
  const due = dueLabel(task.dueDate, today, task.done);

  function startEdit() {
    setDraft(task.title);
    setEditing(true);
  }
  function commit() {
    onEdit(task.id, draft);
    setEditing(false);
  }
  function cancel() {
    setDraft(task.title);
    setEditing(false);
  }

  return (
    <li
      className={'task-item' + (task.done ? ' done' : '')}
      style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
    >
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
        {editing ? (
          <input
            className="task-edit-input"
            value={draft}
            autoFocus
            maxLength={120}
            aria-label="Edit task title"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            onBlur={commit}
          />
        ) : (
          <span className="task-title">{task.title}</span>
        )}
        <span className="task-meta">
          <span className={'priority priority-' + task.priority}>{PRIORITY_LABEL[task.priority]}</span>
          <span className={'due due-' + due.tone}>{due.text}</span>
          {task.tags.map((tag) => (
            <span className="tag" key={tag}>#{tag}</span>
          ))}
        </span>
      </div>
      {!editing && (
        <button
          type="button"
          className="task-edit"
          onClick={startEdit}
          aria-label={`Edit "${task.title}"`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 20h4l11-11-4-4L4 16v4z" strokeLinejoin="round" />
            <path d="m13.5 6.5 4 4" strokeLinecap="round" />
          </svg>
        </button>
      )}
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
