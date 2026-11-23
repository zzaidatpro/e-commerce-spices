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
  v_borne_sup timestamptz;
  v_borne_inf timestamptz;
begin
  if not public.est_livreur() then
    raise exception 'Accès réservé aux livreurs.';
  end if;

  if p_periode not in ('jour', 'semaine', 'mois') then
    raise exception 'Période invalide.';
  end if;

  v_unite := case p_periode when 'jour' then 'day' when 'semaine' then 'week' else 'month' end;

  v_borne_sup := (date_trunc(v_unite, p_ref at time zone v_tz)
    + case v_unite
        when 'day' then interval '1 day'
        when 'week' then interval '1 week'
        else interval '1 month'
      end) at time zone v_tz;

  v_borne_inf := (date_trunc(v_unite, p_ref at time zone v_tz)
    - case v_unite
        when 'day' then interval '30 days'
        when 'week' then interval '12 weeks'
        else interval '12 months'
      end) at time zone v_tz;

  return query
  with commandes_periode as (
    select
      (date_trunc(v_unite, o.expediee_at at time zone v_tz))::date as p_debut,
      o.statut,
      o.montant_declare
    from public.orders o
    where o.livreur_id = auth.uid()
      and o.expediee_at is not null
      and o.expediee_at < v_borne_sup
      and o.expediee_at >= v_borne_inf
  ),
  stats_commandes as (
    select
      c.p_debut,
      count(*) filter (where c.statut in ('livrée', 'confirmée', 'terminée', 'remboursée')) as nb_livraisons,
      coalesce(sum(c.montant_declare) filter (where c.montant_declare is not null), 0) as montant_total,
      count(*) filter (where c.statut in ('confirmée', 'terminée', 'remboursée')) as nb_confirmees
    from commandes_periode c
    group by c.p_debut
  ),
  refus_periode as (
    select
      (date_trunc(v_unite, h.at at time zone v_tz))::date as p_debut,
      count(*) as nb_refusees
    from public.livraisons_historique h
    where h.livreur_id = auth.uid()
      and h.evenement = 'refuse'
      and h.at < v_borne_sup
      and h.at >= v_borne_inf
    group by (date_trunc(v_unite, h.at at time zone v_tz))::date
  ),
  toutes_periodes as (
    select p_debut from stats_commandes
    union
    select p_debut from refus_periode
  )
  select
    tp.p_debut as periode_debut,
    coalesce(sc.nb_livraisons, 0) as nb_livraisons,
    coalesce(sc.montant_total, 0) as montant_total,
    coalesce(sc.nb_confirmees, 0) as nb_confirmees,
    coalesce(rp.nb_refusees, 0) as nb_refusees
  from toutes_periodes tp
  left join stats_commandes sc on sc.p_debut = tp.p_debut
  left join refus_periode rp on rp.p_debut = tp.p_debut
  order by tp.p_debut desc;
end;
$$;

revoke all on function public.historique_livreur(text, timestamptz) from public, anon;
grant execute on function public.historique_livreur(text, timestamptz) to authenticated;