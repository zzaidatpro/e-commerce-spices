create or replace function public.livreur_peut_voir_adresse(p_addr uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.orders o
    where o.adresse_liv_id = p_addr
      and o.livreur_id = auth.uid()
      and o.statut in ('payée', 'en_attente', 'expédiée', 'livrée', 'confirmée')
  );
$$;

drop policy if exists "orders: livreur lit ses livraisons" on public.orders;
create policy "orders: livreur lit ses livraisons" on public.orders
for select to authenticated
using (
  public.est_livreur()
  and livreur_id = auth.uid()
  and statut in ('payée', 'en_attente', 'expédiée', 'livrée', 'confirmée')
);

drop policy if exists "order_items: livreur lit ses livraisons" on public.order_items;
create policy "order_items: livreur lit ses livraisons" on public.order_items
for select to authenticated
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id
    and o.livreur_id = auth.uid()
    and o.statut in ('payée', 'en_attente', 'expédiée', 'livrée', 'confirmée')
));