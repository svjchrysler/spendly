-- Trigger-only function: block direct RPC execution (Supabase security advisor)
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

-- Realtime for cross-device expense sync
alter publication supabase_realtime add table public.expenses;
