-- 1. Anciennes fonctions remplacées par le nouveau flux
drop function if exists public.expedier_commande(uuid, uuid);
drop function if exists public.enregistrer_encaissement(uuid, text, numeric);

-- 2. Déclaration du montant : tant que la vente n'est pas confirmée
create or replace function public.declarer_remise(p_order uuid, p_montant numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric;
begin
  if not public.est_livreur() then raise exception 'Accès réservé aux livreurs.'; end if;

  select total into v_total from public.orders
  where id = p_order and livreur_id = auth.uid() and statut in ('expédiée', 'livrée');

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

-- 3. Démarrage : pose expediee_at (utilisé par les relances et le calendrier)
create or replace function public.demarrer_livraison(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.est_livreur() then raise exception 'Accès réservé aux livreurs.'; end if;

  perform set_config('app.flux', 'expédiée', true);

  update public.orders
  set statut = 'expédiée', expediee_at = now()
  where id = p_order
    and livreur_id = auth.uid()
    and acceptee_at is not null
    and statut in ('payée', 'en_attente');

  if not found then raise exception 'Démarrage impossible : livraison non acceptée.'; end if;

  perform public.journaliser_livraison(p_order, auth.uid(), 'demarre');
end;
$$;

-- 4. Remise par le client : code validé, livraison acceptée
create or replace function public.confirmer_livraison(p_order uuid, p_code text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_o public.orders%rowtype;
  v_row public.codes_livraison;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'message', 'Connexion requise.');
  end if;

  select * into v_o from public.orders where id = p_order and client_id = v_uid;
  if not found then
    return json_build_object('ok', false, 'message', 'Commande introuvable.');
  end if;
  if v_o.statut <> 'expédiée' or v_o.acceptee_at is null then
    return json_build_object('ok', false, 'message', 'Cette commande n''est pas en cours de livraison.');
  end if;

  select * into v_row from public.codes_livraison where order_id = p_order;
  if not found or v_row.used_at is not null or v_row.expires_at < now() then
    return json_build_object('ok', false, 'message', 'Aucun code valide. Demandez-en un nouveau.');
  end if;
  if v_row.tentatives >= 5 then
    return json_build_object('ok', false, 'message', 'Trop de tentatives. Demandez un nouveau code.');
  end if;

  if extensions.crypt(p_code, v_row.code_hash) <> v_row.code_hash then
    update public.codes_livraison set tentatives = tentatives + 1 where order_id = p_order;
    return json_build_object('ok', false, 'message', 'Code incorrect.');
  end if;

  update public.codes_livraison set used_at = now() where order_id = p_order;

  perform set_config('app.flux', 'livrée', true);
  update public.orders set statut = 'livrée', remise_at = now() where id = p_order;

  perform public.journaliser_livraison(p_order, v_o.livreur_id, 'confirme_client');

  return json_build_object('ok', true, 'message', 'Remise confirmée. Merci pour votre commande !');
end;
$$;

-- 5. Confirmation de la vente par le manager : les deux conditions doivent être réunies
create or replace function public.confirmer_vente(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_o public.orders%rowtype;
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;

  select * into v_o from public.orders where id = p_order for update;
  if not found then raise exception 'Commande introuvable.'; end if;

  if v_o.statut <> 'livrée' or v_o.remise_at is null then
    raise exception 'Confirmation impossible : le client n''a pas validé la remise (statut : %).', v_o.statut;
  end if;
  if v_o.montant_declare is null then
    raise exception 'Confirmation impossible : le livreur n''a pas déclaré le montant.';
  end if;
  if v_o.montant_declare <> v_o.total then
    raise exception 'Confirmation impossible : montant déclaré (% DA) différent du total (% DA).',
      v_o.montant_declare, v_o.total;
  end if;

  perform set_config('app.flux', 'confirmée', true);

  update public.orders
  set statut = 'confirmée',
      vente_confirmee_at = now(),
      encaissement_montant = v_o.montant_declare,
      encaissement_livreur_id = v_o.livreur_id,
      encaissement_par = auth.uid(),
      encaissement_at = now(),
      terminee_at = now()
  where id = p_order;

  perform public.journaliser_livraison(p_order, v_o.livreur_id, 'confirme_manager');
  perform public.journaliser_livraison(p_order, v_o.livreur_id, 'terminee');
end;
$$;

-- 6. Trigger : statuts de flux réservés aux fonctions, champs de flux protégés
create or replace function public.proteger_commande()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_flux text := coalesce(nullif(current_setting('app.flux', true), ''), '');
begin
  -- Clients et livreurs : passent par les fonctions dédiées (la RLS bloque l'écriture directe)
  if auth.uid() is null or not public.est_staff() then
    return new;
  end if;

  if new.client_id is distinct from old.client_id
     or new.adresse_liv_id is distinct from old.adresse_liv_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Adresse et client de la commande ne peuvent pas être modifiés.';
  end if;

  if v_flux = '' and (
       new.code_recu_at is distinct from old.code_recu_at
    or new.acceptee_at is distinct from old.acceptee_at
    or new.montant_declare is distinct from old.montant_declare
    or new.montant_declare_at is distinct from old.montant_declare_at
    or new.remise_at is distinct from old.remise_at
    or new.vente_confirmee_at is distinct from old.vente_confirmee_at
    or new.terminee_at is distinct from old.terminee_at
    or new.encaissement_montant is distinct from old.encaissement_montant
    or new.encaissement_livreur_id is distinct from old.encaissement_livreur_id
    or new.encaissement_par is distinct from old.encaissement_par
    or new.encaissement_at is distinct from old.encaissement_at
    or new.expediee_at is distinct from old.expediee_at
  ) then
    raise exception 'Ces champs sont renseignés par le flux de livraison uniquement.';
  end if;

  -- Réassignation du livreur : possible seulement avant acceptation
  if new.livreur_id is distinct from old.livreur_id
     and (old.statut not in ('en_attente', 'payée') or old.acceptee_at is not null) then
    raise exception 'Le livreur ne peut plus être modifié (livraison acceptée ou démarrée).';
  end if;

  if new.statut is distinct from old.statut then
    if new.statut::text in ('expédiée', 'livrée', 'confirmée', 'remboursée')
       and v_flux <> new.statut::text then
      raise exception 'Ce statut est posé par le flux de livraison ou d''encaissement.';
    end if;

    if v_flux = '' then
      if not (
        (old.statut = 'en_attente' and new.statut::text in ('payée', 'annulée'))
        or (old.statut = 'payée' and new.statut::text = 'annulée')
      ) then
        raise exception 'Passage de % à % non autorisé.', old.statut, new.statut;
      end if;
    elsif (v_flux = 'expédiée' and old.statut not in ('en_attente', 'payée'))
       or (v_flux = 'livrée' and old.statut <> 'expédiée')
       or (v_flux = 'confirmée' and old.statut <> 'livrée')
       or (v_flux = 'remboursée' and old.statut <> 'confirmée') then
      raise exception 'Transition % → % impossible par ce flux.', old.statut, new.statut;
    end if;
  end if;

  -- Remise : admin seul, avant remise du colis
  if new.remise is distinct from old.remise or new.total is distinct from old.total then
    if not public.est_admin() then
      raise exception 'Seul un administrateur peut appliquer une remise.';
    end if;
    if old.statut in ('livrée', 'confirmée', 'remboursée', 'annulée') then
      raise exception 'Remise impossible une fois le colis remis.';
    end if;
    if new.remise > old.total + old.remise then
      raise exception 'La remise ne peut pas dépasser le montant de la commande.';
    end if;
    new.total := old.total + old.remise - new.remise;
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_commande on public.orders;
create trigger proteger_commande
before update on public.orders
for each row execute function public.proteger_commande();

-- 7. Droits
revoke all on function public.confirmer_vente(uuid) from public, anon;
grant execute on function public.confirmer_vente(uuid) to authenticated;