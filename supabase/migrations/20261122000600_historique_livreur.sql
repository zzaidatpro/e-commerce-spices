create or replace function public.historique_livreur(
  p_periode text default 'mois',
  p_ref timestamptz default now()
)
returns table (
  periode_debut date,
  nb_livraisons bigint,
  montant_total numeric,
  nb_confirmees bigint,
  nb_refusees bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tz text := 'Africa/Algiers';
  v_unite text;
begin
  if not public.est_livreur() then
    raise exception 'Accès réservé aux livreurs.';
  end if;

  if p_periode not in ('jour', 'semaine', 'mois') then
    raise exception 'Période invalide.';
  end if;

  v_unite := case p_periode when 'jour' then 'day' when 'semaine' then 'week' else 'month' end;

  return query
  select
    (date_trunc(v_unite, o.expediee_at at time zone v_tz))::date as periode_debut,
    count(*) filter (where o.statut in ('livrée', 'confirmée', 'terminée', 'remboursée')),
    coalesce(sum(o.montant_declare) filter (where o.montant_declare is not null), 0),
    count(*) filter (where o.statut in ('confirmée', 'terminée', 'remboursée')),
    (select count(*) from public.livraisons_historique h
      where h.livreur_id = auth.uid()
        and h.evenement = 'refuse'
        and date_trunc(v_unite, h.at at time zone v_tz) = date_trunc(v_unite, o.expediee_at at time zone v_tz))
  from public.orders o
  where o.livreur_id = auth.uid()
    and o.expediee_at is not null
    and o.expediee_at < date_trunc(v_unite, p_ref at time zone v_tz) at time zone v_tz
        + case v_unite when 'day' then interval '1 day' when 'week' then interval '1 week' else interval '1 month' end
    and o.expediee_at >= date_trunc(v_unite, p_ref at time zone v_tz) at time zone v_tz
        - case v_unite when 'day' then interval '30 days' when 'week' then interval '12 weeks' else interval '12 months' end
  group by 1
  order by 1 desc;
end;
$$;

revoke all on function public.historique_livreur(text, timestamptz) from public, anon;
grant execute on function public.historique_livreur(text, timestamptz) to authenticated;