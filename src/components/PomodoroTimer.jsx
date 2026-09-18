import { useEffect, useRef, useState } from 'react';

const DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const LABELS = { work: 'Focus', short: 'Short break', long: 'Long break' };

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 720;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // audio unavailable — non-critical
  }
}

function notify(title, body) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

export default function PomodoroTimer({ openTasks, focusTaskId, setFocusTaskId, onWorkSessionComplete, expandTrigger }) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (expandTrigger) setCollapsed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandTrigger]);
  const [mode, setMode] = useState('work');
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATIONS.work);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const endAtRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const secsLeft = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setRemaining(secsLeft);
      if (secsLeft <= 0) {
        clearInterval(id);
        setRunning(false);
        handleComplete();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function handleComplete() {
    playChime();
    if (mode === 'work') {
      const next = sessionsCompleted + 1;
      setSessionsCompleted(next);
      if (focusTaskId) onWorkSessionComplete(focusTaskId);
      const nextMode = next % 4 === 0 ? 'long' : 'short';
      notify('Focus session complete', `Time for a ${LABELS[nextMode].toLowerCase()}.`);
      switchMode(nextMode);
    } else {
      notify('Break over', 'Ready for another focus session?');
      switchMode('work');
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setRemaining(DURATIONS[nextMode]);
    endAtRef.current = null;
  }

  function toggleRun() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (running) {
      setRunning(false);
      return;
    }
    endAtRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    setRemaining(DURATIONS[mode]);
    endAtRef.current = null;
  }

  function skip() {
    setRunning(false);
    if (mode === 'work') {
      const next = sessionsCompleted + 1;
      setSessionsCompleted(next);
      switchMode(next % 4 === 0 ? 'long' : 'short');
    } else {
      switchMode('work');
    }
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const pct = 100 - (remaining / DURATIONS[mode]) * 100;
  const focusTask = openTasks.find((t) => t.id === focusTaskId);

  return (
    <div className={`pomodoro-widget glass ${collapsed ? 'collapsed' : ''}`}>
      <div className="pomo-header" onClick={() => setCollapsed((v) => !v)}>
        <span className="title">
          <span className={`pomo-mode-dot ${mode !== 'work' ? 'break' : ''}`} />
          {collapsed ? `${mm}:${ss} · ${LABELS[mode]}` : LABELS[mode]}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <div className="pomo-body">
          <div className="pomo-time">
            {mm}:{ss}
          </div>

          <select
            className="pomo-task-select"
            value={focusTaskId || ''}
            onChange={(e) => setFocusTaskId(e.target.value || null)}
          >
            <option value="">No task selected</option>
            {openTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <div className="pomo-controls">
            <button className="primary" onClick={toggleRun}>
              {running ? 'Pause' : 'Start'}
            </button>
            <button onClick={skip}>Skip</button>
            <button onClick={reset}>Reset</button>
          </div>

          <div className="pomo-progress">
            <div className="pomo-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="pomo-sessions">
            {sessionsCompleted} session{sessionsCompleted === 1 ? '' : 's'} today
            {focusTask ? ` · focused on “${focusTask.title}”` : ''}
          </div>
        </div>
      )}
    </div>
  );
}
