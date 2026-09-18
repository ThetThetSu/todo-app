const DAY = 24 * 60 * 60 * 1000;

export function toISODate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDaysISO(iso, days) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addInterval(iso, freq, interval) {
  const base = iso || todayISO();
  const d = new Date(`${base}T00:00:00`);
  const n = Math.max(1, interval || 1);
  if (freq === 'daily') d.setDate(d.getDate() + n);
  else if (freq === 'weekly') d.setDate(d.getDate() + 7 * n);
  else if (freq === 'monthly') d.setMonth(d.getMonth() + n);
  else d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function isOverdue(dueDate, done) {
  if (!dueDate || done) return false;
  return dueDate < todayISO();
}

export function isDueToday(dueDate) {
  return !!dueDate && dueDate === todayISO();
}

export function isUpcoming(dueDate) {
  if (!dueDate) return false;
  const today = todayISO();
  const soon = addDaysISO(today, 7);
  return dueDate > today && dueDate <= soon;
}

export function formatDueDate(dueDate) {
  if (!dueDate) return '';
  const today = todayISO();
  if (dueDate === today) return 'Today';
  if (dueDate === addDaysISO(today, 1)) return 'Tomorrow';
  if (dueDate === addDaysISO(today, -1)) return 'Yesterday';
  const d = new Date(`${dueDate}T00:00:00`);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}

export function parseNaturalDate(word) {
  const w = word.toLowerCase();
  const today = todayISO();
  if (w === 'today') return today;
  if (w === 'tomorrow' || w === 'tmrw') return addDaysISO(today, 1);
  if (/^\d{4}-\d{2}-\d{2}$/.test(word)) return word;
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const idx = weekdays.indexOf(w);
  if (idx >= 0) {
    const now = new Date(`${today}T00:00:00`);
    let diff = idx - now.getDay();
    if (diff <= 0) diff += 7;
    return addDaysISO(today, diff);
  }
  return null;
}

export function lastNDays(n) {
  const today = todayISO();
  const days = [];
  for (let i = n - 1; i >= 0; i--) days.push(addDaysISO(today, -i));
  return days;
}

export function dayLabel(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'narrow' });
}

export const MS_PER_DAY = DAY;
