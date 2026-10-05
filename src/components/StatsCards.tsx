import type { Stats } from '../types';

const CARDS: { key: keyof Stats; label: string; suffix?: string }[] = [
  { key: 'total', label: 'Total tasks' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'completionRate', label: 'Completion', suffix: '%' },
];

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <section className="stats" aria-label="Task statistics">
      {CARDS.map((c) => (
        <div className="stat-card" key={c.key}>
          <span className="stat-value">
            {stats[c.key]}
            {c.suffix ?? ''}
          </span>
          <span className="stat-label">{c.label}</span>
        </div>
      ))}
    </section>
  );
}
