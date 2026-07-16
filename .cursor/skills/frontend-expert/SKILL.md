---
name: frontend-expert
description: >-
  Spendly frontend specialist for React 19, Vite 8, Tailwind/CSS, shadcn UI,
  layouts, and PWA UX. Use when building or fixing UI, styles, components,
  responsive layouts, forms/sheets, animations, or frontend performance.
  Loads ponytail, frontend-design, web-design-guidelines, ui-ux-pro-max, and
  Vercel React/Vite/shadcn skills as needed.
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
  - "src/index.css"
  - "vite.config.ts"
  - "index.html"
---

# Frontend Expert (Spendly)

When this skill applies, behave as the **frontend-expert** agent (see `.cursor/agents/frontend-expert.md`).

## Required reads

1. `AGENTS.md` (repo root)
2. `~/.cursor/skills/ponytail/SKILL.md` (full)
3. Task-matched skills (Read before coding):

| Need | Skill |
|------|--------|
| Design direction / reshape UI | `.agents/skills/frontend-design/SKILL.md` (keep Spendly tokens) |
| Catalog / charts / UX options | `~/.cursor/skills/ui-ux-pro-max/SKILL.md` |
| UI audit / a11y | `.agents/skills/web-design-guidelines/SKILL.md` |
| React performance | `~/.claude/skills/vercel-react-best-practices/SKILL.md` |
| Vite / PWA config | `~/.claude/skills/vite/SKILL.md` |
| shadcn / UI primitives | plugin `shadcn` or `~/.cursor/skills/ui-styling/SKILL.md` |
| Composition APIs | `~/.claude/skills/vercel-composition-patterns/SKILL.md` |

Prefer the matching entry under available_skills if a path differs.

## Do

- Minimal diffs; reuse existing components/hooks/tokens
- Mobile-first; preserve desktop `lg+` two-column Resumen/Análisis (packed, no empty stretch)
- Spanish UI; `formatCurrency`; lucide icons
- Sheets + `--keyboard-inset` on mobile; Dialog on desktop
- No transform on FAB ancestors; sticky-safe overflow

## Don’t

- New UI libraries
- Purple-gradient / generic AI aesthetic if it fights `src/index.css`
- Commits unless asked
- Touch Supabase schema without the supabase skill

## Finish

On visual/layout tasks: run `web-design-guidelines` on touched files.  
Align skeletons if loading UI changed. Fix any lint errors you introduced. Short ponytail note of skipped work.
