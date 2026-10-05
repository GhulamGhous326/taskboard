import { useMemo, useState } from 'react';
import type { Task } from '../types';
import { getMonthGrid, groupTasksByDue } from '../logic';
import TaskList from './TaskList';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

function prettyDay(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function Calendar({ tasks, onToggle, onRemove, onEdit }: Props) {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayIso);

  const grid = useMemo(() => getMonthGrid(ym.y, ym.m), [ym]);
  const byDue = useMemo(() => groupTasksByDue(tasks), [tasks]);
  const dayTasks = useMemo(
    () => (byDue[selected] ?? []).filter((t) => !t.done).concat((byDue[selected] ?? []).filter((t) => t.done)),
    [byDue, selected],
  );

  const monthLabel = new Date(ym.y, ym.m, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  function shift(delta: number) {
    setYm(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <div className="calendar">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => shift(-1)} aria-label="Previous month">
          ←
        </button>
        <h2 className="cal-title">{monthLabel}</h2>
        <div className="cal-nav-group">
          <button
            type="button"
            className="btn-ghost cal-today"
            onClick={() => {
              setYm({ y: now.getFullYear(), m: now.getMonth() });
              setSelected(todayIso);
            }}
          >
            Today
          </button>
          <button type="button" className="cal-nav" onClick={() => shift(1)} aria-label="Next month">
            →
          </button>
        </div>
      </div>

      <div className="cal-grid" role="grid" aria-label="Task calendar">
        {WEEKDAYS.map((d) => (
          <div className="cal-weekday" key={d} aria-hidden="true">
            {d}
          </div>
        ))}
        {grid.flat().map((cell) => {
          const dayList = byDue[cell.iso] ?? [];
          const shown = dayList.slice(0, 2);
          return (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              aria-label={`${prettyDay(cell.iso)}, ${dayList.length} tasks`}
              aria-pressed={selected === cell.iso}
              className={
                'cal-day' +
                (cell.inMonth ? '' : ' cal-out') +
                (cell.iso === todayIso ? ' cal-today-cell' : '') +
                (selected === cell.iso ? ' cal-selected' : '') +
                (dayList.length ? ' has-tasks' : '')
              }
              onClick={() => setSelected(cell.iso)}
            >
              <span className="cal-num">{Number(cell.iso.slice(8, 10))}</span>
              <span className="cal-tasks">
                {shown.map((t) => (
                  <span className={'cal-chip cal-chip-' + t.priority + (t.done ? ' cal-done' : '')} key={t.id}>
                    {t.title}
                  </span>
                ))}
                {dayList.length > 2 && <span className="cal-more">+{dayList.length - 2} more</span>}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className="cal-day-title">{prettyDay(selected)}</h3>
      {dayTasks.length === 0 ? (
        <p className="cal-empty muted">No tasks due on this day.</p>
      ) : (
        <TaskList tasks={dayTasks} onToggle={onToggle} onRemove={onRemove} onEdit={onEdit} />
      )}
    </div>
  );
}
