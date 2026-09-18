import { dayLabel, todayISO } from '../utils/date';
import { completionRate, currentStreak, last7DaysCompletions, longestStreak, pomodorosToday } from '../utils/stats';

export default function StatsPanel({ tasks, pomodoroSessions }) {
  const rate = completionRate(tasks);
  const streak = currentStreak(tasks);
  const longest = longestStreak(tasks);
  const chart = last7DaysCompletions(tasks);
  const pomosToday = pomodorosToday(pomodoroSessions);
  const today = todayISO();
  const maxCount = Math.max(0, ...chart.map((d) => d.count));

  return (
    <aside className="stats-panel">
      <div className="stat-card glass">
        <div className="panel-title">Progress</div>
        <div className="hero-figure">
          <div className="value">{rate}%</div>
          <div className="label">of all tasks completed</div>
        </div>
      </div>

      <div className="stat-tiles">
        <div className="stat-tile glass">
          <div className="label">Current streak</div>
          <div className="value warm">
            {streak > 0 ? `🔥 ${streak}` : '0'}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}> d</span>
          </div>
        </div>
        <div className="stat-tile glass">
          <div className="label">Best streak</div>
          <div className="value accent">
            {longest}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}> d</span>
          </div>
        </div>
        <div className="stat-tile glass">
          <div className="label">Focus sessions today</div>
          <div className="value accent">🍅 {pomosToday}</div>
        </div>
        <div className="stat-tile glass">
          <div className="label">Open tasks</div>
          <div className="value">{tasks.filter((t) => !t.done).length}</div>
        </div>
      </div>

      <div className="stat-card glass viz-root">
        <div className="chart-title">Completed, last 7 days</div>
        <div className="bar-chart">
          {chart.map((d) => {
            const isToday = d.date === today;
            const heightPct = maxCount > 0 ? Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 0) : 0;
            const isMax = maxCount > 0 && d.count === maxCount;
            return (
              <div className="bar-col" key={d.date}>
                {isMax && <span className="bar-value">{d.count}</span>}
                <div className="bar-tooltip">
                  {d.count} completed · {d.date === today ? 'Today' : dayLabel(d.date)}
                </div>
                <div className={`bar ${isToday ? 'today' : ''}`} style={{ height: `${heightPct}%` }} />
              </div>
            );
          })}
        </div>
        <div className="bar-labels">
          {chart.map((d) => (
            <span key={d.date}>{dayLabel(d.date)}</span>
          ))}
        </div>
      </div>
    </aside>
  );
}
