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
| Iconos | `lucide-react` (no emojis como iconos de sistema). Única excepción: `layout/TabIcons.tsx`, set propio outline/filled estilo SF Symbols para el tab bar |
| Lenguaje visual | **iOS 26 / Apple HIG** — ver sección "Lenguaje visual" |
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

**Solo Docker** (sin Node/pnpm en la máquina):

```bash
cp .env.example .env   # o: docker compose --env-file .env.local …
docker compose up --build -d
# → http://localhost:8080
```

Env: copiar `.env.example` → `.env.local` (dev) o `.env` (compose). Solo `VITE_*`. Nunca `service_role` en el cliente.

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
- `['expense-history']` va **fuera** del prefijo `['expenses']` a propósito: bajo ese prefijo cada mutation lo invalidaba y re-bajaba 1500 filas solo para predecir categoría.
- Los `queryFn` del mes viven en `fetchMonthExpenses` / `fetchMonthlyStats` / `fetchCategories` (exportados desde los hooks) y los reusa `prefetch-month.ts` — no duplicar el select.
- Mutations con optimistic updates + invalidate de stats.
- Realtime: `useRealtimeExpenses` montado en `AppShell`.
- Persist cache: key `spendly-query-cache`, buster `v3` — **bumpear buster** si cambian query keys / shape.
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

## Lenguaje visual (iOS 26 / HIG)

La app sigue la guía de iOS 26. Lo nativo lo aportan estructura, materiales, motion y controles; la marca (Bricolage en títulos, Spline Sans Mono en montos, verde mint, borde de recibo) se conserva **dentro** de esa estructura.

- **Dos capas.** Contenido opaco que scrollea; navegación flotante con Liquid Glass. El glass va **solo** en la capa de navegación (`.material-glass`) y **nunca glass sobre glass**. Tarjetas y filas son opacas.
- **Listas `insetGrouped`.** Usar `List` / `ListSection` / `ListRow` de `@/components/ui/list`. Separador indentado al borde del label vía `--row-inset` — no reemplazar por `divide-y`, que no puede indentar.
- **Nav bar.** `NavBar` de `@/components/layout/NavBar` con large title que colapsa. La barra **no tiene material en reposo**: con la status bar en estilo `default` iOS pinta esa franja con `theme-color` y una barra tintada dejaría costura.
- **Tipografía.** Escala de iOS (`text-large-title` … `text-caption-2`). Cuerpo 17px. Bricolage arriba de 20px, Geist de 20px para abajo, Spline Mono en montos.
- **Color semántico.** Labels (`text-label`, `-secondary`, `-tertiary`, `-quaternary`), fills (`bg-fill-*`) y fondos agrupados (`--group-surface`). `--muted-foreground` y `--border` están re-apuntados a la jerarquía nueva: el código viejo migró solo.
- **Tap targets** de 44pt en mobile: `size="touch"` / `size="icon-touch"` en `Button`.
- **Motion.** Sistema en `index.css` → "Motion didáctico". Nada decora: cada animación contesta de dónde salió algo, hacia dónde navegaste, cuánto cambió un número o qué se puede tocar. Duraciones `--dur-1/2/3` + `--stagger-step`; utilidades `.reveal`, `.stagger`, `.swap[data-dir]`, `.row-landed`, `.shake`, `.notice-in`, `.icon-swap`. Los montos grandes usan `AnimatedAmount` (count-up); las barras crecen desde cero; el mes entra desde el lado hacia el que navegaste (`MonthContext.direction`). Los gestos (swipe, sheet, pull) conservan su propio timing físico. `useReducedMotion` para lo que anima JS (count-up, recharts, la pista de swipe); el CSS ya lo cubre la regla global.
- Status bar: se mantiene `apple-mobile-web-app-status-bar-style: default`. **No** cambiar a `black-translucent`: fuerza texto blanco e ilegible en modo claro. Consecuencia: `env(safe-area-inset-top)` vale 0 en standalone.

## UI / layout (reglas del producto)

- Mobile-first; desktop aprovecha espacio (Resumen/Análisis: grid 2 cols en `lg+`, stretch vertical).
- Tokens semánticos (`bg-background`, `text-muted-foreground`, `border-border`, `primary`…). Evitar hex sueltos salvo colores de categoría.
- Tema: `ThemeContext` + clase `.dark` en `<html>`; FOUC script en `index.html`.
- Bottom sheets: usan `--keyboard-inset` (`useKeyboardInset` + `visualViewport`). No poner `bottom-0` fijo que ignore el teclado.
- Los headers de fecha **ya no son sticky**: las listas agrupadas de iOS no pegan sus headers (eso es de las listas `plain`). Por eso el swipe puede transformar la fila. Si se reintroduce algo sticky, el transform va en la fila, nunca en la `section`.
- Safe areas: `env(safe-area-inset-*)` en header, tab bar, FAB, sheets.
- PWA: `interactive-widget=resizes-content` en viewport; manifest/icons vía `vite-plugin-pwa`.
- Iconos: monograma S (dos bowls elípticos tangentes, monolínea con cap redondo) generado por `scripts/generate-pwa-icons.mjs` — favicon.svg/.ico, apple-touch-icon, pwa-192/512/maskable/mono. No editarlos a mano. El favicon tiene talla óptica propia (trazo más grueso, bowls más anchos): a 16px el del icono grande se lava. `apple-touch-icon.png` va **sin** esquina redondeada: iOS aplica su superelipse encima.
- iOS congela el icono del home screen al instalar: no hay forma de actualizarlo sin reinstalar el acceso directo. `HomeIconNotice` avisa una vez a las apps ya instaladas; si cambia el arte, subir `HOME_ICON_VERSION` en `lib/home-icon.ts`.
- SW: `registerType: 'prompt'` + `skipWaiting: false`. La versión nueva se aplica sola al pasar la app a background y sin modales abiertos (`register-pwa.ts`). No volver a `autoUpdate`: recarga en caliente y tira el form a medio llenar.
- Splash de iOS: `public/splash/*.png` + `scripts/ios-splash-links.html` los genera `scripts/generate-ios-splash.mjs` (necesita sharp temporal, igual que `generate-pwa-icons.mjs`). Si cambia la paleta, la marca o las métricas de `#app-splash`, re-correrlo — el layout está calibrado contra el DOM real.

## Pitfalls conocidos (no re-romper)

| Síntoma | Causa / fix |
|---------|-------------|
| FAB no fixed / “se mueve” | Ancestro con `transform`/`filter` → portal + PageEnter solo opacity |
| Teclado tapa el form mobile | Sheet bottom debe usar `--keyboard-inset` |
| Logout al reabrir offline | Ignorar `SIGNED_OUT` sin red; persist session |
| Cache vieja post-cambio de keys | Subir `buster` en `queryPersistOptions` |
| Desktop vacío abajo (Resumen) | No estirar con `justify-between`/`min-h` — empaquetar contenido arriba |
| recharts/motion en el arranque | Un util compartido (`clsx`, `use-sync-external-store`) cae en el chunk de un grupo pesado y el entry lo importa estático. Los grupos `ui-vendor`/`react-vendor` de `vite.config.ts` van **antes** que `recharts` y llevan `/` final. Verificar con `grep -c recharts- dist/assets/index-*.js` → 0 |
| Datos del usuario tras logout | `purgeLocalUserData()` (`lib/session-cleanup.ts`) borra query cache + CacheStorage. Si se agrega otro runtime cache con datos, sumarlo a `DATA_CACHES` |
| Animación de entrada que rompe un `position: fixed` | `animation-fill-mode: both` deja aplicado el `transform: translateY(0)` final y eso ya crea containing block. Las entradas van con **`backwards`** |
| Globo de validación del navegador en inglés | El `<form>` con validación Zod necesita `noValidate`, o el browser dispara su propio mensaje antes y tapa el de la app |

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
- No volver a filas planas a sangre completa con hairlines: el lenguaje es `insetGrouped` de iOS. Tampoco cards decorativas fuera de ese sistema.
- No barrels innecesarios; imports directos `@/components/...`.
- No `service_role` ni secretos en el front.
- No `git commit` / `push` / `--no-verify` sin pedido explícito.
- No documentar en markdown extras (salvo que pidan README/AGENTS/etc.).

## Skills locales

- Supabase: `.agents/skills/supabase/SKILL.md` — **obligatorio** en tareas de DB/Auth/RLS/Realtime.
- Frontend expert + product designer + PWA/performance: subagente `.cursor/agents/frontend-expert.md` + skill `.cursor/skills/frontend-expert/` — define UX, arquitectura de información y dirección visual según dominio, audiencia, objetivo, plataforma y marca; implementa con React/Vite/CSS; owns installability, service worker/offline y performance mobile standalone (LCP/INP, precache, runtime cache). Orquesta ponytail, **frontend-design**, **web-design-guidelines**, ui-ux-pro-max y skills Vercel. En tareas visuales, audit `web-design-guidelines` al terminar.
- Design (proyecto): `.agents/skills/frontend-design/` (Anthropic) — dirección visual; respetar tokens Spendly.
- Audit UI (proyecto): `.agents/skills/web-design-guidelines/` (Vercel) — a11y/UX checklist.

## Checklist rápido antes de terminar

- [ ] `pnpm test` verde
- [ ] `pnpm build` verde (incluye typecheck)
- [ ] Mobile no roto si el cambio fue de desktop layout
- [ ] Loading state / skeleton alineado
- [ ] Copy en español
- [ ] Sin secretos nuevos en el repo
