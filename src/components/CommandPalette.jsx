import { useMemo, useState } from 'react';

// Mounted by the parent only while open, so state starts fresh each time.
export default function CommandPalette({ onClose, commands }) {
  const [query, setQuery] = useState('');
  const [rawActiveIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  const activeIndex = filtered.length ? Math.min(rawActiveIndex, filtered.length - 1) : 0;

  function run(cmd) {
    if (!cmd) return;
    cmd.action();
    onClose();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(filtered[activeIndex]);
    }
  }

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette glass" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Type a command… (Esc to close)"
        />
        <div className="palette-list">
          {filtered.length === 0 && <div className="palette-empty">No matching commands</div>}
          {filtered.map((cmd, i) => (
            <div
              key={cmd.id}
              className={`palette-item ${i === activeIndex ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => run(cmd)}
            >
              <span>{cmd.label}</span>
              {cmd.hint && <span className="hint">{cmd.hint}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
