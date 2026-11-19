begin;
set local role anon;
select * from public.rates;
rollback;