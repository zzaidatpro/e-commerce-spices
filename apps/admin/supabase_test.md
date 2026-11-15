Les codes de livraison sont stockés sous forme de hash dans une table inaccessible aux utilisateurs : le client ne peut donc pas voir le code et confirmer seul sa livraison.

- Règles appliquées
|Acteur	|Statut	|Remise	|Adresse et client	|Code de livraison
|Manager	|libre	|non	|non	|génère le code, le remet au livreur
|Admin	|libre	|oui	|non	|oui
|Client	|non	|non	|non	|saisit le code sur son dashboard
|Livreur	|hors admin	|non	|non	|reçoit le code du manager

Le client confirme la livraison : la commande passe à livrée. Le code expire au bout de 48 h, et il est bloqué après 5 erreurs.

0. Vérification préalable
sql
select extname from pg_extension where extname = 'pgcrypto';
select 1 from information_schema.schemata where schema_name = 'extensions';

Si pgcrypto n’apparaît pas, activez-le depuis Database > Extensions. Le SQL utilise le schéma extensions, où Supabase l’installe par défaut.

1. Colonne de remise
sql
alter table public.orders
  add column if not exists remise numeric(10,2) not null default 0 check (remise >= 0);

grant update (statut, remise) on public.orders to authenticated;
2. Table des codes (inaccessible directement)
sql
create table if not exists public.codes_livraison (
  order_id uuid primary key references public.orders(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  tentatives int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.codes_livraison enable row level security;
revoke all on public.codes_livraison from anon, authenticated;
-- Aucune politique : seules les fonctions security definer y accèdent
3. Trigger de protection mis à jour

Il remplace celui de l’étape précédente. Le client n’est pas concerné (ce n’est pas un staff) : le trigger le laisse passer, la RLS et les droits limitent déjà ses actions.

sql
create or replace function public.proteger_commande()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or not public.est_staff() then
    return new;
  end if;

  -- Ni admin ni manager ne touchent à l'identité ni à l'adresse
  if new.id is distinct from old.id
     or new.client_id is distinct from old.client_id
     or new.adresse_liv_id is distinct from old.adresse_liv_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Adresse et client de la commande ne peuvent pas être modifiés.';
  end if;

  if public.est_admin() then
    if new.remise > old.total + old.remise then
      raise exception 'La remise ne peut pas dépasser le montant de la commande.';
    end if;
    -- Le total se recalcule à partir de la remise, jamais saisi directement
    new.total := old.total + old.remise - new.remise;
    return new;
  end if;

  -- Manager : seul le statut peut changer
  if new.remise is distinct from old.remise or new.total is distinct from old.total then
    raise exception 'Seul un administrateur peut appliquer une remise.';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_commande on public.orders;
create trigger proteger_commande
before update on public.orders
for each row execute function public.proteger_commande();
4. Génération du code (manager et admin)
sql
create or replace function public.generer_code_livraison(p_order uuid)
returns text
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_code text;
  v_statut text;
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  select statut::text into v_statut from public.orders where id = p_order;
  if not found then
    raise exception 'Commande introuvable.';
  end if;
  if v_statut not in ('payée', 'expédiée') then
    raise exception 'Un code ne peut être généré que pour une commande payée ou expédiée.';
  end if;

  v_code := lpad(
    (abs(('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text,
    6, '0'
  );

  insert into public.codes_livraison (order_id, code_hash, expires_at, used_at, tentatives)
  values (p_order, extensions.crypt(v_code, extensions.gen_salt('bf')), now() + interval '48 hours', null, 0)
  on conflict (order_id) do update
    set code_hash = excluded.code_hash,
        expires_at = excluded.expires_at,
        used_at = null,
        tentatives = 0,
        created_at = now();

  return v_code;
end;
$$;

revoke all on function public.generer_code_livraison(uuid) from public, anon;
grant execute on function public.generer_code_livraison(uuid) to authenticated;

Le code n’est affiché qu’une fois, au moment de la génération. Régénérer invalide le précédent.

5. Confirmation par le client
sql
create or replace function public.confirmer_livraison(p_order uuid, p_code text)
returns json
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.codes_livraison;
  v_statut text;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'message', 'Connexion requise.');
  end if;

  select statut::text into v_statut
  from public.orders
  where id = p_order and client_id = v_uid;

  if v_statut is null then
    return json_build_object('ok', false, 'message', 'Commande introuvable.');
  end if;
  if v_statut <> 'expédiée' then
    return json_build_object('ok', false, 'message', 'Cette commande n''est pas en cours de livraison.');
  end if;

  select * into v_row from public.codes_livraison where order_id = p_order;
  if not found or v_row.used_at is not null or v_row.expires_at < now() then
    return json_build_object('ok', false, 'message', 'Aucun code valide. Demandez un nouveau code.');
  end if;
  if v_row.tentatives >= 5 then
    return json_build_object('ok', false, 'message', 'Trop de tentatives. Demandez un nouveau code.');
  end if;

  -- Le compteur doit être enregistré : on retourne le résultat au lieu de lever une exception
  if extensions.crypt(p_code, v_row.code_hash) <> v_row.code_hash then
    update public.codes_livraison set tentatives = tentatives + 1 where order_id = p_order;
    return json_build_object('ok', false, 'message', 'Code incorrect.');
  end if;

  update public.codes_livraison set used_at = now() where order_id = p_order;
  update public.orders set statut = 'livrée' where id = p_order;

  return json_build_object('ok', true, 'message', 'Livraison confirmée. Merci pour votre commande !');
end;
$$;

revoke all on function public.confirmer_livraison(uuid, text) from public, anon;
grant execute on function public.confirmer_livraison(uuid, text) to authenticated;

Une exception aurait annulé le compteur d’essais : c’est pour cela que la fonction retourne un message au lieu de lever une erreur.

6. Utilisation dans l’application

Manager, bouton « Générer le code » sur la commande :

ts
const { data, error } = await supabase.rpc('generer_code_livraison', { p_order: orderId });
// data = le code à 6 chiffres, à transmettre au livreur (affiché une seule fois)

Admin, appliquer une remise (aucun calcul côté application) :

ts
await supabase.from('orders').update({ remise: montant }).eq('id', orderId);
// Le trigger recalcule total ; l'adresse n'est pas modifiable

Client, sur le dashboard :

ts
'use server';

import { createClient } from '@repo/database/server';
import { revalidatePath } from 'next/cache';

export async function confirmerLivraisonAction(orderId: string, code: string) {
  if (!/^\d{6}$/.test(code)) return { ok: false, message: 'Le code comporte 6 chiffres.' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('confirmer_livraison', { p_order: orderId, p_code: code });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/orders');
  return data as { ok: boolean; message: string };
}
7. Tests

Chaque bloc se termine par rollback.

Test A : le manager ne peut pas changer la remise (doit échouer)

sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_MANAGER", "role": "authenticated"}', true);
update public.orders set remise = 10 where id = 'ID_COMMANDE';
rollback;

Attendu : Seul un administrateur peut appliquer une remise.

Test B : l’admin applique une remise (total recalculé)

sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_ADMIN", "role": "authenticated"}', true);
update public.orders set remise = 100 where id = 'ID_COMMANDE' returning total, remise;
rollback;

Attendu : total diminue de 100 par rapport à sa valeur précédente.

Test C : l’admin ne peut pas changer l’adresse (doit échouer)

sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_ADMIN", "role": "authenticated"}', true);
update public.orders set adresse_liv_id = null where id = 'ID_COMMANDE';
rollback;

Attendu : Adresse et client de la commande ne peuvent pas être modifiés. (ou permission denied si adresse_liv_id n’est pas accordé).

Test D : parcours complet de livraison (commande en statut expédiée)

sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_MANAGER", "role": "authenticated"}', true);
select public.generer_code_livraison('ID_COMMANDE') as code;

select set_config('request.jwt.claims', '{"sub": "ID_CLIENT", "role": "authenticated"}', true);
select public.confirmer_livraison('ID_COMMANDE', '000000');   -- faux : Code incorrect
select public.confirmer_livraison('ID_COMMANDE', 'CODE_AFFICHE'); -- juste : ok
select statut from public.orders where id = 'ID_COMMANDE';
rollback;

Attendu : premier appel Code incorrect., second ok: true, statut livrée.

Test E : le code n’est pas lisible directement

sql
begin;
set local role authenticated;
select * from public.codes_livraison;
rollback;

Attendu : permission denied for table codes_livraison.

8. Annulation
sql
drop function if exists public.confirmer_livraison(uuid, text);
drop function if exists public.generer_code_livraison(uuid);
drop table if exists public.codes_livraison;
alter table public.orders drop column if exists remise;

Le trigger précédent (proteger_commande de l’étape 1) reste valide si vous ne voulez pas revenir en arrière sur la protection.

Points à trancher
Livrée par le manager : avec un changement libre du statut, le manager peut marquer une commande livrée sans code. Je recommande de réserver ce statut à la confirmation par le client, et de limiter le manager aux autres statuts. Dites-moi si je l’ajoute au trigger.
Expiration : 48 h. Confirmez-vous cette durée ?
Relance : si le client ne confirme pas, faut-il une alerte au manager après un délai ? Ce n’est pas inclus ici.
réserver ce statut à la confirmation par le client 2. oui 3. oui

Voici les règles appliquées : le statut livrée ne peut être posé que par la confirmation du client, et une relance est signalée au manager après 24 h d’expédition sans livraison. Pour mesurer ce délai, il faut connaître la date d’expédition, qui n’est pas enregistrée aujourd’hui. Le SQL l’ajoute.

1. Date d’expédition et protection du statut livrée

Ce bloc remplace proteger_commande et le rend idempotent.

sql
-- Horodatage de l'expédition
alter table public.orders add column if not exists expediee_at timestamptz;

create or replace function public.proteger_commande()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- Appels sans session (service_role, fonctions de confirmation) et clients : pas de restriction ici
  if auth.uid() is null or not public.est_staff() then
    return new;
  end if;

  -- Identité et adresse : jamais modifiables par le staff
  if new.id is distinct from old.id
     or new.client_id is distinct from old.client_id
     or new.adresse_liv_id is distinct from old.adresse_liv_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Adresse et client de la commande ne peuvent pas être modifiés.';
  end if;

  -- Livrée : réservé à la confirmation du client (fonction confirmer_livraison).
  -- Un statut livrée ne peut plus être changé par le staff.
  if new.statut = 'livrée' and old.statut is distinct from 'livrée' then
    raise exception 'Le statut livrée est confirmé par le client avec le code de livraison.';
  end if;
  if old.statut = 'livrée' and new.statut is distinct from old.statut then
    raise exception 'Une commande livrée ne peut plus changer de statut.';
  end if;

  -- Date d'expédition, posée automatiquement
  if new.statut = 'expédiée' and old.statut is distinct from 'expédiée' then
    new.expediee_at := now();
  end if;

  if public.est_admin() then
    if new.remise > old.total + old.remise then
      raise exception 'La remise ne peut pas dépasser le montant de la commande.';
    end if;
    new.total := old.total + old.remise - new.remise;
    return new;
  end if;

  -- Manager : statut libre, aucune remise
  if new.remise is distinct from old.remise or new.total is distinct from old.total then
    raise exception 'Seul un administrateur peut appliquer une remise.';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_commande on public.orders;
create trigger proteger_commande
before update on public.orders
for each row execute function public.proteger_commande();

Le client n’est pas concerné par ces contrôles. Sa confirmation passe par confirmer_livraison, qui s’exécute avec la session du client : est_staff() est faux, donc le trigger le laisse passer.

La règle « une commande livrée ne change plus » est une décision de ma part. Elle évite qu’un manager remette une commande livrée en expédiée, ce qui permettrait de générer un nouveau code. Si vous voulez qu’elle reste modifiable, supprimez le second if de ce bloc.

2. Délai de relance paramétrable
sql
insert into public.parametres_site (cle, valeur, libelle) values
  ('delai_relance_livraison_heures', '24'::jsonb, 'Délai avant relance du manager (heures après expédition)')
on conflict (cle) do nothing;

L’admin modifie ce délai depuis la page Paramètres, comme les autres réglages.

3. Fonction de relance (staff)
sql
create or replace function public.commandes_a_relancer()
returns table (
  order_id uuid,
  client_nom text,
  client_prenom text,
  client_telephone text,
  total numeric,
  expediee_depuis interval,
  code_expire_at timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_delai int;
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  select (valeur #>> '{}')::int into v_delai
  from public.parametres_site
  where cle = 'delai_relance_livraison_heures';

  return query
  select
    o.id,
    p.nom,
    p.prenom,
    p.telephone,
    o.total,
    now() - o.expediee_at,
    c.expires_at
  from public.orders o
  join public.profiles p on p.id = o.client_id
  left join public.codes_livraison c on c.order_id = o.id
  where o.statut = 'expédiée'
    and o.expediee_at < now() - make_interval(hours => coalesce(v_delai, 24))
  order by o.expediee_at asc;
end;
$$;

revoke all on function public.commandes_a_relancer() from public, anon;
grant execute on function public.commandes_a_relancer() to authenticated;

La fonction lit profiles avec les droits de son propriétaire, parce que le manager n’a pas accès à cette table. Elle lui donne donc le nom et le téléphone du client, nécessaires pour le joindre. Si vous ne voulez pas que le manager voie le téléphone, retirez p.telephone de la fonction.

4. Utilisation dans l’application

Sur le tableau de bord admin, côté serveur :

ts
const { data: relances } = await supabase.rpc('commandes_a_relancer');
// Afficher : client, téléphone, total, depuis combien de temps, code expiré ou non

Le manager peut régénérer le code depuis cette liste avec generer_code_livraison (il n’est pas bloqué par la règle précédente, car il ne touche pas au statut).

5. Tests

Chaque bloc se termine par rollback.

Test A : le manager ne peut pas poser livrée

sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_MANAGER", "role": "authenticated"}', true);
update public.orders set statut = 'livrée' where id = 'ID_COMMANDE';
rollback;

Attendu : Le statut livrée est confirmé par le client avec le code de livraison.

Test B : le manager change librement vers expédiée (date posée)

sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_MANAGER", "role": "authenticated"}', true);
update public.orders set statut = 'expédiée' where id = 'ID_COMMANDE' returning statut, expediee_at;
rollback;

Attendu : UPDATE 1, expediee_at renseigné.

Test C : parcours complet du client (inchangé)

Reprenez le test D de l’étape précédente. Attendu : ok: true, statut livrée.

Test D : relance (simulation de retard)

sql
begin;
update public.orders set statut = 'expédiée', expediee_at = now() - interval '30 hours'
where id = 'ID_COMMANDE';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_MANAGER", "role": "authenticated"}', true);
select * from public.commandes_a_relancer();
rollback;

Le premier update s’exécute sans session (superutilisateur), donc le trigger le laisse passer. Attendu : une ligne pour la commande.

Test E : une commande livrée n’apparaît plus

Même test, en mettant statut = 'livrée' au lieu de expédiée : aucune ligne.

6. Annulation
sql
drop function if exists public.commandes_a_relancer();
delete from public.parametres_site where cle = 'delai_relance_livraison_heures';
alter table public.orders drop column if exists expediee_at;

Pour revenir à la version précédente du trigger, relancez le bloc de l’étape 1 de la migration précédente.