import { useEffect, useMemo, useRef, useState } from 'react';
import QuickCapture from './components/QuickCapture';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import StatsPanel from './components/StatsPanel';
import PomodoroTimer from './components/PomodoroTimer';
import CommandPalette from './components/CommandPalette';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createTask, toggleTaskDone } from './utils/taskModel';
import { colorForTag, collectTagsInFirstSeenOrder } from './utils/tagColors';
import { currentStreak } from './utils/stats';
import { isDueToday, isOverdue, isUpcoming, todayISO } from './utils/date';

export default function App() {
  const [tasks, setTasks] = useLocalStorage('todo:tasks', []);
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage('todo:pomodoro-sessions', []);
  const [lastReminderDate, setLastReminderDate] = useLocalStorage('todo:last-reminder-date', '');

  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [sortMode, setSortMode] = useState('manual');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState(null);
  const [pomodoroExpandTrigger, setPomodoroExpandTrigger] = useState(0);

  const quickCaptureRef = useRef(null);
  const searchRef = useRef(null);

  // ---------- keyboard shortcuts ----------
  useEffect(() => {
    function onKeyDown(e) {
      const isMeta = e.ctrlKey || e.metaKey;
      const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        document.activeElement?.blur();
        return;
      }
      if (inField) return;
      if (e.key === 'n') {
        e.preventDefault();
        quickCaptureRef.current?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ---------- daily reminder ping ----------
  useEffect(() => {
    function checkReminders() {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const today = todayISO();
      if (lastReminderDate === today) return;
      const due = tasks.filter((t) => !t.done && (isDueToday(t.dueDate) || isOverdue(t.dueDate, t.done)));
      if (due.length === 0) return;
      new Notification('Tasks need attention', {
        body: `${due.length} task${due.length === 1 ? '' : 's'} due today or overdue.`,
      });
      setLastReminderDate(today);
    }
    checkReminders();
    const id = setInterval(checkReminders, 5 * 60 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, lastReminderDate]);

  // ---------- derived data ----------
  const tagsInOrder = useMemo(() => collectTagsInFirstSeenOrder(tasks), [tasks]);
  const tagColor = (tag) => colorForTag(tag, tagsInOrder);

  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.tags.some((tag) => tag.includes(q))) return false;
      if (selectedTags.length > 0 && !selectedTags.some((tag) => t.tags.includes(tag))) return false;
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(t.priority)) return false;
      return true;
    });
  }, [tasks, search, selectedTags, selectedPriorities]);

  const counts = useMemo(
    () => ({
      all: baseFiltered.length,
      today: baseFiltered.filter((t) => isDueToday(t.dueDate)).length,
      upcoming: baseFiltered.filter((t) => isUpcoming(t.dueDate)).length,
      overdue: baseFiltered.filter((t) => isOverdue(t.dueDate, t.done)).length,
      completed: baseFiltered.filter((t) => t.done).length,
    }),
    [baseFiltered]
  );

  const viewFiltered = useMemo(() => {
    switch (view) {
      case 'today':
        return baseFiltered.filter((t) => isDueToday(t.dueDate));
      case 'upcoming':
        return baseFiltered.filter((t) => isUpcoming(t.dueDate));
      case 'overdue':
        return baseFiltered.filter((t) => isOverdue(t.dueDate, t.done));
      case 'completed':
        return baseFiltered.filter((t) => t.done);
      default:
        return baseFiltered;
    }
  }, [baseFiltered, view]);

  const visibleTasks = useMemo(() => {
    const list = [...viewFiltered];
    if (sortMode === 'dueDate') {
      list.sort((a, b) => (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : 0);
    } else if (sortMode === 'priority') {
      const rank = { high: 0, medium: 1, low: 2 };
      list.sort((a, b) => rank[a.priority] - rank[b.priority]);
    }
    return list;
  }, [viewFiltered, sortMode]);

  const openTasks = useMemo(() => tasks.filter((t) => !t.done), [tasks]);
  const streak = currentStreak(tasks);
  const hasActiveFilters = selectedTags.length > 0 || selectedPriorities.length > 0 || search.trim().length > 0;

  // ---------- handlers ----------
  function handleAdd({ title, dueDate, priority, tags }) {
    const task = createTask({ title, dueDate, priority: priority || 'medium', tags });
    setTasks((prev) => [task, ...prev]);
  }

  function handleToggle(id) {
    setTasks((prev) => toggleTaskDone(prev, id));
  }

  function handleUpdate(id, patch) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function handleDelete(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (focusTaskId === id) setFocusTaskId(null);
  }

  function handleReorder(draggedId, targetId) {
    setTasks((prev) => {
      const list = [...prev];
      const fromIdx = list.findIndex((t) => t.id === draggedId);
      const toIdx = list.findIndex((t) => t.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      return list;
    });
  }

  function handleFocusPomodoro(id) {
    setFocusTaskId(id);
    setPomodoroExpandTrigger((v) => v + 1);
  }

  function handleWorkSessionComplete(taskId) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, pomodoros: t.pomodoros + 1 } : t)));
    setPomodoroSessions((prev) => [...prev, { taskId, completedAt: new Date().toISOString() }]);
  }

  function toggleTag(tag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function togglePriority(p) {
    setSelectedPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function clearFilters() {
    setSelectedTags([]);
    setSelectedPriorities([]);
    setSearch('');
  }

  function requestReminderPermission() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  const commands = useMemo(
    () => [
      { id: 'add', label: 'Add a new task', hint: 'N', action: () => quickCaptureRef.current?.focus() },
      { id: 'search', label: 'Search tasks', hint: '/', action: () => searchRef.current?.focus() },
      { id: 'view-all', label: 'View: All tasks', action: () => setView('all') },
      { id: 'view-today', label: 'View: Today', action: () => setView('today') },
      { id: 'view-upcoming', label: 'View: Upcoming', action: () => setView('upcoming') },
      { id: 'view-overdue', label: 'View: Overdue', action: () => setView('overdue') },
      { id: 'view-completed', label: 'View: Completed', action: () => setView('completed') },
      { id: 'sort-manual', label: 'Sort: Manual (drag)', action: () => setSortMode('manual') },
      { id: 'sort-due', label: 'Sort: Due date', action: () => setSortMode('dueDate') },
      { id: 'sort-priority', label: 'Sort: Priority', action: () => setSortMode('priority') },
      { id: 'focus-timer', label: 'Open focus timer', action: () => setPomodoroExpandTrigger((v) => v + 1) },
      { id: 'reminders', label: 'Enable due-date reminders', action: requestReminderPermission },
      { id: 'clear-filters', label: 'Clear all filters', action: clearFilters },
    ],
    []
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          Nova <small>Tasks</small>
        </div>
        <input
          ref={searchRef}
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks or #tags… ( / )"
        />
        <div className="header-spacer" />
        {streak > 0 && (
          <div className="streak-pill">
            <span className="flame">🔥</span>
            {streak} day{streak === 1 ? '' : 's'}
          </div>
        )}
        <button className="kbd-hint" onClick={() => setPaletteOpen(true)}>
          <kbd>Ctrl</kbd>+<kbd>K</kbd> commands
        </button>
      </header>

      <div className="app-body">
        <FilterBar
          view={view}
          setView={setView}
          counts={counts}
          allTags={tagsInOrder}
          tagColor={tagColor}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          selectedPriorities={selectedPriorities}
          togglePriority={togglePriority}
          sortMode={sortMode}
          setSortMode={setSortMode}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <main className="main-col">
          <QuickCapture ref={quickCaptureRef} onAdd={handleAdd} />
          <TaskList
            tasks={visibleTasks}
            manualOrder={sortMode === 'manual'}
            tagColor={tagColor}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onFocusPomodoro={handleFocusPomodoro}
            onReorder={handleReorder}
            emptyMessage={
              hasActiveFilters ? 'No tasks match your filters.' : 'Nothing here yet — add your first task above.'
            }
          />
        </main>

        <StatsPanel tasks={tasks} pomodoroSessions={pomodoroSessions} />
      </div>

      <PomodoroTimer
        openTasks={openTasks}
        focusTaskId={focusTaskId}
        setFocusTaskId={setFocusTaskId}
        onWorkSessionComplete={handleWorkSessionComplete}
        expandTrigger={pomodoroExpandTrigger}
      />

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} commands={commands} />}
    </div>
  );
}
