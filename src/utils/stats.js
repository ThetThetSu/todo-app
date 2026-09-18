import { addDaysISO, lastNDays, toISODate, todayISO } from './date';

function completionDaySet(tasks) {
  const days = new Set();
  for (const t of tasks) {
    if (t.completedAt) days.add(toISODate(t.completedAt));
  }
  return days;
}

// Current streak = consecutive days (ending today or yesterday) with >=1 completed task.
export function currentStreak(tasks) {
  const days = completionDaySet(tasks);
  const today = todayISO();
  let cursor = days.has(today) ? today : addDaysISO(today, -1);
  if (!days.has(cursor)) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

export function longestStreak(tasks) {
  const days = [...completionDaySet(tasks)].sort();
  if (days.length === 0) return 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === addDaysISO(days[i - 1], 1)) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }
  return longest;
}

export function completionRate(tasks) {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}

export function last7DaysCompletions(tasks) {
  const days = lastNDays(7);
  const counts = Object.fromEntries(days.map((d) => [d, 0]));
  for (const t of tasks) {
    if (!t.completedAt) continue;
    const d = toISODate(t.completedAt);
    if (d in counts) counts[d] += 1;
  }
  return days.map((d) => ({ date: d, count: counts[d] }));
}

export function pomodorosToday(sessionLog) {
  const today = todayISO();
  return sessionLog.filter((s) => toISODate(s.completedAt) === today).length;
}
