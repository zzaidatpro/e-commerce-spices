-- Helper interne : écriture de l'historique
create or replace function public.journaliser_livraison(
  p_order uuid, p_livreur uuid, p_evenement text, p_detail text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.livraisons_historique (order_id, livreur_id, evenement, auteur, detail)
  values (p_order, p_livreur, p_evenement, auth.uid(), p_detail);
$$;

revoke all on function public.journaliser_livraison(uuid, uuid, text, text) from public, anon, authenticated;

-- 1. Valider le code reçu (livreur assigné, commande désignée, avant acceptation)
create or replace function public.valider_code_reception(p_order uuid, p_code text)
returns json
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_o public.orders%rowtype;
  v_row public.codes_livraison;
begin
  if not public.est_livreur() then
    return json_build_object('ok', false, 'message', 'Accès réservé aux livreurs.');
  end if;

  select * into v_o from public.orders where id = p_order;
  if not found or v_o.livreur_id <> auth.uid() then
    return json_build_object('ok', false, 'message', 'Livraison introuvable.');
  end if;
  if v_o.statut <> 'payée' and v_o.statut <> 'en_attente' then
    return json_build_object('ok', false, 'message', 'Cette livraison n''est plus en attente de code.');
  end if;

  select * into v_row from public.codes_livraison where order_id = p_order;
  if not found or v_row.used_at is not null or v_row.expires_at < now() then
    return json_build_object('ok', false, 'message', 'Aucun code valide. Demandez-en un nouveau au manager.');
  end if;
  if v_row.tentatives >= 5 then
    return json_build_object('ok', false, 'message', 'Trop de tentatives. Demandez un nouveau code au manager.');
  end if;

  if extensions.crypt(p_code, v_row.code_hash) <> v_row.code_hash then
    update public.codes_livraison set tentatives = tentatives + 1 where order_id = p_order;
    return json_build_object('ok', false, 'message', 'Code incorrect.');
  end if;

  update public.orders set code_recu_at = now() where id = p_order;
  perform public.journaliser_livraison(p_order, auth.uid(), 'code_recu');

  return json_build_object('ok', true, 'message', 'Code validé. Vous pouvez accepter la livraison.');
end;
$$;

-- 2. Accepter la livraison
create or replace function public.accepter_livraison(p_order uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.est_livreur() then raise exception 'Accès réservé aux livreurs.'; end if;

  update public.orders
  set acceptee_at = now()
  where id = p_order
    and livreur_id = auth.uid()
    and code_recu_at is not null
    and acceptee_at is null
    and statut in ('payée', 'en_attente');

  if not found then
    raise exception 'Acceptation impossible : code non validé ou livraison déjà acceptée.';
  end if;

  perform public.journaliser_livraison(p_order, auth.uid(), 'accepte');
end;
$$;

-- 3. Refuser la livraison : la commande revient au manager sans livreur
create or replace function public.refuser_livraison(p_order uuid, p_motif text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_livreur uuid;
begin
  if not public.est_livreur() then raise exception 'Accès réservé aux livreurs.'; end if;
  if char_length(btrim(coalesce(p_motif, ''))) < 5 then
    raise exception 'Motif requis (5 caractères minimum).';
  end if;

  select livreur_id into v_livreur from public.orders
  where id = p_order and livreur_id = auth.uid() and acceptee_at is null
    and statut in ('payée', 'en_attente')
  for update;

  if not found then raise exception 'Refus impossible pour cette livraison.'; end if;

  update public.orders set livreur_id = null, code_recu_at = null where id = p_order;
  perform public.journaliser_livraison(p_order, v_livreur, 'refuse', btrim(p_motif));
end;
$$;

-- 4. Démarrer la livraison
create or replace function public.demarrer_livraison(p_order uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.est_livreur() then raise exception 'Accès réservé aux livreurs.'; end if;

  perform set_config('app.flux', 'expédiée', true);

  update public.orders
  set statut = 'expédiée'
  where id = p_order
    and livreur_id = auth.uid()
    and acceptee_at is not null
    and statut in ('payée', 'en_attente');

  if not found then raise exception 'Démarrage impossible : livraison non acceptée.'; end if;

  perform public.journaliser_livraison(p_order, auth.uid(), 'demarre');
end;
$$;

-- 5. Déclarer le montant reçu (remise du colis)
create or replace function public.declarer_remise(p_order uuid, p_montant numeric)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_total numeric;
begin
  if not public.est_livreur() then raise exception 'Accès réservé aux livreurs.'; end if;

  select total into v_total from public.orders
  where id = p_order and livreur_id = auth.uid() and statut = 'expédiée';

  if not found then raise exception 'Déclaration impossible : livraison non en cours.'; end if;
  if p_montant is distinct from v_total then
    raise exception 'Montant déclaré incorrect : le montant dû est de % DA.', v_total;
  end if;

  update public.orders
  set montant_declare = p_montant, montant_declare_at = now()
  where id = p_order;

  perform public.journaliser_livraison(p_order, auth.uid(), 'montant_declare', p_montant::text);
end;
$$;

-- Droits
revoke all on function public.valider_code_reception(uuid, text) from public, anon;
revoke all on function public.accepter_livraison(uuid) from public, anon;
revoke all on function public.refuser_livraison(uuid, text) from public, anon;
revoke all on function public.demarrer_livraison(uuid) from public, anon;
revoke all on function public.declarer_remise(uuid, numeric) from public, anon;

grant execute on function public.valider_code_reception(uuid, text) to authenticated;
grant execute on function public.accepter_livraison(uuid) to authenticated;
grant execute on function public.refuser_livraison(uuid, text) to authenticated;
grant execute on function public.demarrer_livraison(uuid) to authenticated;
grant execute on function public.declarer_remise(uuid, numeric) to authenticated;