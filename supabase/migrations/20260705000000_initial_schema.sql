-- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'receipt',
  color text not null default '#3B82F6',
  created_at timestamptz not null default now()
);

-- expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  description text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- monthly budgets
create table public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  amount numeric(12,2) not null check (amount >= 0),
  unique (user_id, year, month)
);

create index expenses_user_date_idx on public.expenses (user_id, expense_date desc);
create index expenses_category_idx on public.expenses (category_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger expenses_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- default categories on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon, color) values
    (new.id, 'Alimentación', 'utensils', '#F59E0B'),
    (new.id, 'Transporte', 'car', '#3B82F6'),
    (new.id, 'Vivienda', 'home', '#8B5CF6'),
    (new.id, 'Entretenimiento', 'gamepad-2', '#EC4899'),
    (new.id, 'Salud', 'heart-pulse', '#059669'),
    (new.id, 'Otros', 'receipt', '#64748B');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.monthly_budgets enable row level security;

create policy "categories_select_own"
  on public.categories for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "categories_update_own"
  on public.categories for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "expenses_select_own"
  on public.expenses for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "expenses_insert_own"
  on public.expenses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "expenses_update_own"
  on public.expenses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "expenses_delete_own"
  on public.expenses for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "budgets_select_own"
  on public.monthly_budgets for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "budgets_insert_own"
  on public.monthly_budgets for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "budgets_update_own"
  on public.monthly_budgets for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "budgets_delete_own"
  on public.monthly_budgets for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- grants for Data API
grant usage on schema public to authenticated;
grant all on public.categories to authenticated;
grant all on public.expenses to authenticated;
grant all on public.monthly_budgets to authenticated;
