alter table public.orders
  add column if not exists designe_at timestamptz,
  add column if not exists code_envoye_at timestamptz,
  add column if not exists code_recu_at timestamptz,
  add column if not exists acceptee_at timestamptz,
  add column if not exists montant_declare numeric(10,2),
  add column if not exists montant_declare_at timestamptz,
  add column if not exists terminee_at timestamptz;

alter table public.orders drop constraint if exists orders_montant_declare_positif;
alter table public.orders
  add constraint orders_montant_declare_positif
  check (montant_declare is null or montant_declare >= 0);

create table if not exists public.livraisons_historique (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  livreur_id uuid references public.profiles(id) on delete set null,
  evenement text not null check (evenement in (
    'designe', 'code_envoye', 'code_recu', 'accepte', 'refuse', 'reassigne',
    'demarre', 'remis', 'montant_declare', 'confirme_client',
    'confirme_manager', 'terminee', 'annulee'
  )),
  auteur uuid references public.profiles(id) on delete set null,
  at timestamptz not null default now(),
  detail text
);

create index if not exists livraisons_historique_order_idx
  on public.livraisons_historique (order_id, at);

alter table public.livraisons_historique enable row level security;
revoke all on public.livraisons_historique from anon, authenticated;
grant select on public.livraisons_historique to authenticated;

drop policy if exists "historique: staff lit tout" on public.livraisons_historique;
create policy "historique: staff lit tout" on public.livraisons_historique
for select to authenticated
using (public.est_staff());

drop policy if exists "historique: livreur lit ses lignes" on public.livraisons_historique;
create policy "historique: livreur lit ses lignes" on public.livraisons_historique
for select to authenticated
using (public.est_livreur() and livreur_id = auth.uid());