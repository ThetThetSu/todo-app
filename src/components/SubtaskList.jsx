import { useRef, useState } from 'react';

export default function SubtaskList({ subtasks, onChange }) {
  const [draft, setDraft] = useState('');
  const dragIndex = useRef(null);
  const [overIndex, setOverIndex] = useState(null);

  function addSubtask(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    onChange([...subtasks, { id: crypto.randomUUID?.() || `${Date.now()}`, title: draft.trim(), done: false }]);
    setDraft('');
  }

  function toggle(id) {
    onChange(subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }

  function remove(id) {
    onChange(subtasks.filter((s) => s.id !== id));
  }

  function handleDrop(index) {
    if (dragIndex.current === null || dragIndex.current === index) {
      setOverIndex(null);
      return;
    }
    const next = [...subtasks];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    onChange(next);
    dragIndex.current = null;
    setOverIndex(null);
  }

  return (
    <div className="subtasks">
      {subtasks.map((s, i) => (
        <div
          key={s.id}
          className={`subtask-row ${s.done ? 'done' : ''}`}
          draggable
          onDragStart={() => (dragIndex.current = i)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverIndex(i);
          }}
          onDrop={() => handleDrop(i)}
          style={overIndex === i ? { boxShadow: '0 0 0 1px var(--accent-2) inset' } : undefined}
        >
          <span className="drag-handle">⠿</span>
          <span
            className={`checkbox ${s.done ? 'checked' : ''}`}
            onClick={() => toggle(s.id)}
            role="checkbox"
            aria-checked={s.done}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggle(s.id)}
          >
            {s.done && (
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="subtask-title">{s.title}</span>
          <button className="icon-btn danger" onClick={() => remove(s.id)} aria-label="Delete subtask">
            ×
          </button>
        </div>
      ))}
      <form className="subtask-add" onSubmit={addSubtask}>
        <span className="drag-handle" style={{ opacity: 0.3 }}>
          +
        </span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add subtask…"
        />
      </form>
    </div>
  );
}
