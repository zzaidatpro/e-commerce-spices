begin;
set local role anon;
select current_user, session_user;
select count(*) from public.rates;
rollback;