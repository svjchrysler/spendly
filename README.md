# Spendly

App personal de gastos mensuales. PWA con **Vite + React 19 + TypeScript**, **Supabase** (Auth, Postgres, RLS, Realtime) y UI en español (moneda por defecto **BOB** / `es-BO`).

Demo: [spendly-two-zeta.vercel.app](https://spendly-two-zeta.vercel.app)

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Vite 8, React 19, TypeScript, Tailwind CSS v4, shadcn/Base UI |
| Backend | Supabase (Auth, PostgreSQL, RLS, Realtime) |
| Datos | TanStack Query + persistencia en `localStorage` |
| PWA | `vite-plugin-pwa` + Workbox (autoUpdate) |
| Charts / motion | Recharts, Framer Motion |
| Forms | React Hook Form + Zod |

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io)
- Proyecto en [Supabase](https://supabase.com)
- Docker Desktop (opcional, solo si usás `supabase start` en local)

## Configuración

### 1. Variables de entorno

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave `anon` / publishable (nunca la `service_role`) |
| `VITE_OWNER_EMAIL` | Email del dueño (opcional; useful para seeds/import) |
| `VITE_CURRENCY` | Código ISO de moneda (default `BOB`) |
| `VITE_CURRENCY_LOCALE` | Locale de formato (default `es-BO`) |

### 2. Base de datos

Migraciones en `supabase/migrations/`:

- Tablas: `categories`, `expenses`, `monthly_budgets`
- RLS por `user_id`
- Trigger de categorías default al registrarse
- Realtime + endurecimiento de triggers

Proyecto remoto vinculado (ref `jubanrtqcxhnlblkgoij`). En otra máquina:

```bash
supabase login
supabase link --project-ref jubanrtqcxhnlblkgoij
supabase db push
```

**Local (Docker):**

```bash
supabase start
supabase db reset
```

### 3. Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Rutas

| Ruta | Pantalla |
|------|----------|
| `/login` | Auth (email/contraseña + magic link) |
| `/` | **Resumen** — total del mes, KPIs, top categorías |
| `/analisis` | **Análisis** — historial mensual + asignación completa |
| `/gastos` | **Gastos** — listado agrupado por fecha, filtros, FAB |
| `/categorias` | **Categorías** — CRUD |

En móvil: bottom nav. En desktop: tabs en el header.

## Funcionalidades

- Auth con sesión persistente; comportamiento offline-aware (no fuerza logout sin red)
- Presupuesto mensual, alerta al acercarse al tope
- CRUD de gastos con optimistic updates + Realtime
- Categorías con icono/color; sugerencia de categoría al escribir la descripción
- Tema claro / oscuro (persistido en `localStorage`)
- PWA instalable (iOS / Android / desktop)
- Cache de queries offline (~7 días) + banner “Sin conexión”
- Historial de gastos con headers sticky por fecha
- Sheets/modals mobile-friendly (levanta sobre el teclado)

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Typecheck + build de producción |
| `pnpm preview` | Preview del build |
| `pnpm lint` | Oxlint |
| `pnpm test` | Vitest (una pasada) |
| `pnpm test:watch` | Vitest en watch |
| `pnpm import:monai` | Import helper CSV (`scripts/import-monai-csv.mjs`) |

## Estructura (resumen)

```
src/
  components/   # UI, gastos, charts, layout
  contexts/     # Auth, Month, Theme
  hooks/        # expenses, categories, stats, PWA helpers
  lib/          # supabase client, format, query-client, PWA
  pages/        # pantallas por ruta
  routes/       # Protected / Public
supabase/
  migrations/   # schema + RLS
```

## Deploy

Pensado para **Vercel**. Variables `VITE_*` deben configurarse en el proyecto de Vercel. El service worker se genera en el build (`vite-plugin-pwa`).

## Seguridad

- Solo clave `anon` en el cliente
- RLS en todas las tablas: cada usuario ve solo sus datos
- No commitear `.env.local` ni claves `service_role`
