import { useState } from 'react';
import type { Priority } from '../types';
import { parseTags } from '../logic';

interface Props {
  onAdd: (input: { title: string; priority: Priority; dueDate: string; tags: string[] }) => void;
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(() => todayPlus(7));
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give the task a title.');
      return;
    }
    onAdd({ title: title.trim(), priority, dueDate, tags: parseTags(tagsInput) });
    setTitle('');
    setPriority('medium');
    setDueDate(todayPlus(7));
    setTagsInput('');
    setError('');
  }

  return (
    <form className="task-form" onSubmit={submit} aria-label="Add a task">
      <input
        type="text"
        className="task-input"
        placeholder="Add a new task..."
        aria-label="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />
      <input
        type="text"
        className="task-input task-tags-input"
        placeholder="tags, comma separated"
        aria-label="Tags (comma separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        maxLength={60}
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        aria-label="Priority"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="Due date"
      />
      <button type="submit" className="btn-primary">
        Add task
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
