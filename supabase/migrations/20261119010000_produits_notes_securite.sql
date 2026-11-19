alter view if exists public.produits_notes set (security_invoker = true);
revoke insert, update, delete, truncate, references, trigger
  on public.produits_notes from anon, authenticated;
grant select on public.produits_notes to anon, authenticated;