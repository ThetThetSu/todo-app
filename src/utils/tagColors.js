// Fixed categorical order (dark-surface steps) — never cycled within the first 8 tags.
export const CATEGORICAL_DARK = [
  '#3987e5', // blue
  '#d95926', // orange
  '#199e70', // aqua
  '#c98500', // yellow
  '#d55181', // magenta
  '#008300', // green
  '#9085e9', // violet
  '#e66767', // red
];

export function colorForTag(tag, allTagsInFirstSeenOrder) {
  const idx = allTagsInFirstSeenOrder.indexOf(tag);
  if (idx < 0) return CATEGORICAL_DARK[0];
  return CATEGORICAL_DARK[idx % CATEGORICAL_DARK.length];
}

export function collectTagsInFirstSeenOrder(tasks) {
  const seen = [];
  for (const task of tasks) {
    for (const tag of task.tags || []) {
      if (!seen.includes(tag)) seen.push(tag);
    }
  }
  return seen;
}
