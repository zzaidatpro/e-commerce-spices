-- Nouveaux types de notification
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'message_client', 'message_interne', 'reponse_client', 'commande', 'nouveau_client'
  ));

-- Nouvelle commande : notifie admins et managers actifs
create or replace function public.notifier_nouvelle_commande()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (destinataire_id, type, titre, corps, lien)
  select p.id, 'commande', 'Nouvelle commande', new.total::text || ' DA',
         '/admin/orders/' || new.id::text
  from public.profiles p
  where p.role in ('admin', 'manager') and p.status = 'approved';
  return new;
end;
$$;

-- Nouveau compte client : notifie les admins
create or replace function public.notifier_nouveau_client()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'client' then
    insert into public.notifications (destinataire_id, type, titre, corps, lien)
    select p.id, 'nouveau_client', 'Nouveau compte client',
           coalesce(new.email, 'Adresse inconnue'), '/admin/clients'
    from public.profiles p
    where p.role = 'admin' and p.status = 'approved';
  end if;
  return new;
end;
$$;

revoke all on function public.notifier_nouvelle_commande() from public, anon, authenticated;
revoke all on function public.notifier_nouveau_client() from public, anon, authenticated;

drop trigger if exists orders_notifier_commande on public.orders;
create trigger orders_notifier_commande
after insert on public.orders
for each row execute function public.notifier_nouvelle_commande();

drop trigger if exists profiles_notifier_client on public.profiles;
create trigger profiles_notifier_client
after insert on public.profiles
for each row execute function public.notifier_nouveau_client();