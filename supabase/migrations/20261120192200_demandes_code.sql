-- 1. Table des demandes de nouveau code
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

-- 2. Fonction RPC appelée par le client
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