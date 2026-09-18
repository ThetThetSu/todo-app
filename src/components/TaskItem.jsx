import { useState } from 'react';
import SubtaskList from './SubtaskList';
import { PRIORITIES, PRIORITY_META } from '../utils/priority';
import { formatDueDate, isDueToday, isOverdue } from '../utils/date';

export default function TaskItem({
  task,
  tagColor,
  onToggle,
  onUpdate,
  onDelete,
  onFocusPomodoro,
  dragProps,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [showEditor, setShowEditor] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [tagDraft, setTagDraft] = useState(task.tags.join(', '));

  const overdue = isOverdue(task.dueDate, task.done);
  const dueToday = isDueToday(task.dueDate);
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;

  function commitTitle() {
    const trimmed = titleDraft.trim();
    onUpdate(task.id, { title: trimmed || task.title });
    setEditingTitle(false);
  }

  function commitTags() {
    const tags = tagDraft
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    onUpdate(task.id, { tags: [...new Set(tags)] });
  }

  return (
    <div
      className={[
        'task-item glass',
        task.done ? 'done' : '',
        overdue ? 'overdue' : '',
        dragProps?.isDragging ? 'dragging' : '',
        dragProps?.isDropTarget ? 'drop-target' : '',
      ].join(' ')}
      style={{ '--p-color': PRIORITY_META[task.priority].color }}
      draggable={dragProps?.draggable}
      onDragStart={dragProps?.onDragStart}
      onDragOver={dragProps?.onDragOver}
      onDrop={dragProps?.onDrop}
      onDragEnd={dragProps?.onDragEnd}
    >
      <div className="task-row">
        {dragProps?.draggable && <span className="drag-handle">⠿</span>}
        <span
          className={`checkbox ${task.done ? 'checked' : ''}`}
          role="checkbox"
          aria-checked={task.done}
          tabIndex={0}
          onClick={() => onToggle(task.id)}
          onKeyDown={(e) => e.key === 'Enter' && onToggle(task.id)}
        >
          {task.done && (
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>

        <div className="task-main">
          <div className="task-title-row">
            <span className="priority-dot" style={{ background: PRIORITY_META[task.priority].color }} />
            {editingTitle ? (
              <input
                autoFocus
                className="task-title editing"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTitle();
                  if (e.key === 'Escape') {
                    setTitleDraft(task.title);
                    setEditingTitle(false);
                  }
                }}
              />
            ) : (
              <span className="task-title task-title-text" onClick={() => setEditingTitle(true)}>
                {task.title}
              </span>
            )}
          </div>

          <div className="task-meta-row">
            {task.dueDate && (
              <span className={`meta-badge due ${overdue ? 'overdue' : ''} ${dueToday ? 'today' : ''}`}>
                {overdue ? '⚠ ' : '🗓 '}
                {formatDueDate(task.dueDate)}
              </span>
            )}
            {task.recurrence && <span className="meta-badge recurring">↻ {task.recurrence.freq}</span>}
            {task.tags.map((tag) => (
              <span key={tag} className="tag-chip" style={{ '--tag-color': tagColor(tag) }}>
                <span className="dot" style={{ background: tagColor(tag) }} />
                {tag}
              </span>
            ))}
            {task.subtasks.length > 0 && (
              <button className="meta-badge subtasks" onClick={() => setShowSubtasks((v) => !v)}>
                <span className="subtask-progress-track">
                  <span
                    className="subtask-progress-fill"
                    style={{ width: `${(doneSubtasks / task.subtasks.length) * 100}%` }}
                  />
                </span>
                {doneSubtasks}/{task.subtasks.length}
              </button>
            )}
            {task.pomodoros > 0 && <span className="meta-badge pomo">🍅 {task.pomodoros}</span>}
          </div>
        </div>

        <div className="task-actions">
          <button className="icon-btn focus-btn" title="Focus with Pomodoro" onClick={() => onFocusPomodoro(task.id)}>
            🍅
          </button>
          <button className="icon-btn" title="Subtasks" onClick={() => setShowSubtasks((v) => !v)}>
            ☑
          </button>
          <button className="icon-btn" title="Edit details" onClick={() => setShowEditor((v) => !v)}>
            ⚙
          </button>
          <button className="icon-btn danger" title="Delete task" onClick={() => onDelete(task.id)}>
            🗑
          </button>
        </div>
      </div>

      {showEditor && (
        <div className="task-editor">
          <input
            type="date"
            value={task.dueDate || ''}
            onChange={(e) => onUpdate(task.id, { dueDate: e.target.value || null })}
          />
          <select value={task.priority} onChange={(e) => onUpdate(task.id, { priority: e.target.value })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label} priority
              </option>
            ))}
          </select>
          <input
            className="tags-input"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onBlur={commitTags}
            onKeyDown={(e) => e.key === 'Enter' && commitTags()}
            placeholder="tags, comma, separated"
          />
          <div className="recurrence-editor">
            <select
              value={task.recurrence?.freq || 'none'}
              onChange={(e) => {
                const freq = e.target.value;
                onUpdate(task.id, { recurrence: freq === 'none' ? null : { freq, interval: 1 } });
              }}
            >
              <option value="none">No repeat</option>
              <option value="daily">Repeat daily</option>
              <option value="weekly">Repeat weekly</option>
              <option value="monthly">Repeat monthly</option>
            </select>
          </div>
        </div>
      )}

      {showSubtasks && (
        <SubtaskList subtasks={task.subtasks} onChange={(subtasks) => onUpdate(task.id, { subtasks })} />
      )}
    </div>
  );
}
