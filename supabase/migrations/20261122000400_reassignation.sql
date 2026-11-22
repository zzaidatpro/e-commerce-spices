-- 1. Helper : crée un nouveau code et invalide l'ancien
create or replace function public.nouveau_code_livraison(p_order uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code text;
begin
  v_code := lpad((abs(('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');

  insert into public.codes_livraison (order_id, code_hash, expires_at, used_at, tentatives, envoye_au_livreur_at)
  values (p_order, extensions.crypt(v_code, extensions.gen_salt('bf')), now() + interval '48 hours', null, 0, null)
  on conflict (order_id) do update
    set code_hash = excluded.code_hash,
        expires_at = excluded.expires_at,
        used_at = null,
        tentatives = 0,
        created_at = now(),
        envoye_au_livreur_at = null;

  return v_code;
end;
$$;

revoke all on function public.nouveau_code_livraison(uuid) from public, anon, authenticated;

-- 2. Désignation : livreur unique, nouveau code généré
drop function if exists public.designer_livreur(uuid, uuid);

create or replace function public.designer_livreur(p_order uuid, p_livreur uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_o public.orders%rowtype;
  v_code text;
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_livreur and p.role = 'livreur' and p.status = 'approved'
  ) then
    raise exception 'Livreur invalide ou non approuvé.';
  end if;

  select * into v_o from public.orders where id = p_order for update;
  if not found then raise exception 'Commande introuvable.'; end if;
  if v_o.statut not in ('en_attente', 'payée') then
    raise exception 'Désignation impossible : commande %.', v_o.statut;
  end if;
  if v_o.livreur_id is not null then
    raise exception 'Un livreur est déjà désigné : utilisez la réassignation.';
  end if;

  perform set_config('app.flux', 'reassignation', true);
  update public.orders
  set livreur_id = p_livreur, designe_at = now(), code_recu_at = null, code_envoye_at = null
  where id = p_order;

  v_code := public.nouveau_code_livraison(p_order);
  perform public.journaliser_livraison(p_order, p_livreur, 'designe');
  return v_code;
end;
$$;

revoke all on function public.designer_livreur(uuid, uuid) from public, anon;
grant execute on function public.designer_livreur(uuid, uuid) to authenticated;

-- 3. Envoi du code : horodate aussi la commande
create or replace function public.marquer_code_envoye(p_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;

  update public.codes_livraison c
  set envoye_au_livreur_at = now()
  where c.order_id = p_order and c.used_at is null and c.expires_at > now();

  if not found then raise exception 'Aucun code valide : générez-le d''abord.'; end if;

  update public.orders set code_envoye_at = now() where id = p_order;
  perform public.journaliser_livraison(
    p_order, (select livreur_id from public.orders where id = p_order), 'code_envoye'
  );
end;
$$;

revoke all on function public.marquer_code_envoye(uuid) from public, anon;
grant execute on function public.marquer_code_envoye(uuid) to authenticated;

-- 4. Refus : invalide le code remis au livreur refusant
create or replace function public.refuser_livraison(p_order uuid, p_motif text)
returns void
language plpgsql
security definer
set search_path = public
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

  update public.orders
  set livreur_id = null, code_recu_at = null, code_envoye_at = null
  where id = p_order;

  update public.codes_livraison set expires_at = now() where order_id = p_order;

  perform public.journaliser_livraison(p_order, v_livreur, 'refuse', btrim(p_motif));
end;
$$;

-- 5. Réassignation : après 1 h sans acceptation, ou après un refus (livreur_id nul)
create or replace function public.reassigner_livreur(p_order uuid, p_nouveau uuid, p_motif text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_o public.orders%rowtype;
  v_code text;
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;
  if char_length(btrim(coalesce(p_motif, ''))) < 5 then
    raise exception 'Motif requis (5 caractères minimum).';
  end if;

  select * into v_o from public.orders where id = p_order for update;
  if not found then raise exception 'Commande introuvable.'; end if;

  if v_o.statut not in ('en_attente', 'payée') or v_o.acceptee_at is not null then
    raise exception 'Réassignation impossible : livraison déjà acceptée ou démarrée.';
  end if;
  if v_o.livreur_id is null then
    raise exception 'Aucun livreur à remplacer : utilisez la désignation.';
  end if;
  if v_o.designe_at is not null and v_o.designe_at > now() - interval '1 hour' then
    raise exception 'Réassignation possible une heure après la désignation, ou après un refus du livreur.';
  end if;
  if p_nouveau = v_o.livreur_id then
    raise exception 'Ce livreur est déjà désigné.';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = p_nouveau and p.role = 'livreur' and p.status = 'approved'
  ) then
    raise exception 'Livreur invalide ou non approuvé.';
  end if;

  -- Ancien livreur : annulation tracée
  perform public.journaliser_livraison(p_order, v_o.livreur_id, 'annulee', btrim(p_motif));

  perform set_config('app.flux', 'reassignation', true);
  update public.orders
  set livreur_id = p_nouveau, designe_at = now(), code_recu_at = null, code_envoye_at = null
  where id = p_order;

  v_code := public.nouveau_code_livraison(p_order);
  perform public.journaliser_livraison(p_order, p_nouveau, 'reassigne', btrim(p_motif));
  return v_code;
end;
$$;

revoke all on function public.reassigner_livreur(uuid, uuid, text) from public, anon;
grant execute on function public.reassigner_livreur(uuid, uuid, text) to authenticated;