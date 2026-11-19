revoke insert, update, delete, truncate, references, trigger
  on public.avis_publics from authenticated, anon;
grant select on public.avis_publics to authenticated;
alter view public.avis_publics set (security_invoker = true);