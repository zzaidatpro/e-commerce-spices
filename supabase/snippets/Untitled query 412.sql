select reloptions from pg_class where relname = 'produits_notes';

select udt_name from information_schema.columns
where table_schema = 'public' and table_name = 'profiles' and column_name = 'status';