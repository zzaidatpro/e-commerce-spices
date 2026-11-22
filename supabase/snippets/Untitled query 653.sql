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
  from public.orders where id = p_order and client_id = v_uid;

  if v_statut is null then
    return json_build_object('ok', false, 'message', 'Commande introuvable.');
  end if;
  if v_statut <> 'expédiée' then
    return json_build_object('ok', false, 'message', 'Aucune livraison en cours pour cette commande.');
  end if;

  -- Un seul délai minimum entre deux demandes : 2 heures
  select max(demande_at) into v_derniere
  from public.demandes_code where order_id = p_order;

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