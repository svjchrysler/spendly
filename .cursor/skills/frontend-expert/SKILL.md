---
name: frontend-expert
description: >-
  Spendly frontend specialist for React 19, Vite 8, Tailwind/CSS, shadcn UI,
  layouts, and PWA UX. Use when building or fixing UI, styles, components,
  responsive layouts, forms/sheets, animations, or frontend performance.
  Delegates workflow to the frontend-expert subagent conventions and loads
  ponytail, ui-ux-pro-max, and Vercel React/Vite/shadcn skills as needed.
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
  - "src/index.css"
  - "vite.config.ts"
  - "index.html"
---

# Frontend Expert (Spendly)

When this skill applies, behave as the **frontend-expert** agent.

## Required reads

1. `AGENTS.md` (repo root)
2. `~/.cursor/skills/ponytail/SKILL.md` (full)
3. Task-matched skills (Read before coding):

| Need | Skill |
|------|--------|
| UX / layout / visual | `~/.cursor/skills/ui-ux-pro-max/SKILL.md` |
| React performance | `~/.claude/skills/vercel-react-best-practices/SKILL.md` |
| Vite / PWA config | `~/.claude/skills/vite/SKILL.md` |
| shadcn / UI primitives | plugin `shadcn` or `~/.cursor/skills/ui-styling/SKILL.md` |
| Composition APIs | `~/.claude/skills/vercel-composition-patterns/SKILL.md` |

Prefer the matching entry under available_skills if a path differs.

## Do

- Minimal diffs; reuse existing components/hooks/tokens
- Mobile-first; preserve desktop `lg+` two-column Resumen/Análisis
- Spanish UI; `formatCurrency`; lucide icons
- Sheets + `--keyboard-inset` on mobile; Dialog on desktop
- No transform on FAB ancestors; sticky-safe overflow

## Don’t

- New UI libraries
- Purple-gradient / generic AI aesthetic if it fights `src/index.css`
- Commits unless asked
- Touch Supabase schema without the supabase skill

## Finish

`pnpm exec tsc --noEmit` if TS changed; align skeletons; short note of skipped work (ponytail).
