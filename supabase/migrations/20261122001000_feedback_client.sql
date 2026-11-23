-- Colonnes : catégorie, réponse, dates de réponse et de lecture
alter table public.feedbacks
  add column if not exists categorie text not null default 'interne'
    check (categorie in ('interne', 'client')),
  add column if not exists reponse text
    check (char_length(reponse) <= 2000),
  add column if not exists reponse_par uuid references public.profiles(id) on delete set null,
  add column if not exists reponse_at timestamptz,
  add column if not exists reponse_lue_at timestamptz;

-- Politiques d'écriture : insertion interne directe, plus aucune mise à jour directe
drop policy if exists "feedback: staff envoie" on public.feedbacks;
drop policy if exists "feedback: staff envoie en interne" on public.feedbacks;
create policy "feedback: staff envoie en interne" on public.feedbacks
for insert to authenticated
with check (from_profile_id = auth.uid() and public.est_staff() and categorie = 'interne');

drop policy if exists "feedback: admin marque lu" on public.feedbacks;
revoke update on public.feedbacks from authenticated;

-- Politiques de lecture
drop policy if exists "feedback: admin lit tout" on public.feedbacks;
create policy "feedback: admin lit tout" on public.feedbacks
for select to authenticated
using (public.est_admin());

drop policy if exists "feedback: manager lit clients et siens" on public.feedbacks;
create policy "feedback: manager lit clients et siens" on public.feedbacks
for select to authenticated
using (public.est_staff() and (categorie = 'client' or from_profile_id = auth.uid()));

drop policy if exists "feedback: auteur lit les siens" on public.feedbacks;
create policy "feedback: auteur lit les siens" on public.feedbacks
for select to authenticated
using (from_profile_id = auth.uid());

-- Client : envoi d'un message
create or replace function public.envoyer_feedback_client(p_sujet text, p_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'client' and p.status = 'approved'
  ) then
    raise exception 'Accès réservé aux clients.';
  end if;

  if char_length(btrim(coalesce(p_sujet, ''))) < 3
     or char_length(btrim(coalesce(p_message, ''))) < 10 then
    raise exception 'Sujet (3 caractères) et message (10 caractères) requis.';
  end if;

  insert into public.feedbacks (from_profile_id, subject, message, categorie)
  values (auth.uid(), btrim(p_sujet), btrim(p_message), 'client')
  returning id into v_id;

  return v_id;
end;
$$;

-- Staff : réponse à un message client
create or replace function public.repondre_feedback(p_id uuid, p_reponse text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  if char_length(btrim(coalesce(p_reponse, ''))) < 5 then
    raise exception 'Réponse trop courte (5 caractères minimum).';
  end if;

  update public.feedbacks
  set reponse = btrim(p_reponse),
      reponse_par = auth.uid(),
      reponse_at = now(),
      reponse_lue_at = null,
      status = 'read'
  where id = p_id and categorie = 'client';

  if not found then
    raise exception 'Message introuvable.';
  end if;
end;
$$;

-- Staff : marquer lu (manager : messages clients ; admin : tout)
create or replace function public.marquer_feedback_lu(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  update public.feedbacks f
  set status = 'read'
  where f.id = p_id
    and (f.categorie = 'client' or public.est_admin());

  if not found then
    raise exception 'Message introuvable ou non autorisé.';
  end if;
end;
$$;

-- Client : accusé de lecture d'une réponse
create or replace function public.marquer_reponse_lue(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.feedbacks
  set reponse_lue_at = now()
  where id = p_id
    and from_profile_id = auth.uid()
    and reponse is not null
    and reponse_lue_at is null;

  if not found then
    raise exception 'Réponse introuvable ou déjà lue.';
  end if;
end;
$$;

revoke all on function public.envoyer_feedback_client(text, text) from public, anon;
revoke all on function public.repondre_feedback(uuid, text) from public, anon;
revoke all on function public.marquer_feedback_lu(uuid) from public, anon;
revoke all on function public.marquer_reponse_lue(uuid) from public, anon;

grant execute on function public.envoyer_feedback_client(text, text) to authenticated;
grant execute on function public.repondre_feedback(uuid, text) to authenticated;
grant execute on function public.marquer_feedback_lu(uuid) to authenticated;
grant execute on function public.marquer_reponse_lue(uuid) to authenticated;