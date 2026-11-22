-- 1. Table des demandes de nouveau code de livraison
create table if not exists public.demandes_code (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  demande_par uuid not null references public.profiles(id) on delete cascade,
  demande_at timestamptz not null default now(),
  traitee_at timestamptz
);

-- Une seule demande ouverte par commande
create unique index if not exists demandes_code_une_ouverte
  on public.demandes_code (order_id)
  where traitee_at is null;

alter table public.demandes_code enable row level security;

revoke all on public.demandes_code from anon, authenticated;
grant select on public.demandes_code to authenticated;

drop policy if exists "demandes: client lit les siennes" on public.demandes_code;
create policy "demandes: client lit les siennes"
  on public.demandes_code
  for select
  to authenticated
  using (demande_par = auth.uid());

drop policy if exists "demandes: staff lit tout" on public.demandes_code;
create policy "demandes: staff lit tout"
  on public.demandes_code
  for select
  to authenticated
  using (public.est_staff());

-- 2. Fonction RPC appelée par le client pour demander un nouveau code
create or replace function public.demander_nouveau_code(p_order uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_statut text;
  v_derniere timestamptz;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'message', 'Connexion requise.');
  end if;

  select statut::text into v_statut
  from public.orders
  where id = p_order and client_id = v_uid;

  if v_statut is null then
    return json_build_object('ok', false, 'message', 'Commande introuvable.');
  end if;

  if v_statut <> 'expédiée' then
    return json_build_object('ok', false, 'message', 'Aucune livraison en cours pour cette commande.');
  end if;

  -- Délai minimum de 2 heures entre deux demandes
  select max(demande_at) into v_derniere
  from public.demandes_code
  where order_id = p_order;

  if v_derniere is not null and v_derniere > now() - interval '2 hours' then
    return json_build_object('ok', false, 'message', 'Une demande a déjà été envoyée. Réessayez dans quelques heures.');
  end if;

  insert into public.demandes_code (order_id, demande_par)
  values (p_order, v_uid)
  on conflict do nothing;

  return json_build_object('ok', true, 'message', 'Demande envoyée. Votre livreur et le manager ont été prévenus.');
end;
$$;

revoke all on function public.demander_nouveau_code(uuid) from public, anon;
grant execute on function public.demander_nouveau_code(uuid) to authenticated;

-- 3. Mise à jour de generer_code_livraison pour marquer les demandes ouvertes comme traitées
CREATE OR REPLACE FUNCTION "public"."generer_code_livraison"("p_order" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  v_code text;
  v_o public.orders%rowtype;
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;

  select * into v_o from public.orders where id = p_order;
  if not found then raise exception 'Commande introuvable.'; end if;
  if v_o.statut not in ('en_attente', 'payée', 'expédiée') then
    raise exception 'Code impossible pour une commande %.', v_o.statut;
  end if;
  if v_o.livreur_id is null then
    raise exception 'Désignez d''abord le livreur.';
  end if;

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

  -- Marquer les demandes ouvertes de cette commande comme traitées
  update public.demandes_code
  set traitee_at = now()
  where order_id = p_order
    and traitee_at is null;

  return v_code;
end;
$$;

ALTER FUNCTION "public"."generer_code_livraison"("p_order" "uuid") OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."generer_code_livraison"("p_order" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generer_code_livraison"("p_order" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generer_code_livraison"("p_order" "uuid") TO "service_role";