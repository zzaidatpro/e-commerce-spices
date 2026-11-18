drop policy if exists "orders: livreur lit ses livraisons" on public.orders;
create policy "orders: livreur lit ses livraisons" on public.orders
for select to authenticated
using (
  public.est_livreur()
  and livreur_id = auth.uid()
  and statut = 'expédiée'
);

drop policy if exists "order_items: livreur lit ses livraisons" on public.order_items;
create policy "order_items: livreur lit ses livraisons" on public.order_items
for select to authenticated
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id
    and o.livreur_id = auth.uid()
    and o.statut = 'expédiée'
));