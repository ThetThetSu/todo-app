import { parseNaturalDate } from './date';

const PRIORITY_TOKENS = { '!h': 'high', '!m': 'medium', '!l': 'low' };

// Parses shorthand out of quick-capture text:
//   #tag        -> tags
//   !h / !m / !l -> priority
//   @today, @tomorrow, @friday, @2026-09-20 -> due date
export function parseQuickCapture(raw) {
  const tags = [];
  let priority = null;
  let dueDate = null;
  const words = raw.split(/\s+/);
  const rest = [];

  for (const word of words) {
    if (!word) continue;
    const lower = word.toLowerCase();
    if (word.startsWith('#') && word.length > 1) {
      tags.push(word.slice(1).toLowerCase());
      continue;
    }
    if (PRIORITY_TOKENS[lower]) {
      priority = PRIORITY_TOKENS[lower];
      continue;
    }
    if (word.startsWith('@') && word.length > 1) {
      const parsed = parseNaturalDate(word.slice(1));
      if (parsed) {
        dueDate = parsed;
        continue;
      }
    }
    rest.push(word);
  }

  return {
    title: rest.join(' ').trim(),
    tags,
    priority,
    dueDate,
  };
}
