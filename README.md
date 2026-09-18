# Nova Tasks

A dark, glass-and-glow todo app built with React + Vite. Everything is stored
in your browser's `localStorage` — no backend, no account.

## Run it

```bash
npm install
npm run dev
```

Then open the printed `localhost` URL.

## Features

- **Quick capture with shorthand** — type `Ship deck !h #work @tomorrow` and
  it parses priority (`!h`/`!m`/`!l`), tags (`#tag`), and due date (`@today`,
  `@friday`, `@2026-09-20`, …) out of the sentence.
- **Priorities, tags, due dates** — colored priority dots, categorical tag
  chips, and due/overdue badges.
- **Subtasks** with their own drag-to-reorder checklist.
- **Drag-to-reorder** the main list (only active in "Manual" sort mode).
- **Recurring tasks** — set a task to repeat daily/weekly/monthly; completing
  it spawns the next occurrence automatically.
- **Completed tasks** stay in place, crossed out, instead of disappearing.
- **Stats panel** — completion rate, current/best streak, and a 7-day
  completed-tasks chart.
- **Pomodoro timer** — floating widget, optionally focused on a specific
  task; logs sessions toward that task's count and today's stats.
- **Command palette** — `Ctrl/Cmd+K` (or the header button) for quick
  navigation and actions; `n` focuses quick-add, `/` focuses search.
- **Due-date reminders** — opt in via the command palette
  ("Enable due-date reminders") to get a browser notification once a day
  when something is due or overdue.

## Deploying (GitHub Pages)

A workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
builds and publishes `dist/` to GitHub Pages on every push to `main`. This
folder is meant to be the root of its own git repository. One-time setup
after pushing it to GitHub:

1. `git init && git add -A && git commit -m "Initial commit"` (if not already
   a repo).
2. Create a GitHub repo and push this folder to it, e.g.:
   ```bash
   gh repo create nova-tasks --public --source=. --remote=origin --push
   ```
3. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**,
   select **GitHub Actions**. (Only needed once — the workflow handles every
   deploy after that.)
4. Push to `main` (or run the workflow manually from the **Actions** tab) and
   the site will be live at `https://<user>.github.io/<repo>/` a minute or
   two later.

`vite.config.js` uses a relative `base: './'` so the build works at that
subpath without editing anything per-repo.

## Notes

This project pins `vite` to the `^5` esbuild-based toolchain rather than the
newer Vite 8 (rolldown-based) default, because the rolldown native binary was
blocked by a Windows Application Control policy on the machine this was
built on. If your machine doesn't have that restriction, upgrading is fine.
