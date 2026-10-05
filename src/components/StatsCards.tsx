import type { Stats } from '../types';

function Ring({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="ring" aria-hidden="true">
      <circle cx="32" cy="32" r={r} className="ring-bg" />
      <circle
        cx="32"
        cy="32"
        r={r}
        className="ring-fg"
        strokeDasharray={c.toFixed(1)}
        strokeDashoffset={(c - (c * pct) / 100).toFixed(1)}
        transform="rotate(-90 32 32)"
      />
    </svg>
  );
}

const ICONS: Record<string, JSX.Element> = {
  total: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  ),
  active: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" />
    </svg>
  ),
  completed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <section className="stats" aria-label="Task statistics">
      <div className="stat-card">
        <span className="stat-icon" aria-hidden="true">{ICONS.total}</span>
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total tasks</span>
      </div>
      <div className="stat-card">
        <span className="stat-icon" aria-hidden="true">{ICONS.active}</span>
        <span className="stat-value">{stats.active}</span>
        <span className="stat-label">Active</span>
      </div>
      <div className="stat-card">
        <span className="stat-icon" aria-hidden="true">{ICONS.completed}</span>
        <span className="stat-value">{stats.completed}</span>
        <span className="stat-label">Completed</span>
      </div>
      <div className="stat-card stat-ring-card">
        <Ring pct={stats.completionRate} />
        <span className="stat-value">{stats.completionRate}%</span>
        <span className="stat-label">Completion</span>
      </div>
    </section>
  );
}
