begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "4ba18d06-30b0-4142-b4ab-ac77ecc32898", "role": "authenticated"}', true);

select
  auth.uid() as uid_vu,
  public.est_staff() as est_staff,
  (select role from public.profiles where id = auth.uid()) as role_vu,
  (select status from public.profiles where id = auth.uid()) as status_vu;

rollback;