create or replace function public.liste_clients()
returns table (
  id uuid,
  nom text,
  prenom text,
  email text,
  telephone text,
  whatsapp text,
  status text,
  nb_commandes bigint,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  return query
  select
    p.id,
    p.nom,
    p.prenom,
    p.email,
    p.telephone,
    p.whatsapp,
    p.status::text,
    (select count(*)::bigint from public.orders o where o.client_id = p.id),
    p.created_at
  from public.profiles p
  where p.role = 'client'
  order by p.created_at desc;
end;
$$;

revoke all on function public.liste_clients() from public, anon;
grant execute on function public.liste_clients() to authenticated;