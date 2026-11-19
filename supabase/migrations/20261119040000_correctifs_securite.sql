-- 1. produits_notes : agrégats publics, security definer volontaire
alter view if exists public.produits_notes reset (security_invoker);
revoke all on public.produits_notes from anon, authenticated;
grant select on public.produits_notes to anon, authenticated;

-- 2. Accès du livreur à l'adresse de sa livraison (fonction manquante en production et en local)
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
      and o.statut = 'expédiée'
  );
$$;

revoke all on function public.livreur_peut_voir_adresse(uuid) from public, anon;
grant execute on function public.livreur_peut_voir_adresse(uuid) to authenticated;

-- 3. Politique adresses : une seule version, celle décidée
drop policy if exists "Les admins et livreurs voient toutes les adresses" on public.adresses_livraison;
drop policy if exists "adresses: staff et livreur lisent" on public.adresses_livraison;
drop policy if exists "adresses: staff lit" on public.adresses_livraison;
drop policy if exists "adresses: staff et livreur de la livraison" on public.adresses_livraison;

create policy "adresses: staff et livreur de la livraison" on public.adresses_livraison
for select to authenticated
using (
  public.est_staff()
  or (public.est_livreur() and public.livreur_peut_voir_adresse(id))
);

-- 4. Commandes et lignes : le livreur ne voit que ses livraisons en cours
drop policy if exists "orders: livreur lit les commandes a livrer" on public.orders;
drop policy if exists "orders: livreur lit ses livraisons" on public.orders;

create policy "orders: livreur lit ses livraisons" on public.orders
for select to authenticated
using (public.est_livreur() and livreur_id = auth.uid() and statut = 'expédiée');

drop policy if exists "order_items: livreur lit les lignes a livrer" on public.order_items;
drop policy if exists "order_items: livreur lit ses livraisons" on public.order_items;

create policy "order_items: livreur lit ses livraisons" on public.order_items
for select to authenticated
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id
    and o.livreur_id = auth.uid()
    and o.statut = 'expédiée'
));

-- 5. profiles.status : conversion en enum (idempotente)
drop policy if exists "profil: modification de soi sans rôle ni statut" on public.profiles;
alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles alter column status drop default;
alter table public.profiles
  alter column status type public.statut_profil
  using status::public.statut_profil;
alter table public.profiles
  alter column status set default 'pending'::public.statut_profil;

create policy "profil: modification de soi sans rôle ni statut" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role::text = public.mon_role()
  and status = public.mon_statut()::public.statut_profil
);