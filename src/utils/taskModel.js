import { makeId } from './id';
import { addInterval, todayISO } from './date';

export function createTask({ title, dueDate = null, priority = 'medium', tags = [], recurrence = null }) {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    title,
    notes: '',
    dueDate,
    priority,
    tags,
    subtasks: [],
    done: false,
    completedAt: null,
    createdAt: now,
    recurrence, // { freq: 'daily'|'weekly'|'monthly', interval: number } | null
    pomodoros: 0,
  };
}

export function createSubtask(title) {
  return { id: makeId(), title, done: false };
}

// Returns the mutated task list after toggling `task`'s done state.
// If the task is recurring and is being completed, a fresh next-occurrence
// task is appended so the series continues.
export function toggleTaskDone(tasks, taskId) {
  const target = tasks.find((t) => t.id === taskId);
  if (!target) return tasks;

  const nowDone = !target.done;
  const updated = tasks.map((t) =>
    t.id === taskId
      ? { ...t, done: nowDone, completedAt: nowDone ? new Date().toISOString() : null }
      : t
  );

  if (nowDone && target.recurrence) {
    const next = {
      ...target,
      id: makeId(),
      done: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      dueDate: addInterval(target.dueDate || todayISO(), target.recurrence.freq, target.recurrence.interval),
      subtasks: target.subtasks.map((s) => ({ ...s, id: makeId(), done: false })),
      pomodoros: 0,
    };
    return [...updated, next];
  }

  return updated;
}

export function isRecurring(task) {
  return !!task.recurrence;
}
