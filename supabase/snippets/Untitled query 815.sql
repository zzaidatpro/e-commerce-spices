begin;
set local role anon;
select produit_id, note_moyenne, nb_avis from public.produits_notes limit 3;
rollback;