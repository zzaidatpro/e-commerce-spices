create or replace view public.produits_notes as
select
  produit_id,
  round(avg(note), 1) as note_moyenne,
  count(*)::integer as nb_avis,
  count(*) filter (where note = 1)::integer as n1,
  count(*) filter (where note = 2)::integer as n2,
  count(*) filter (where note = 3)::integer as n3,
  count(*) filter (where note = 4)::integer as n4,
  count(*) filter (where note = 5)::integer as n5
from public.rates
where publie
group by produit_id;

comment on view public.produits_notes is
  'Vue publique volontaire (security definer) : agrégats de notes uniquement, avis publiés. Aucune donnée personnelle ni texte d''avis.';

revoke all on public.produits_notes from anon, authenticated;
grant select on public.produits_notes to anon, authenticated;