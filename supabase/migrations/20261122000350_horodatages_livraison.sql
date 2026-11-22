alter table public.orders
  add column if not exists designe_at timestamptz,
  add column if not exists code_envoye_at timestamptz,
  add column if not exists code_recu_at timestamptz,
  add column if not exists acceptee_at timestamptz,
  add column if not exists demarree_at timestamptz;