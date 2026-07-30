-- Integrity: expenses.category_id must belong to the same user as the expense.
-- Composite unique on categories enables a composite FK (id, user_id).

alter table public.categories
  add constraint categories_id_user_id_key unique (id, user_id);

alter table public.expenses
  drop constraint if exists expenses_category_id_fkey;

alter table public.expenses
  add constraint expenses_category_user_fkey
  foreign key (category_id, user_id)
  references public.categories (id, user_id)
  on delete restrict;

-- Trigger function is SECURITY INVOKER; revoke EXECUTE from API roles just in case.
revoke execute on function public.set_updated_at() from public;
revoke execute on function public.set_updated_at() from anon, authenticated;
