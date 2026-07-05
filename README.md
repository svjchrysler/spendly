# Spendly

Gestor de gastos mensuales con **Vite + React + TypeScript** y **Supabase** (auth, Postgres, RLS, Realtime).

## Stack

- Frontend: Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- Backend: Supabase (Auth, PostgreSQL, Row Level Security)
- Estado: TanStack Query con optimistic updates
- Gráficos: Recharts
- Animaciones: Framer Motion

## Requisitos

- Node.js 20+
- pnpm
- Cuenta en [Supabase](https://supabase.com)
- Docker Desktop (opcional, solo para desarrollo local con `supabase start`)

## Configuración

### 1. Variables de entorno

Copia `.env.example` a `.env.local` y completa tus credenciales del dashboard de Supabase:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 2. Base de datos

Proyecto remoto **spendly** (`jubanrtqcxhnlblkgoij`) ya creado y vinculado.

Dashboard: https://supabase.com/dashboard/project/jubanrtqcxhnlblkgoij

Si clonas el repo en otra máquina:

```bash
supabase login
supabase link --project-ref jubanrtqcxhnlblkgoij
supabase db push
```

**Opción local (requiere Docker):**

```bash
supabase start
supabase db reset
```

La migración en `supabase/migrations/` crea:

- Tablas: `categories`, `expenses`, `monthly_budgets`
- RLS por usuario
- Trigger de categorías default al registrarse

### 3. Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Funcionalidades

- Registro e inicio de sesión (email/contraseña + magic link)
- Dashboard con KPI mensual, presupuesto, gráficos por categoría e historial
- CRUD de gastos con optimistic updates
- Gestión de categorías con iconos y colores
- Navegación responsive (bottom nav en móvil, sidebar en desktop)
- Sincronización Realtime entre dispositivos

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm preview` | Preview del build |
| `pnpm lint` | Linter (oxlint) |

## Seguridad

- Solo se usa la clave `anon` en el frontend
- RLS habilitado en todas las tablas
- Cada usuario solo accede a sus propios datos
