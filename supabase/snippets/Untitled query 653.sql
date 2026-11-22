select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'orders'
  and column_name in ('designe_at','code_envoye_at','code_recu_at','acceptee_at','demarree_at');