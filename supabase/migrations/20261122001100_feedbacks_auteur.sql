drop function if exists public.liste_feedbacks();

create function public.liste_feedbacks()
returns table (
  id uuid,
  subject text,
  message text,
  status text,
  categorie text,
  created_at timestamptz,
  reponse text,
  reponse_at timestamptz,
  reponse_lue_at timestamptz,
  auteur_nom text,
  auteur_prenom text,
  auteur_email text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_admin boolean := public.est_admin();
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  return query
  select
    f.id,
    f.subject::text,
    f.message::text,
    f.status::text,
    f.categorie::text,
    f.created_at,
    f.reponse::text,
    f.reponse_at,
    f.reponse_lue_at,
    p.nom::text,
    p.prenom::text,
    p.email::text
  from public.feedbacks f
  left join public.profiles p on p.id = f.from_profile_id
  where v_admin
     or f.categorie = 'client'
     or f.from_profile_id = v_uid
  order by f.created_at desc;
end;
$$;

revoke all on function public.liste_feedbacks() from public, anon;
grant execute on function public.liste_feedbacks() to authenticated;