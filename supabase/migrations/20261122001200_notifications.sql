create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  destinataire_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('message_client', 'message_interne', 'reponse_client')),
  titre text not null,
  corps text,
  lien text,
  created_at timestamptz not null default now(),
  lu_at timestamptz
);

create index if not exists notifications_destinataire_idx
  on public.notifications (destinataire_id, lu_at, created_at desc);

alter table public.notifications enable row level security;
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;

drop policy if exists "notifications: propriétaire lit" on public.notifications;
create policy "notifications: propriétaire lit" on public.notifications
for select to authenticated
using (destinataire_id = auth.uid());

-- Message client : notifie tous les admins et managers actifs
create or replace function public.notifier_message_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auteur text;
begin
  select btrim(coalesce(p.prenom, '') || ' ' || coalesce(p.nom, ''))
  into v_auteur
  from public.profiles p
  where p.id = new.from_profile_id;

  if new.categorie = 'client' then
    insert into public.notifications (destinataire_id, type, titre, corps, lien)
    select p.id, 'message_client',
           'Nouveau message client',
           left(new.subject, 120),
           '/admin/feedback'
    from public.profiles p
    where p.role in ('admin', 'manager') and p.status = 'approved';

  elsif new.categorie = 'interne' then
    insert into public.notifications (destinataire_id, type, titre, corps, lien)
    select p.id, 'message_interne',
           'Message interne de ' || coalesce(nullif(v_auteur, ''), 'l''équipe'),
           left(new.subject, 120),
           '/admin/feedback'
    from public.profiles p
    where p.role = 'admin' and p.status = 'approved' and p.id <> new.from_profile_id;
  end if;

  return new;
end;
$$;

-- Réponse staff : notifie le client auteur du message
create or replace function public.notifier_reponse_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.categorie = 'client'
     and new.reponse is not null
     and new.reponse is distinct from old.reponse then
    insert into public.notifications (destinataire_id, type, titre, corps, lien)
    values (new.from_profile_id, 'reponse_client',
            'Réponse à votre message',
            left(new.subject, 120),
            '/dashboard');
  end if;
  return new;
end;
$$;

revoke all on function public.notifier_message_feedback() from public, anon, authenticated;
revoke all on function public.notifier_reponse_feedback() from public, anon, authenticated;

drop trigger if exists feedbacks_notifier_message on public.feedbacks;
create trigger feedbacks_notifier_message
after insert on public.feedbacks
for each row execute function public.notifier_message_feedback();

drop trigger if exists feedbacks_notifier_reponse on public.feedbacks;
create trigger feedbacks_notifier_reponse
after update of reponse on public.feedbacks
for each row execute function public.notifier_reponse_feedback();

-- Accusés de lecture : seulement via fonctions, jamais en écriture directe
create or replace function public.marquer_notification_lue(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set lu_at = now()
  where id = p_id and destinataire_id = auth.uid() and lu_at is null;
end;
$$;

create or replace function public.marquer_toutes_notifications_lues()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nb integer;
begin
  with u as (
    update public.notifications
    set lu_at = now()
    where destinataire_id = auth.uid() and lu_at is null
    returning 1
  )
  select count(*) into v_nb from u;
  return v_nb;
end;
$$;

revoke all on function public.marquer_notification_lue(uuid) from public, anon;
revoke all on function public.marquer_toutes_notifications_lues() from public, anon;
grant execute on function public.marquer_notification_lue(uuid) to authenticated;
grant execute on function public.marquer_toutes_notifications_lues() to authenticated;

-- Temps réel : ajout à la publication, idempotent
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;