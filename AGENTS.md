# AGENTS.md — Spendly

Instrucciones para agentes de código (Cursor, etc.) que trabajen en este repo.
Leé esto antes de cambiar UI, datos o Supabase.

## Qué es

**Spendly** — PWA personal de gastos mensuales. UI en **español**, moneda default **BOB** (`es-BO`).
Deploy: Vercel → https://spendly-two-zeta.vercel.app  
Backend: Supabase project ref `jubanrtqcxhnlblkgoij`.

No es un SaaS multi-tenant genérico: es una app chica, mobile-first, con shell desktop.

## Stack (no inventar)

| Área | Usar |
|------|------|
| Build | Vite 8 + React 19 + TypeScript |
| Estilos | Tailwind v4 + tokens en `src/index.css` |
| UI kit | shadcn / `@base-ui/react` en `src/components/ui/` |
| Iconos | `lucide-react` (no emojis como iconos de sistema) |
| Router | `react-router-dom` v7 |
| Data | TanStack Query + persist (`src/lib/query-client.ts`) |
| Backend | `@supabase/supabase-js` (`src/lib/supabase.ts`) |
| Forms | RHF + Zod |
| Charts | Recharts (lazy donde ya esté lazy) |
| Motion | Framer Motion (cuidado con `transform` — ver pitfalls) |
| Package manager | **pnpm** (no npm/yarn) |
| Lint / test | `oxlint`, `vitest` |

Alias: `@/*` → `src/*`.

## Comandos

```bash
pnpm install
pnpm dev          # :5173
pnpm build        # tsc -b && vite build
pnpm lint
pnpm test
pnpm preview
```

Env: copiar `.env.example` → `.env.local`. Solo `VITE_*`. Nunca `service_role` en el cliente.

## Arquitectura

```
src/
  App.tsx              # routes + PersistQueryClientProvider + Theme/Auth
  pages/               # una pantalla por ruta (lazy salvo Login)
  components/
    layout/            # AppShell, PageEnter, skeletons, OfflineBanner
    expenses/          # form, list, filters, FAB sheets
    dashboard/         # SpendingHero, MonthlyCapAlert
    charts/            # CategoryAllocation, MonthlyBar
    ui/                # primitives shadcn — editar con cuidado
  contexts/            # Auth, Month, Theme
  hooks/               # useExpenses, useCategories, useMonthlyStats, useRealtimeExpenses, useKeyboardInset
  lib/                 # supabase, format, query-client, theme, predict-category, register-pwa
  types/database.ts    # tipos DB
supabase/migrations/   # fuente de verdad del schema
```

### Rutas

| Path | Page | Rol |
|------|------|-----|
| `/login` | LoginPage | público |
| `/` | DashboardPage (Resumen) | KPI + top categorías |
| `/analisis` | AnalisisPage | chart historial + asignación full |
| `/gastos` | ExpensesPage | listado + filtros + FAB add |
| `/categorias` | CategoriesPage | CRUD categorías |

Nav: 4 tabs. Mobile = bottom bar. Desktop = header tabs.

### Datos

- Queries en hooks (`useExpenses`, `useCategories`, `useMonthlyStats`, …).
- Keys tipicas: `['expenses', …]`, `['monthly-stats', year, month]`, `['categories']`, `['monthly-budget', year, month]`.
- Mutations con optimistic updates + invalidate de stats.
- Realtime: `useRealtimeExpenses` montado en `AppShell`.
- Persist cache: key `spendly-query-cache`, buster `v1` — **bumpear buster** si cambian query keys / shape.
- `MonthContext` define `year`/`month` global para casi todas las queries.

### Auth / offline

- Sesión persistida + autoRefresh.
- Offline: queries `networkMode: 'offlineFirst'`; no forzar logout por `SIGNED_OUT` sin red.
- Banner: `OfflineBanner` (elemento `<output>`, no reinventar).

## Convenciones de código

1. **Diff mínimo.** No refactors cosméticos ni files “por si acaso”.
2. **Reusar** hooks, `formatCurrency` / `formatDayLabel`, skeletons, UI existentes.
3. **Copy UI en español.** Errores de auth también mapeados a español.
4. **Dinero:** siempre `formatCurrency` de `@/lib/format` (respeta `VITE_CURRENCY`).
5. **Fechas de gasto:** string `YYYY-MM-DD` (`expense_date`), no Date sueltos en DB.
6. **Mobile vs desktop:** forms add/edit → `Sheet` bottom en mobile, `Dialog` en desktop (`useIsDesktop` = `min-width: 768px`).
7. **FAB:** portal a `document.body`; no meter `transform`/`filter` en ancestros del FAB (`PageEnter` = opacity only).
8. **Skeletons:** al tocar loading de una page, actualizar el skeleton hermano en `skeletons.tsx`.
9. **Comments:** solo si explican un tradeoff no obvio; prefijo `// ponytail:` para atajos deliberados.
10. **No** agregar deps si stdlib / lo instalado alcanza.
11. **No** commits ni push salvo que el usuario lo pida.
12. **Supabase:** cualquier cambio de schema → migración en `supabase/migrations/` + RLS. Seguir skill en `.agents/skills/supabase/`.

## UI / layout (reglas del producto)

- Mobile-first; desktop aprovecha espacio (Resumen/Análisis: grid 2 cols en `lg+`, stretch vertical).
- Tokens semánticos (`bg-background`, `text-muted-foreground`, `border-border`, `primary`…). Evitar hex sueltos salvo colores de categoría.
- Tema: `ThemeContext` + clase `.dark` en `<html>`; FOUC script en `index.html`.
- Bottom sheets: usan `--keyboard-inset` (`useKeyboardInset` + `visualViewport`). No poner `bottom-0` fijo que ignore el teclado.
- Sticky headers de fecha: no `overflow-x-hidden` en ancestros (usar `overflow-x-clip`); no animar `y`/`transform` en el section sticky.
- Safe areas: `env(safe-area-inset-*)` en header, tab bar, FAB, sheets.
- PWA: `interactive-widget=resizes-content` en viewport; manifest/icons vía `vite-plugin-pwa`.

## Pitfalls conocidos (no re-romper)

| Síntoma | Causa / fix |
|---------|-------------|
| FAB no fixed / “se mueve” | Ancestro con `transform`/`filter` → portal + PageEnter solo opacity |
| Sticky date no pega | `overflow-x-hidden` o `transform` en padre |
| Teclado tapa el form mobile | Sheet bottom debe usar `--keyboard-inset` |
| Logout al reabrir offline | Ignorar `SIGNED_OUT` sin red; persist session |
| Cache vieja post-cambio de keys | Subir `buster` en `queryPersistOptions` |
| Desktop vacío abajo (Resumen) | No estirar con `justify-between`/`min-h` — empaquetar contenido arriba |

## Schema (alto nivel)

- `categories` — `user_id`, name, icon, color
- `expenses` — amount, description, `expense_date`, `category_id`, optional `external_id`
- `monthly_budgets` — unique `(user_id, year, month)`
- RLS: solo filas del `auth.uid()`
- Trigger: categorías default al signup

Tipos TS: `src/types/database.ts`. Si cambia el schema, actualizar tipos.

## Testing

- Unit tests junto al módulo: `*.test.ts` en `src/lib/` (Vitest).
- Tras lógica no trivial (parse dinero, predict category, format): dejar/actualizar un test chico.
- No armar suites E2E salvo pedido.

## Deploy / env Vercel

Variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, opcionales `VITE_CURRENCY`, `VITE_CURRENCY_LOCALE`, `VITE_OWNER_EMAIL`.

## Qué no hacer

- No usar Inter/Roboto como “rediseño” ni temas purple-on-white genéricos si tocás look & feel — respetar tokens actuales.
- No cards decorativas de más; el lenguaje visual es denso, tipográfico, con rules/borders sutiles.
- No barrels innecesarios; imports directos `@/components/...`.
- No `service_role` ni secretos en el front.
- No `git commit` / `push` / `--no-verify` sin pedido explícito.
- No documentar en markdown extras (salvo que pidan README/AGENTS/etc.).

## Skills locales

- Supabase: `.agents/skills/supabase/SKILL.md` — **obligatorio** en tareas de DB/Auth/RLS/Realtime.
- Frontend expert: subagente `.cursor/agents/frontend-expert.md` + skill `.cursor/skills/frontend-expert/` — UI/React/Vite/CSS. Orquesta ponytail, **frontend-design**, **web-design-guidelines**, ui-ux-pro-max y skills Vercel. En tareas visuales, audit `web-design-guidelines` al terminar.
- Design (proyecto): `.agents/skills/frontend-design/` (Anthropic) — dirección visual; respetar tokens Spendly.
- Audit UI (proyecto): `.agents/skills/web-design-guidelines/` (Vercel) — a11y/UX checklist.
- Design system legacy: `design-system/spendly/MASTER.md` (puede estar desfasado vs tokens reales en `index.css`; priorizar CSS/código).

## Checklist rápido antes de terminar

- [ ] `pnpm test` verde
- [ ] `pnpm build` verde (incluye typecheck)
- [ ] Mobile no roto si el cambio fue de desktop layout
- [ ] Loading state / skeleton alineado
- [ ] Copy en español
- [ ] Sin secretos nuevos en el repo
