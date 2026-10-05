import type { FilterState, SortKey, StatusFilter } from '../types';

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'priority', label: 'Priority' },
];

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="filter-bar" role="search">
      <input
        type="search"
        className="filter-search"
        placeholder="Search tasks..."
        aria-label="Search tasks"
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
      />
      <div className="filter-group" role="group" aria-label="Status filter">
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={filters.status === o.value ? 'chip active' : 'chip'}
            aria-pressed={filters.status === o.value}
            onClick={() => onChange({ ...filters, status: o.value })}
          >
            {o.label}
          </button>
        ))}
      </div>
      <label className="sort-label">
        Sort
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
          aria-label="Sort tasks"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
