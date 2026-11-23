drop policy if exists "Seuls les admins modifient les produits" on public.produits;
drop policy if exists "produits: admin insere" on public.produits;
drop policy if exists "produits: admin modifie" on public.produits;
drop policy if exists "produits: admin supprime" on public.produits;
drop policy if exists "produits: staff insere" on public.produits;
drop policy if exists "produits: staff modifie" on public.produits;

create policy "produits: staff insere" on public.produits
for insert to authenticated
with check (public.est_staff());

create policy "produits: staff modifie" on public.produits
for update to authenticated
using (public.est_staff())
with check (public.est_staff());

create policy "produits: admin supprime" on public.produits
for delete to authenticated
using (public.est_admin());