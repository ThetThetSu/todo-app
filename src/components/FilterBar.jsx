import { PRIORITIES, PRIORITY_META } from '../utils/priority';

const VIEWS = [
  { key: 'all', label: 'All tasks' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
];

export default function FilterBar({
  view,
  setView,
  counts,
  allTags,
  tagColor,
  selectedTags,
  toggleTag,
  selectedPriorities,
  togglePriority,
  sortMode,
  setSortMode,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <aside className="sidebar">
      <div>
        <div className="panel-title">Views</div>
        <div className="view-list">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              className={`view-item ${view === v.key ? 'active' : ''}`}
              onClick={() => setView(v.key)}
            >
              <span>{v.label}</span>
              <span className="count">{counts[v.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="panel-title">Sort by</div>
        <select className="pomo-task-select" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
          <option value="manual">Manual (drag)</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div>
        <div className="panel-title">Priority</div>
        <div className="priority-filters">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              data-p={p}
              className={`priority-filter-btn ${selectedPriorities.includes(p) ? 'active' : ''}`}
              onClick={() => togglePriority(p)}
            >
              {PRIORITY_META[p].label}
            </button>
          ))}
        </div>
      </div>

      {allTags.length > 0 && (
        <div>
          <div className="panel-title">Tags</div>
          <div className="chip-list wrap">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag-chip selectable ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                <span className="dot" style={{ background: tagColor(tag) }} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <button className="clear-filters" onClick={onClearFilters}>
          Clear filters
        </button>
      )}
    </aside>
  );
}
