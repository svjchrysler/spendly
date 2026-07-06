-- Allow idempotent imports from external apps (e.g. MonAi CSV)
alter table public.expenses
  add column if not exists external_id text;

create unique index if not exists expenses_user_external_id_idx
  on public.expenses (user_id, external_id)
  where external_id is not null;
