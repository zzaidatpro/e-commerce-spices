select enumlabel from pg_enum
where enumtypid = 'public.type_role'::regtype
order by enumsortorder;