# Accessibility and Contrast Rules

- Always ensure text colors have a contrast ratio of at least 4.5:1 (WCAG AA) against their background.
- When using Tailwind classes, `text-muted-foreground` against light gray backgrounds like `bg-muted` or `#F4F3F3` often fails contrast checks. Use explicitly darker colors like `text-[#52525B]` (zinc-600) or darker on light gray backgrounds to guarantee legibility.
- Similarly, white text on colored backgrounds must be sufficiently dark (e.g., `emerald-800` instead of `emerald-600` for badges).
- Do not skip heading levels (e.g., don't go from `h1` straight to `h3`). Always maintain a strict `h1` -> `h2` -> `h3` hierarchy.
- Always include `aria-label` or visible text inside interactive elements (buttons, triggers, progress bars) so screen readers can announce them.

# Documentation Updates

- Stop auto-updating `CONTRIBUTIONS.md`. Instead, update `CONTRIBUTIONS.md` (using `node scripts/generate-contributions.mjs`) ONLY when the user explicitly asks to update `README.md`. Always update both of them together.

# Daily Standup Greeting

- Whenever a conversation starts or the user asks for their daily brief, check the current `bug_list.md` and `todo_list.md` artifacts.
- Ask the user whether they are Akash (Backend) or Loki (Frontend) if you don't already know.
- Proactively present them with their specific TODO list for the day and summarize any active bugs.
