


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."statut_commande" AS ENUM (
    'en_attente',
    'payée',
    'expédiée',
    'livrée',
    'annulée',
    'confirmée',
    'remboursée'
);


ALTER TYPE "public"."statut_commande" OWNER TO "postgres";


CREATE TYPE "public"."statut_profil" AS ENUM (
    'pending',
    'approved',
    'blocked'
);


ALTER TYPE "public"."statut_profil" OWNER TO "postgres";


CREATE TYPE "public"."type_emplacement" AS ENUM (
    'maison',
    'magasin',
    'depot'
);


ALTER TYPE "public"."type_emplacement" OWNER TO "postgres";


CREATE TYPE "public"."type_role" AS ENUM (
    'client',
    'admin',
    'livreur',
    'manager'
);


ALTER TYPE "public"."type_role" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'client',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."a_achete_produit"("p_produit_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.client_id = auth.uid()
      and oi.produit_id = p_produit_id
      and o.statut in ('payée', 'expédiée', 'livrée')
  );
$$;


ALTER FUNCTION "public"."a_achete_produit"("p_produit_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."attribuer_code_livreur"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if new.role = 'livreur' and new.code_livreur is null then
    new.code_livreur := public.generer_code_livreur();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."attribuer_code_livreur"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."classement_favoris"("p_limit" integer DEFAULT 50) RETURNS TABLE("produit_id" "uuid", "nom" "text", "family" "text", "image_url" "text", "stock" integer, "nb_favoris" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  return query
  select
    p.id,
    p.nom,
    p.family,
    p.image_url,
    p.stock,
    count(f.profile_id) as nb_favoris
  from public.produits p
  join public.favoris f on f.produit_id = p.id
  group by p.id, p.nom, p.family, p.image_url, p.stock
  order by count(f.profile_id) desc, p.nom asc
  limit greatest(p_limit, 1);
end;
$$;


ALTER FUNCTION "public"."classement_favoris"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."commandes_a_relancer"() RETURNS TABLE("order_id" "uuid", "client_nom" "text", "client_prenom" "text", "client_email" "text", "client_telephone" "text", "client_whatsapp" "text", "total" numeric, "expediee_depuis" interval, "code_expire_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
    p.email,
    p.telephone,
    p.whatsapp,
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


ALTER FUNCTION "public"."commandes_a_relancer"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."commandes_eligibles_retour"() RETURNS TABLE("commande_id" "uuid", "client_nom" "text", "client_prenom" "text", "total_commande" numeric, "confirmee_le" timestamp with time zone, "jours_restants" integer)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  return query
  select
    o.id,
    p.nom,
    p.prenom,
    o.total,
    o.vente_confirmee_at,
    greatest(0, ceil(extract(epoch from (o.vente_confirmee_at + interval '7 days' - now())) / 86400))::int
  from public.orders o
  join public.profiles p on p.id = o.client_id
  where o.statut = 'confirmée'
    and o.vente_confirmee_at > now() - interval '7 days'
    and not exists (
      select 1 from public.retours r
      where r.order_id = o.id and r.statut in ('demande', 'accepte', 'rembourse')
    )
  order by o.vente_confirmee_at desc;
end;
$$;


ALTER FUNCTION "public"."commandes_eligibles_retour"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."confirmer_livraison"("p_order" "uuid", "p_code" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
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

  if extensions.crypt(p_code, v_row.code_hash) <> v_row.code_hash then
    update public.codes_livraison set tentatives = tentatives + 1 where order_id = p_order;
    return json_build_object('ok', false, 'message', 'Code incorrect.');
  end if;

  update public.codes_livraison set used_at = now() where order_id = p_order;

  perform set_config('app.flux', 'livrée', true);
  update public.orders
  set statut = 'livrée',
      remise_at = now()
  where id = p_order;

  return json_build_object('ok', true, 'message', 'Livraison confirmée. Merci pour votre commande !');
end;
$$;


ALTER FUNCTION "public"."confirmer_livraison"("p_order" "uuid", "p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."contact_client_commande"("p_order" "uuid") RETURNS TABLE("nom" "text", "prenom" "text", "email" "text", "telephone" "text", "whatsapp" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  return query
  select p.nom, p.prenom, p.email, p.telephone, p.whatsapp
  from public.orders o
  join public.profiles p on p.id = o.client_id
  where o.id = p_order;
end;
$$;


ALTER FUNCTION "public"."contact_client_commande"("p_order" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_order"("p_type_lieu" "public"."type_emplacement", "p_adresse" "text", "p_url" "text", "p_items" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_uid uuid := auth.uid();
  v_addr_id uuid;
  v_order_id uuid;
  v_sous_total numeric;
  v_total numeric;
  v_nb_demandes int;
  v_nb_trouves int;
begin
  if v_uid is null then raise exception 'Vous devez être connecté pour passer une commande.'; end if;
  if p_adresse is null or btrim(p_adresse) = '' then raise exception 'Adresse manquante.'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Le panier est vide.'; end if;
  if exists (
    select 1 from jsonb_array_elements(p_items) i
    where coalesce((i->>'quantite')::int, 0) < 1
  ) then
    raise exception 'Quantité invalide.';
  end if;

  -- Verrouille les produits concernés (évite les ventes concurrentes)
  perform 1 from public.produits
  where id in (select (i->>'produit_id')::uuid from jsonb_array_elements(p_items) i)
  order by id
  for update;

  create temp table lignes on commit drop as
  select p.id as produit_id, l.quantite, p.prix_unitaire, p.stock
  from (
    select (i->>'produit_id')::uuid as produit_id,
           sum((i->>'quantite')::int) as quantite
    from jsonb_array_elements(p_items) i
    group by 1
  ) l
  join public.produits p on p.id = l.produit_id;

  select count(distinct (i->>'produit_id')) into v_nb_demandes
  from jsonb_array_elements(p_items) i;
  select count(*) into v_nb_trouves from lignes;

  if v_nb_trouves <> v_nb_demandes then raise exception 'Un ou plusieurs produits sont introuvables.'; end if;
  if exists (select 1 from lignes where stock < quantite) then
    raise exception 'Stock insuffisant pour un ou plusieurs produits.';
  end if;

  select sum(prix_unitaire * quantite) into v_sous_total from lignes;
  v_total := v_sous_total + case when v_sous_total >= 5000 then 0 else 400 end;

  insert into public.adresses_livraison (profile_id, type_lieu, adresse_complete, url_google_maps)
  values (v_uid, p_type_lieu, p_adresse, nullif(p_url, ''))
  returning id into v_addr_id;

  insert into public.orders (client_id, adresse_liv_id, statut, total)
  values (v_uid, v_addr_id, 'en_attente', v_total)
  returning id into v_order_id;

  insert into public.order_items (order_id, produit_id, quantite, prix_facture)
  select v_order_id, produit_id, quantite, prix_unitaire from lignes;

  update public.produits p set stock = p.stock - l.quantite
  from lignes l where p.id = l.produit_id;

  return v_order_id;
end;
$$;


ALTER FUNCTION "public"."create_order"("p_type_lieu" "public"."type_emplacement", "p_adresse" "text", "p_url" "text", "p_items" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decider_retour"("p_retour" "uuid", "p_accepte" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  update public.retours r
  set statut = case when p_accepte then 'accepte' else 'refuse' end,
      decide_par = auth.uid(),
      decide_at = now()
  where r.id = p_retour
    and r.statut = 'demande';

  if not found then
    raise exception 'Retour introuvable ou déjà traité.';
  end if;
end;
$$;


ALTER FUNCTION "public"."decider_retour"("p_retour" "uuid", "p_accepte" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."demander_retour"("p_order" "uuid", "p_motif" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_id uuid;
  v_statut text;
  v_confirmee timestamptz;
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;
  if char_length(btrim(coalesce(p_motif, ''))) < 5 then
    raise exception 'Motif trop court (5 caractères minimum).';
  end if;

  select o.statut::text, o.vente_confirmee_at
  into v_statut, v_confirmee
  from public.orders o
  where o.id = p_order;

  if not found then
    raise exception 'Commande introuvable.';
  end if;
  if v_statut <> 'confirmée' then
    raise exception 'Seule une vente confirmée peut faire l''objet d''un retour.';
  end if;
  if v_confirmee <= now() - interval '7 days' then
    raise exception 'Délai de retour dépassé (7 jours après confirmation de la vente).';
  end if;

  insert into public.retours (order_id, motif, demande_par)
  values (p_order, btrim(p_motif), auth.uid())
  returning id into v_id;

  return v_id;
exception
  when unique_violation then
    raise exception 'Un retour est déjà en cours pour cette commande.';
end;
$$;


ALTER FUNCTION "public"."demander_retour"("p_order" "uuid", "p_motif" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."designer_livreur"("p_order" "uuid", "p_livreur" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_livreur and p.role = 'livreur' and p.status = 'approved'
  ) then
    raise exception 'Livreur invalide ou non approuvé.';
  end if;

  update public.orders
  set livreur_id = p_livreur
  where id = p_order and statut in ('en_attente', 'payée');

  if not found then
    raise exception 'Commande introuvable ou déjà expédiée.';
  end if;
end;
$$;


ALTER FUNCTION "public"."designer_livreur"("p_order" "uuid", "p_livreur" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enregistrer_encaissement"("p_order" "uuid", "p_code_livreur" "text", "p_montant" numeric) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_o public.orders%rowtype;
  v_code_ok boolean;
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  select * into v_o from public.orders where id = p_order for update;
  if not found then
    raise exception 'Commande introuvable.';
  end if;

  if v_o.statut <> 'livrée' or v_o.remise_at is null then
    raise exception 'Encaissement impossible : le colis n''est pas encore remis au client.';
  end if;

  select exists (
    select 1 from public.profiles p
    where p.id = v_o.livreur_id
      and p.code_livreur = upper(btrim(p_code_livreur))
  ) into v_code_ok;

  if not v_code_ok then
    raise exception 'Code livreur incorrect pour cette commande.';
  end if;

  -- Option A : montant exact, sinon refus
  if p_montant is distinct from v_o.total then
    raise exception 'Montant incorrect : le montant dû est de % DA.', v_o.total;
  end if;

  perform set_config('app.flux', 'confirmée', true);

  update public.orders
  set statut = 'confirmée',
      encaissement_montant = p_montant,
      encaissement_livreur_id = v_o.livreur_id,
      encaissement_par = auth.uid(),
      encaissement_at = now(),
      vente_confirmee_at = now()
  where id = p_order;
end;
$$;


ALTER FUNCTION "public"."enregistrer_encaissement"("p_order" "uuid", "p_code_livreur" "text", "p_montant" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."est_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."est_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."est_livreur"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'livreur'
  );
$$;


ALTER FUNCTION "public"."est_livreur"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."est_staff"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'manager')
  );
$$;


ALTER FUNCTION "public"."est_staff"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."etat_code_livraison"("p_order" "uuid") RETURNS TABLE("existe" boolean, "envoye_at" timestamp with time zone, "expires_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;
  return query
  select true, c.envoye_au_livreur_at, c.expires_at
  from public.codes_livraison c
  where c.order_id = p_order and c.used_at is null and c.expires_at > now();
  if not found then
    return query select false, null::timestamptz, null::timestamptz;
  end if;
end;
$$;


ALTER FUNCTION "public"."etat_code_livraison"("p_order" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expedier_commande"("p_order" "uuid", "p_livreur" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_livreur and p.role = 'livreur' and p.status = 'approved'
  ) then
    raise exception 'Livreur invalide ou non approuvé.';
  end if;

  if not exists (
    select 1 from public.codes_livraison c
    where c.order_id = p_order
      and c.used_at is null
      and c.expires_at > now()
      and c.envoye_au_livreur_at is not null
  ) then
    raise exception 'Envoyez le code de livraison au livreur avant l''expédition.';
  end if;

  perform set_config('app.flux', 'expédiée', true);

  update public.orders
  set livreur_id = p_livreur, statut = 'expédiée'
  where id = p_order and statut in ('en_attente', 'payée');

  if not found then
    raise exception 'Commande introuvable ou déjà expédiée.';
  end if;
end;
$$;


ALTER FUNCTION "public"."expedier_commande"("p_order" "uuid", "p_livreur" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."figer_code_livreur"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if old.code_livreur is not null
     and new.code_livreur is distinct from old.code_livreur then
    raise exception 'Le code livreur ne peut pas être modifié.';
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."figer_code_livreur"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generer_code_livraison"("p_order" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  v_code text;
  v_o public.orders%rowtype;
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;

  select * into v_o from public.orders where id = p_order;
  if not found then raise exception 'Commande introuvable.'; end if;
  if v_o.statut not in ('en_attente', 'payée', 'expédiée') then
    raise exception 'Code impossible pour une commande %.', v_o.statut;
  end if;
  if v_o.livreur_id is null then
    raise exception 'Désignez d''abord le livreur.';
  end if;

  v_code := lpad((abs(('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');

  insert into public.codes_livraison (order_id, code_hash, expires_at, used_at, tentatives, envoye_au_livreur_at)
  values (p_order, extensions.crypt(v_code, extensions.gen_salt('bf')), now() + interval '48 hours', null, 0, null)
  on conflict (order_id) do update
    set code_hash = excluded.code_hash,
        expires_at = excluded.expires_at,
        used_at = null,
        tentatives = 0,
        created_at = now(),
        envoye_au_livreur_at = null;

  return v_code;
end;
$$;


ALTER FUNCTION "public"."generer_code_livraison"("p_order" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generer_code_livreur"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_code text;
begin
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (
      select 1 from public.profiles where code_livreur = v_code
    );
  end loop;
  return v_code;
end;
$$;


ALTER FUNCTION "public"."generer_code_livreur"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generer_codes_promo"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  v_seuil numeric;
  v_pct numeric;
  v_jours int;
  v_nb int := 0;
  v_rand bytea;
  v_code text;
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  r record;
begin
  if not public.peut_generer_promo() then
    raise exception 'Accès refusé.';
  end if;

  select (valeur #>> '{}')::numeric into v_seuil
  from public.parametres_site where cle = 'seuil_promo_fidelite';
  select (valeur #>> '{}')::numeric into v_pct
  from public.parametres_site where cle = 'promo_pourcentage';
  select (valeur #>> '{}')::int into v_jours
  from public.parametres_site where cle = 'promo_validite_jours';

  if v_seuil is null or v_pct is null or v_jours is null then
    raise exception 'Réglages promo manquants.';
  end if;

  for r in
    select
      p.id as profile_id,
      sum(o.total) as cumul,
      max(o.vente_confirmee_at) as derniere,
      (select count(*) from public.promo_codes c where c.profile_id = p.id) as nb_codes
    from public.profiles p
    join public.orders o on o.client_id = p.id and o.statut = 'confirmée'
    where p.role = 'client'
    group by p.id
  loop
    -- Délai de retour de la dernière vente écoulé
    continue when r.derniere > now() - interval '7 days';

    -- Palier atteint sur le cumul net (les ventes remboursées sont sorties de ce statut)
    continue when r.cumul < v_seuil * (r.nb_codes + 1);

    -- Aucun retour en cours pour ce client
    continue when exists (
      select 1 from public.retours t
      join public.orders o2 on o2.id = t.order_id
      where o2.client_id = r.profile_id
        and t.statut in ('demande', 'accepte')
    );

    -- Pas de code encore valable
    continue when exists (
      select 1 from public.promo_codes c
      where c.profile_id = r.profile_id
        and c.used_at is null
        and c.expires_at > now()
    );

    loop
      v_rand := extensions.gen_random_bytes(6);
      v_code := 'TP' || (
        select string_agg(substr(v_alphabet, 1 + (get_byte(v_rand, i) % 32), 1), '')
        from generate_series(0, 5) as i
      );
      exit when not exists (select 1 from public.promo_codes where code = v_code);
    end loop;

    insert into public.promo_codes (code, profile_id, pourcentage, expires_at)
    values (v_code, r.profile_id, v_pct, now() + make_interval(days => v_jours));

    v_nb := v_nb + 1;
  end loop;

  return v_nb;
end;
$$;


ALTER FUNCTION "public"."generer_codes_promo"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, email, nom, prenom, role, status)
  values (new.id, new.email, '', '', 'client', 'approved')
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_or_livreur"("allowed_roles" "text"[]) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role::text = any(allowed_roles)
  );
end;
$$;


ALTER FUNCTION "public"."is_admin_or_livreur"("allowed_roles" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."liste_clients"() RETURNS TABLE("id" "uuid", "nom" "text", "prenom" "text", "email" "text", "telephone" "text", "whatsapp" "text", "status" "text", "nb_commandes" bigint, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  return query
  select
    p.id,
    p.nom,
    p.prenom,
    p.email,
    p.telephone,
    p.whatsapp,
    p.status,
    (select count(*) from public.orders o where o.client_id = p.id),
    p.created_at
  from public.profiles p
  where p.role = 'client'
  order by p.created_at desc;
end;
$$;


ALTER FUNCTION "public"."liste_clients"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."liste_livreurs"() RETURNS TABLE("id" "uuid", "nom" "text", "prenom" "text", "telephone" "text", "code_livreur" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;
  return query
  select p.id, p.nom, p.prenom, p.telephone, p.code_livreur
  from public.profiles p
  where p.role = 'livreur' and p.status = 'approved'
  order by p.nom;
end;
$$;


ALTER FUNCTION "public"."liste_livreurs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."livreur_peut_voir_adresse"("p_addr" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from public.orders o
    where o.adresse_liv_id = p_addr
      and o.livreur_id = auth.uid()
      and o.statut = 'expédiée'
  );
$$;


ALTER FUNCTION "public"."livreur_peut_voir_adresse"("p_addr" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."marquer_code_envoye"("p_order" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.est_staff() then raise exception 'Accès refusé.'; end if;
  update public.codes_livraison c
  set envoye_au_livreur_at = now()
  where c.order_id = p_order and c.used_at is null and c.expires_at > now();
  if not found then
    raise exception 'Aucun code valide : générez-le d''abord.';
  end if;
end;
$$;


ALTER FUNCTION "public"."marquer_code_envoye"("p_order" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."meilleures_ventes"("p_periode" "text" DEFAULT 'mois'::"text", "p_ref" timestamp with time zone DEFAULT "now"(), "p_limit" integer DEFAULT 10) RETURNS TABLE("produit_id" "uuid", "nom" "text", "family" "text", "image_url" "text", "quantite_vendue" bigint, "chiffre_affaires" numeric, "nb_commandes" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_tz text := 'Africa/Algiers';
  v_unite text;
  v_debut timestamptz;
  v_fin timestamptz;
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  if p_periode not in ('semaine', 'mois', 'annee') then
    raise exception 'Période invalide.';
  end if;

  v_unite := case p_periode when 'semaine' then 'week' when 'mois' then 'month' else 'year' end;

  -- Bornes de la période, calculées dans le fuseau local
  v_debut := date_trunc(v_unite, p_ref at time zone v_tz) at time zone v_tz;
  v_fin := v_debut + case p_periode
    when 'semaine' then interval '1 week'
    when 'mois' then interval '1 month'
    else interval '1 year'
  end;

  return query
  select
    p.id,
    p.nom,
    p.family,
    p.image_url,
    sum(oi.quantite)::bigint,
    sum(oi.quantite * oi.prix_facture),
    count(distinct o.id)
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  join public.produits p on p.id = oi.produit_id
  where o.statut in ('payée', 'expédiée', 'livrée')
    and o.created_at >= v_debut
    and o.created_at < v_fin
  group by p.id, p.nom, p.family, p.image_url
  order by sum(oi.quantite) desc, sum(oi.quantite * oi.prix_facture) desc, p.nom asc
  limit greatest(p_limit, 1);
end;
$$;


ALTER FUNCTION "public"."meilleures_ventes"("p_periode" "text", "p_ref" timestamp with time zone, "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mon_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ select role::text from public.profiles where id = auth.uid() $$;


ALTER FUNCTION "public"."mon_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mon_statut"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ select status from public.profiles where id = auth.uid() $$;


ALTER FUNCTION "public"."mon_statut"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."peut_generer_promo"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'manager' and p.peut_generer_promo)
      )
  );
$$;


ALTER FUNCTION "public"."peut_generer_promo"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."proteger_commande"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_flux text := coalesce(nullif(current_setting('app.flux', true), ''), '');
begin
  if auth.uid() is null or not public.est_staff() then
    return new;
  end if;

  if new.client_id is distinct from old.client_id
     or new.adresse_liv_id is distinct from old.adresse_liv_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Adresse et client de la commande ne peuvent pas être modifiés.';
  end if;

  if (new.encaissement_montant, new.encaissement_livreur_id, new.encaissement_par,
      new.encaissement_at, new.vente_confirmee_at, new.remise_at)
     is distinct from
     (old.encaissement_montant, old.encaissement_livreur_id, old.encaissement_par,
      old.encaissement_at, old.vente_confirmee_at, old.remise_at)
     and v_flux = '' then
    raise exception 'Ces champs sont renseignés par le flux de vente uniquement.';
  end if;

  if new.livreur_id is distinct from old.livreur_id
     and old.statut not in ('en_attente', 'payée') then
    raise exception 'Le livreur ne peut plus être modifié après expédition.';
  end if;

  if new.statut is distinct from old.statut then
    if v_flux = 'expédiée' and old.statut not in ('en_attente', 'payée') then
      raise exception 'Expédition impossible depuis le statut %.', old.statut;
    end if;
    if v_flux = 'livrée' and old.statut <> 'expédiée' then
      raise exception 'Remise du colis impossible depuis le statut %.', old.statut;
    end if;
    if v_flux = 'confirmée' and old.statut <> 'livrée' then
      raise exception 'Confirmation de vente impossible depuis le statut %.', old.statut;
    end if;
    if v_flux = 'remboursée' and old.statut <> 'confirmée' then
      raise exception 'Remboursement impossible depuis le statut %.', old.statut;
    end if;

    if new.statut::text in ('expédiée', 'livrée', 'confirmée', 'remboursée')
       and v_flux <> new.statut::text then
      raise exception 'Ce statut est posé par le flux de livraison ou d''encaissement.';
    end if;

    if v_flux = '' and not (
      (old.statut = 'en_attente' and new.statut::text in ('payée', 'annulée'))
      or (old.statut = 'payée' and new.statut::text = 'annulée')
    ) then
      raise exception 'Passage de % à % non autorisé.', old.statut, new.statut;
    end if;

    if v_flux = '' and old.statut in ('livrée', 'confirmée', 'remboursée', 'annulée') then
      raise exception 'Commande % : changement de statut impossible.', old.statut;
    end if;

    if new.statut::text = 'expédiée' then
      if new.livreur_id is null then
        raise exception 'Désignez un livreur avant l''expédition.';
      end if;
      new.expediee_at := now();
    end if;
  end if;

  if new.remise is distinct from old.remise or new.total is distinct from old.total then
    if not public.est_admin() then
      raise exception 'Seul un administrateur peut appliquer une remise.';
    end if;
    if old.statut in ('livrée', 'confirmée', 'remboursée', 'annulée') then
      raise exception 'Remise impossible une fois le colis remis.';
    end if;
    if new.remise > old.total + old.remise then
      raise exception 'La remise ne peut pas dépasser le montant de la commande.';
    end if;
    new.total := old.total + old.remise - new.remise;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."proteger_commande"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rembourser_retour"("p_retour" "uuid", "p_montant" numeric, "p_reference" "text", "p_stock_remis" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_order uuid;
  v_total numeric;
  v_statut text;
begin
  if not public.est_admin() then
    raise exception 'Seul un administrateur peut rembourser.';
  end if;
  if nullif(btrim(coalesce(p_reference, '')), '') is null then
    raise exception 'La référence de paiement est obligatoire.';
  end if;

  select r.order_id, o.total, o.statut::text
  into v_order, v_total, v_statut
  from public.retours r
  join public.orders o on o.id = r.order_id
  where r.id = p_retour and r.statut = 'accepte';

  if not found then
    raise exception 'Retour introuvable ou non accepté.';
  end if;
  if v_statut <> 'confirmée' then
    raise exception 'Seule une vente confirmée peut être remboursée.';
  end if;
  if p_montant is null or p_montant < 0 or p_montant > v_total then
    raise exception 'Montant invalide (maximum : % DA).', v_total;
  end if;

  if p_stock_remis then
    update public.produits pr
    set stock = pr.stock + l.qte
    from (
      select oi.produit_id, sum(oi.quantite) as qte
      from public.order_items oi
      where oi.order_id = v_order and oi.produit_id is not null
      group by oi.produit_id
    ) l
    where pr.id = l.produit_id;
  end if;

  update public.retours r
  set statut = 'rembourse',
      montant_rembourse = p_montant,
      reference_paiement = btrim(p_reference),
      stock_remis = p_stock_remis,
      rembourse_at = now()
  where r.id = p_retour;

  perform set_config('app.flux', 'remboursée', true);
  update public.orders set statut = 'remboursée' where id = v_order;
end;
$$;


ALTER FUNCTION "public"."rembourser_retour"("p_retour" "uuid", "p_montant" numeric, "p_reference" "text", "p_stock_remis" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seul_client_commande"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if auth.uid() is not null and not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'client'
  ) then
    raise exception 'Seuls les clients peuvent passer commande.';
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."seul_client_commande"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tableau_de_bord"() RETURNS json
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_tz text := 'Africa/Algiers';
  v_debut_jour timestamptz := date_trunc('day', now() at time zone v_tz) at time zone v_tz;
  v_seuil int;
  v_delai_relance int;
  v_resultat json;
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  select (valeur #>> '{}')::int into v_seuil
  from public.parametres_site where cle = 'seuil_alerte_stock';
  select (valeur #>> '{}')::int into v_delai_relance
  from public.parametres_site where cle = 'delai_relance_livraison_heures';

  select json_build_object(
    'a_traiter', json_build_object(
      'commandes_sans_livreur', (
        select count(*) from public.orders
        where statut in ('en_attente', 'payée') and livreur_id is null
      ),
      'commandes_a_expedier', (
        select count(*) from public.orders
        where statut in ('en_attente', 'payée') and livreur_id is not null
      ),
      'remises_a_confirmer', (
        select count(*) from public.orders
        where statut = 'livrée' and encaissement_at is null
      ),
      'retours_a_decider', (
        select count(*) from public.retours where statut = 'demande'
      ),
      'retours_a_rembourser', (
        select count(*) from public.retours where statut = 'accepte'
      ),
      'relances_livraison', (
        select count(*) from public.orders
        where statut = 'expédiée'
          and expediee_at < now() - make_interval(hours => coalesce(v_delai_relance, 24))
      )
    ),
    'aujourdhui', (
      select json_build_object(
        'commandes', count(*),
        'chiffre_affaires', coalesce(sum(total), 0)
      )
      from public.orders
      where statut in ('payée', 'expédiée', 'livrée', 'confirmée')
        and created_at >= v_debut_jour
    ),
    'stock', json_build_object(
      'sous_seuil', (
        select count(*) from public.produits
        where stock > 0 and stock < coalesce(v_seuil, 200)
      ),
      'ruptures', (
        select count(*) from public.produits where stock = 0
      )
    ),
    'fidelite', case when public.est_admin() then json_build_object(
      'codes_valables', (
        select count(*) from public.promo_codes
        where used_at is null and expires_at > now()
      ),
      'codes_utilises', (
        select count(*) from public.promo_codes where used_at is not null
      )
    ) else null end
  ) into v_resultat;

  return v_resultat;
end;
$$;


ALTER FUNCTION "public"."tableau_de_bord"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_total"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_order_id uuid;
  v_total numeric(10,2);
begin
  -- Déterminer l'ID de la commande concernée (selon l'action INSERT, UPDATE ou DELETE)
  if TG_OP = 'DELETE' then
    v_order_id := old.order_id;
  else
    v_order_id := new.order_id;
  end if;

  -- Calculer la somme totale de tous les articles de cette commande
  select coalesce(sum(quantite * prix_facture), 0.00)
  into v_total
  from public.order_items
  where order_id = v_order_id;

  -- Mettre à jour la table principale des commandes
  update public.orders
  set total = v_total
  where id = v_order_id;

  return null;
end;
$$;


ALTER FUNCTION "public"."update_order_total"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."valider_et_payer_commande"("p_order_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  item record;
  stock_actuel integer;
begin
  -- 1. Boucle sur chaque article de la commande
  for item in 
    select produit_id, quantite 
    from public.order_items 
    where order_id = p_order_id
  loop
    -- Récupérer le stock actuel du produit avec un verrou (for update) pour éviter les conflits simultanés
    select quantite into stock_actuel 
    from public.stocks 
    where produit_id = item.produit_id 
    for update;

    -- 2. Vérification de la disponibilité
    if stock_actuel is null or stock_actuel < item.quantite then
      raise exception 'Stock insuffisant pour le produit id : %. Disponible: %, Demandé: %', 
        item.produit_id, coalesce(stock_actuel, 0), item.quantite;
    end if;

    -- 3. Déduction du stock
    update public.stocks
    set quantite = quantite - item.quantite,
        mis_a_jour_le = now()
    where produit_id = item.produit_id;
  end loop;

  -- 4. Mise à jour du statut de la commande
  update public.orders
  set statut = 'payée'
  where id = p_order_id;

end;
$$;


ALTER FUNCTION "public"."valider_et_payer_commande"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ventes_par_jour"("p_mois" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("jour" "date", "nb_commandes" bigint, "chiffre_affaires" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_tz text := 'Africa/Algiers';
  v_debut timestamptz;
  v_fin timestamptz;
begin
  if not public.est_staff() then
    raise exception 'Accès refusé.';
  end if;

  -- Bornes du mois, en heure locale
  v_debut := date_trunc('month', p_mois::timestamp) at time zone v_tz;
  v_fin := v_debut + interval '1 month';

  return query
  select
    (o.created_at at time zone v_tz)::date as jour,
    count(*) as nb_commandes,
    sum(o.total) as chiffre_affaires
  from public.orders o
  where o.statut in ('payée', 'expédiée', 'livrée')
    and o.created_at >= v_debut
    and o.created_at < v_fin
  group by 1
  order by 1;
end;
$$;


ALTER FUNCTION "public"."ventes_par_jour"("p_mois" "date") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."adresses_livraison" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "type_lieu" "public"."type_emplacement" DEFAULT 'maison'::"public"."type_emplacement" NOT NULL,
    "adresse_complete" "text" NOT NULL,
    "url_google_maps" "text",
    "longitude" numeric(9,6),
    "latitude" numeric(9,6),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."adresses_livraison" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "nom" "text" NOT NULL,
    "prenom" "text" NOT NULL,
    "role" "public"."type_role" DEFAULT 'client'::"public"."type_role" NOT NULL,
    "telephone" "text",
    "whatsapp" "text",
    "date_naissance" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "code_livreur" "text",
    "peut_generer_promo" boolean DEFAULT false NOT NULL,
    CONSTRAINT "profiles_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."email" IS 'email';



CREATE TABLE IF NOT EXISTS "public"."rates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "produit_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "note" integer NOT NULL,
    "commentaire" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "publie" boolean DEFAULT true NOT NULL,
    CONSTRAINT "rates_note_check" CHECK ((("note" >= 1) AND ("note" <= 5))),
    CONSTRAINT "rates_note_range" CHECK ((("note" >= 1) AND ("note" <= 5)))
);


ALTER TABLE "public"."rates" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."avis_publics" AS
 SELECT "r"."id",
    "r"."produit_id",
    "r"."note",
    "r"."commentaire",
    "r"."created_at",
    "r"."updated_at",
    ((("p"."prenom" || ' '::"text") || "left"("p"."nom", 1)) || '.'::"text") AS "auteur"
   FROM ("public"."rates" "r"
     JOIN "public"."profiles" "p" ON (("p"."id" = "r"."client_id")))
  WHERE "r"."publie";


ALTER VIEW "public"."avis_publics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."codes_livraison" (
    "order_id" "uuid" NOT NULL,
    "code_hash" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone,
    "tentatives" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "envoye_au_livreur_at" timestamp with time zone
);


ALTER TABLE "public"."codes_livraison" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favoris" (
    "profile_id" "uuid" NOT NULL,
    "produit_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."favoris" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedbacks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "from_profile_id" "uuid" NOT NULL,
    "subject" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "feedbacks_message_check" CHECK ((("char_length"("message") >= 10) AND ("char_length"("message") <= 2000))),
    CONSTRAINT "feedbacks_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'read'::"text"]))),
    CONSTRAINT "feedbacks_subject_check" CHECK ((("char_length"("subject") >= 3) AND ("char_length"("subject") <= 150)))
);


ALTER TABLE "public"."feedbacks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "produit_id" "uuid",
    "quantite" integer NOT NULL,
    "prix_facture" numeric(10,2) NOT NULL,
    CONSTRAINT "order_items_prix_facture_check" CHECK (("prix_facture" >= (0)::numeric)),
    CONSTRAINT "order_items_quantite_check" CHECK (("quantite" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid",
    "adresse_liv_id" "uuid",
    "statut" "public"."statut_commande" DEFAULT 'en_attente'::"public"."statut_commande" NOT NULL,
    "total" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "remise" numeric(10,2) DEFAULT 0 NOT NULL,
    "expediee_at" timestamp with time zone,
    "livreur_id" "uuid",
    "remise_at" timestamp with time zone,
    "encaissement_montant" numeric(10,2),
    "encaissement_livreur_id" "uuid",
    "encaissement_par" "uuid",
    "encaissement_at" timestamp with time zone,
    "vente_confirmee_at" timestamp with time zone,
    CONSTRAINT "orders_remise_check" CHECK (("remise" >= (0)::numeric)),
    CONSTRAINT "orders_total_check" CHECK (("total" >= (0)::numeric))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."parametres_site" (
    "cle" "text" NOT NULL,
    "valeur" "jsonb" NOT NULL,
    "libelle" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid"
);


ALTER TABLE "public"."parametres_site" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."produits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nom" "text" NOT NULL,
    "description" "text",
    "prix_unitaire" numeric(10,2) NOT NULL,
    "sku" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_url" "text",
    "origin" "text",
    "weight" "text",
    "stock" integer DEFAULT 0 NOT NULL,
    "region" "text",
    "family" "text",
    "is_best_seller" boolean DEFAULT false NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "slug" "text",
    CONSTRAINT "produits_prix_unitaire_check" CHECK (("prix_unitaire" >= (0)::numeric))
);


ALTER TABLE "public"."produits" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."produits_notes" AS
 SELECT "produit_id",
    "round"("avg"("note"), 1) AS "note_moyenne",
    ("count"(*))::integer AS "nb_avis",
    ("count"(*) FILTER (WHERE ("note" = 1)))::integer AS "n1",
    ("count"(*) FILTER (WHERE ("note" = 2)))::integer AS "n2",
    ("count"(*) FILTER (WHERE ("note" = 3)))::integer AS "n3",
    ("count"(*) FILTER (WHERE ("note" = 4)))::integer AS "n4",
    ("count"(*) FILTER (WHERE ("note" = 5)))::integer AS "n5"
   FROM "public"."rates"
  WHERE "publie"
  GROUP BY "produit_id";


ALTER VIEW "public"."produits_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "pourcentage" numeric(5,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone,
    "order_id" "uuid",
    CONSTRAINT "promo_codes_pourcentage_check" CHECK ((("pourcentage" > (0)::numeric) AND ("pourcentage" <= (100)::numeric)))
);


ALTER TABLE "public"."promo_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "statut" "text" DEFAULT 'demande'::"text" NOT NULL,
    "motif" "text" NOT NULL,
    "demande_par" "uuid",
    "demande_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "decide_par" "uuid",
    "decide_at" timestamp with time zone,
    "montant_rembourse" numeric(10,2),
    "reference_paiement" "text",
    "stock_remis" boolean DEFAULT false NOT NULL,
    "rembourse_at" timestamp with time zone,
    CONSTRAINT "retours_montant_rembourse_check" CHECK (("montant_rembourse" >= (0)::numeric)),
    CONSTRAINT "retours_motif_check" CHECK ((("char_length"("motif") >= 5) AND ("char_length"("motif") <= 500))),
    CONSTRAINT "retours_statut_check" CHECK (("statut" = ANY (ARRAY['demande'::"text", 'accepte'::"text", 'refuse'::"text", 'rembourse'::"text"])))
);


ALTER TABLE "public"."retours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "produit_id" "uuid" NOT NULL,
    "quantite" integer DEFAULT 0 NOT NULL,
    "mis_a_jour_le" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "stocks_quantite_check" CHECK (("quantite" >= 0))
);


ALTER TABLE "public"."stocks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."adresses_livraison"
    ADD CONSTRAINT "adresses_livraison_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."codes_livraison"
    ADD CONSTRAINT "codes_livraison_pkey" PRIMARY KEY ("order_id");



ALTER TABLE ONLY "public"."favoris"
    ADD CONSTRAINT "favoris_pkey" PRIMARY KEY ("profile_id", "produit_id");



ALTER TABLE ONLY "public"."favoris"
    ADD CONSTRAINT "favoris_profil_produit_unique" UNIQUE ("profile_id", "produit_id");



ALTER TABLE ONLY "public"."feedbacks"
    ADD CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_produit_id_key" UNIQUE ("order_id", "produit_id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parametres_site"
    ADD CONSTRAINT "parametres_site_pkey" PRIMARY KEY ("cle");



ALTER TABLE ONLY "public"."produits"
    ADD CONSTRAINT "produits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."produits"
    ADD CONSTRAINT "produits_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."produits"
    ADD CONSTRAINT "produits_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rates"
    ADD CONSTRAINT "rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rates"
    ADD CONSTRAINT "rates_produit_id_client_id_key" UNIQUE ("produit_id", "client_id");



ALTER TABLE ONLY "public"."retours"
    ADD CONSTRAINT "retours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stocks"
    ADD CONSTRAINT "stocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stocks"
    ADD CONSTRAINT "stocks_produit_id_key" UNIQUE ("produit_id");



CREATE INDEX "produits_best_seller_idx" ON "public"."produits" USING "btree" ("is_best_seller") WHERE "is_best_seller";



CREATE UNIQUE INDEX "profiles_code_livreur_unique" ON "public"."profiles" USING "btree" ("code_livreur") WHERE ("code_livreur" IS NOT NULL);



CREATE UNIQUE INDEX "rates_client_produit_uniq" ON "public"."rates" USING "btree" ("client_id", "produit_id");



CREATE UNIQUE INDEX "retours_un_ouvert_par_commande" ON "public"."retours" USING "btree" ("order_id") WHERE ("statut" = ANY (ARRAY['demande'::"text", 'accepte'::"text"]));



CREATE OR REPLACE TRIGGER "attribuer_code_livreur" BEFORE INSERT OR UPDATE OF "role" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."attribuer_code_livreur"();



CREATE OR REPLACE TRIGGER "figer_code_livreur" BEFORE UPDATE OF "code_livreur" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."figer_code_livreur"();



CREATE OR REPLACE TRIGGER "on_order_item_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_order_total"();



CREATE OR REPLACE TRIGGER "proteger_commande" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."proteger_commande"();



CREATE OR REPLACE TRIGGER "rates_set_updated_at" BEFORE UPDATE ON "public"."rates" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "seul_client_commande" BEFORE INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."seul_client_commande"();



ALTER TABLE ONLY "public"."adresses_livraison"
    ADD CONSTRAINT "adresses_livraison_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."codes_livraison"
    ADD CONSTRAINT "codes_livraison_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favoris"
    ADD CONSTRAINT "favoris_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "public"."produits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favoris"
    ADD CONSTRAINT "favoris_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedbacks"
    ADD CONSTRAINT "feedbacks_from_profile_id_fkey" FOREIGN KEY ("from_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "public"."produits"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_adresse_liv_id_fkey" FOREIGN KEY ("adresse_liv_id") REFERENCES "public"."adresses_livraison"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_encaissement_livreur_id_fkey" FOREIGN KEY ("encaissement_livreur_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_encaissement_par_fkey" FOREIGN KEY ("encaissement_par") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_livreur_id_fkey" FOREIGN KEY ("livreur_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."parametres_site"
    ADD CONSTRAINT "parametres_site_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rates"
    ADD CONSTRAINT "rates_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rates"
    ADD CONSTRAINT "rates_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "public"."produits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."retours"
    ADD CONSTRAINT "retours_decide_par_fkey" FOREIGN KEY ("decide_par") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."retours"
    ADD CONSTRAINT "retours_demande_par_fkey" FOREIGN KEY ("demande_par") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."retours"
    ADD CONSTRAINT "retours_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."stocks"
    ADD CONSTRAINT "stocks_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "public"."produits"("id") ON DELETE CASCADE;



CREATE POLICY "Les admins ont un accès total sur les profils" ON "public"."profiles" USING ("public"."is_admin_or_livreur"(ARRAY['admin'::"text"]));



CREATE POLICY "Les produits sont visibles par tous" ON "public"."produits" FOR SELECT USING (true);



CREATE POLICY "Les utilisateurs connectés peuvent laisser un avis" ON "public"."rates" FOR INSERT WITH CHECK (("auth"."uid"() = "client_id"));



CREATE POLICY "Les utilisateurs gèrent leurs propres adresses" ON "public"."adresses_livraison" USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Tout le monde peut voir l'état des stocks" ON "public"."stocks" FOR SELECT USING (true);



CREATE POLICY "adresses: staff et livreur de la livraison" ON "public"."adresses_livraison" FOR SELECT TO "authenticated" USING (("public"."est_staff"() OR ("public"."est_livreur"() AND "public"."livreur_peut_voir_adresse"("id"))));



ALTER TABLE "public"."adresses_livraison" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."codes_livraison" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favoris" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "favoris: staff lit tout" ON "public"."favoris" FOR SELECT TO "authenticated" USING ("public"."est_staff"());



CREATE POLICY "favoris_delete_own" ON "public"."favoris" FOR DELETE TO "authenticated" USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "favoris_insert_own" ON "public"."favoris" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "favoris_select_own" ON "public"."favoris" FOR SELECT TO "authenticated" USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "feedback: admin lit tout" ON "public"."feedbacks" FOR SELECT TO "authenticated" USING ("public"."est_admin"());



CREATE POLICY "feedback: admin marque lu" ON "public"."feedbacks" FOR UPDATE TO "authenticated" USING ("public"."est_admin"()) WITH CHECK ("public"."est_admin"());



CREATE POLICY "feedback: auteur lit les siens" ON "public"."feedbacks" FOR SELECT TO "authenticated" USING (("from_profile_id" = "auth"."uid"()));



CREATE POLICY "feedback: staff envoie" ON "public"."feedbacks" FOR INSERT TO "authenticated" WITH CHECK ((("from_profile_id" = "auth"."uid"()) AND "public"."est_staff"()));



ALTER TABLE "public"."feedbacks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_items: client lit les siennes" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."client_id" = "auth"."uid"())))));



CREATE POLICY "order_items: staff lit tout" ON "public"."order_items" FOR SELECT TO "authenticated" USING ("public"."est_staff"());



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orders: client lit les siennes" ON "public"."orders" FOR SELECT TO "authenticated" USING (("client_id" = "auth"."uid"()));



CREATE POLICY "orders: staff lit tout" ON "public"."orders" FOR SELECT TO "authenticated" USING ("public"."est_staff"());



CREATE POLICY "orders: staff modifie statut" ON "public"."orders" FOR UPDATE TO "authenticated" USING ("public"."est_staff"()) WITH CHECK ("public"."est_staff"());



CREATE POLICY "parametres: admin modifie" ON "public"."parametres_site" TO "authenticated" USING ("public"."est_admin"()) WITH CHECK ("public"."est_admin"());



CREATE POLICY "parametres: lecture publique" ON "public"."parametres_site" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."parametres_site" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."produits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "produits: admin insere" ON "public"."produits" FOR INSERT TO "authenticated" WITH CHECK ("public"."est_admin"());



CREATE POLICY "produits: admin modifie" ON "public"."produits" FOR UPDATE TO "authenticated" USING ("public"."est_admin"()) WITH CHECK ("public"."est_admin"());



CREATE POLICY "produits: admin supprime" ON "public"."produits" FOR DELETE TO "authenticated" USING ("public"."est_admin"());



CREATE POLICY "profil: lecture de son propre profil" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "profil: modification de soi sans rôle ni statut" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK ((("id" = "auth"."uid"()) AND (("role")::"text" = "public"."mon_role"()) AND ("status" = "public"."mon_statut"())));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "promo: admin lit tout" ON "public"."promo_codes" FOR SELECT TO "authenticated" USING ("public"."est_admin"());



CREATE POLICY "promo: client lit les siens" ON "public"."promo_codes" FOR SELECT TO "authenticated" USING (("profile_id" = "auth"."uid"()));



ALTER TABLE "public"."promo_codes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rate_delete_staff" ON "public"."rates" FOR DELETE TO "authenticated" USING ("public"."est_staff"());



CREATE POLICY "rate_select_own" ON "public"."rates" FOR SELECT TO "authenticated" USING (("client_id" = "auth"."uid"()));



CREATE POLICY "rate_select_staff" ON "public"."rates" FOR SELECT TO "authenticated" USING ("public"."est_staff"());



CREATE POLICY "rate_update_staff" ON "public"."rates" FOR UPDATE TO "authenticated" USING ("public"."est_staff"()) WITH CHECK ("public"."est_staff"());



ALTER TABLE "public"."rates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rates: avis publiés" ON "public"."rates" FOR SELECT TO "authenticated" USING (("publie" = true));



CREATE POLICY "rates_insert_buyer" ON "public"."rates" FOR INSERT TO "authenticated" WITH CHECK ((("client_id" = "auth"."uid"()) AND "public"."a_achete_produit"("produit_id")));



CREATE POLICY "rates_update_own" ON "public"."rates" FOR UPDATE TO "authenticated" USING (("client_id" = "auth"."uid"())) WITH CHECK ((("client_id" = "auth"."uid"()) AND "public"."a_achete_produit"("produit_id")));



ALTER TABLE "public"."retours" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "retours: staff lit" ON "public"."retours" FOR SELECT TO "authenticated" USING ("public"."est_staff"());



ALTER TABLE "public"."stocks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "stocks: admin insere" ON "public"."stocks" FOR INSERT TO "authenticated" WITH CHECK ("public"."est_admin"());



CREATE POLICY "stocks: admin modifie" ON "public"."stocks" FOR UPDATE TO "authenticated" USING ("public"."est_admin"()) WITH CHECK ("public"."est_admin"());



CREATE POLICY "stocks: admin supprime" ON "public"."stocks" FOR DELETE TO "authenticated" USING ("public"."est_admin"());





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."orders";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."a_achete_produit"("p_produit_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."a_achete_produit"("p_produit_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."a_achete_produit"("p_produit_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."attribuer_code_livreur"() TO "anon";
GRANT ALL ON FUNCTION "public"."attribuer_code_livreur"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."attribuer_code_livreur"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."classement_favoris"("p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."classement_favoris"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."classement_favoris"("p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."commandes_a_relancer"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."commandes_a_relancer"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."commandes_a_relancer"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."commandes_eligibles_retour"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."commandes_eligibles_retour"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."commandes_eligibles_retour"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."confirmer_livraison"("p_order" "uuid", "p_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."confirmer_livraison"("p_order" "uuid", "p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirmer_livraison"("p_order" "uuid", "p_code" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."contact_client_commande"("p_order" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."contact_client_commande"("p_order" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."contact_client_commande"("p_order" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_order"("p_type_lieu" "public"."type_emplacement", "p_adresse" "text", "p_url" "text", "p_items" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_order"("p_type_lieu" "public"."type_emplacement", "p_adresse" "text", "p_url" "text", "p_items" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_order"("p_type_lieu" "public"."type_emplacement", "p_adresse" "text", "p_url" "text", "p_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order"("p_type_lieu" "public"."type_emplacement", "p_adresse" "text", "p_url" "text", "p_items" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."decider_retour"("p_retour" "uuid", "p_accepte" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."decider_retour"("p_retour" "uuid", "p_accepte" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decider_retour"("p_retour" "uuid", "p_accepte" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."demander_retour"("p_order" "uuid", "p_motif" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."demander_retour"("p_order" "uuid", "p_motif" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."demander_retour"("p_order" "uuid", "p_motif" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."designer_livreur"("p_order" "uuid", "p_livreur" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."designer_livreur"("p_order" "uuid", "p_livreur" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."designer_livreur"("p_order" "uuid", "p_livreur" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."enregistrer_encaissement"("p_order" "uuid", "p_code_livreur" "text", "p_montant" numeric) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enregistrer_encaissement"("p_order" "uuid", "p_code_livreur" "text", "p_montant" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."enregistrer_encaissement"("p_order" "uuid", "p_code_livreur" "text", "p_montant" numeric) TO "service_role";



REVOKE ALL ON FUNCTION "public"."est_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."est_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."est_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."est_livreur"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."est_livreur"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."est_livreur"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."est_staff"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."est_staff"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."est_staff"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."etat_code_livraison"("p_order" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."etat_code_livraison"("p_order" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."etat_code_livraison"("p_order" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."expedier_commande"("p_order" "uuid", "p_livreur" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."expedier_commande"("p_order" "uuid", "p_livreur" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."expedier_commande"("p_order" "uuid", "p_livreur" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."figer_code_livreur"() TO "anon";
GRANT ALL ON FUNCTION "public"."figer_code_livreur"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."figer_code_livreur"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."generer_code_livraison"("p_order" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generer_code_livraison"("p_order" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generer_code_livraison"("p_order" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generer_code_livreur"() TO "anon";
GRANT ALL ON FUNCTION "public"."generer_code_livreur"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generer_code_livreur"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."generer_codes_promo"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generer_codes_promo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generer_codes_promo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_or_livreur"("allowed_roles" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_or_livreur"("allowed_roles" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_or_livreur"("allowed_roles" "text"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."liste_clients"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."liste_clients"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."liste_clients"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."liste_livreurs"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."liste_livreurs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."liste_livreurs"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."livreur_peut_voir_adresse"("p_addr" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."livreur_peut_voir_adresse"("p_addr" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."livreur_peut_voir_adresse"("p_addr" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."marquer_code_envoye"("p_order" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."marquer_code_envoye"("p_order" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."marquer_code_envoye"("p_order" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."meilleures_ventes"("p_periode" "text", "p_ref" timestamp with time zone, "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."meilleures_ventes"("p_periode" "text", "p_ref" timestamp with time zone, "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."meilleures_ventes"("p_periode" "text", "p_ref" timestamp with time zone, "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."mon_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."mon_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mon_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mon_statut"() TO "anon";
GRANT ALL ON FUNCTION "public"."mon_statut"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mon_statut"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."peut_generer_promo"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."peut_generer_promo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."peut_generer_promo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."proteger_commande"() TO "anon";
GRANT ALL ON FUNCTION "public"."proteger_commande"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."proteger_commande"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."rembourser_retour"("p_retour" "uuid", "p_montant" numeric, "p_reference" "text", "p_stock_remis" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."rembourser_retour"("p_retour" "uuid", "p_montant" numeric, "p_reference" "text", "p_stock_remis" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."rembourser_retour"("p_retour" "uuid", "p_montant" numeric, "p_reference" "text", "p_stock_remis" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."seul_client_commande"() TO "anon";
GRANT ALL ON FUNCTION "public"."seul_client_commande"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."seul_client_commande"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."tableau_de_bord"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."tableau_de_bord"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tableau_de_bord"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_total"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_total"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_total"() TO "service_role";



GRANT ALL ON FUNCTION "public"."valider_et_payer_commande"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."valider_et_payer_commande"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."valider_et_payer_commande"("p_order_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."ventes_par_jour"("p_mois" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."ventes_par_jour"("p_mois" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ventes_par_jour"("p_mois" "date") TO "service_role";


















GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."adresses_livraison" TO "authenticated";
GRANT ALL ON TABLE "public"."adresses_livraison" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT UPDATE("nom") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("prenom") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("telephone") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("whatsapp") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("date_naissance") ON TABLE "public"."profiles" TO "authenticated";



GRANT SELECT,INSERT,DELETE,MAINTAIN ON TABLE "public"."rates" TO "authenticated";
GRANT ALL ON TABLE "public"."rates" TO "service_role";



GRANT UPDATE("note") ON TABLE "public"."rates" TO "authenticated";



GRANT UPDATE("commentaire") ON TABLE "public"."rates" TO "authenticated";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."avis_publics" TO "authenticated";
GRANT ALL ON TABLE "public"."avis_publics" TO "service_role";



GRANT ALL ON TABLE "public"."codes_livraison" TO "service_role";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."favoris" TO "authenticated";
GRANT ALL ON TABLE "public"."favoris" TO "service_role";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."feedbacks" TO "authenticated";
GRANT ALL ON TABLE "public"."feedbacks" TO "service_role";



GRANT UPDATE("status") ON TABLE "public"."feedbacks" TO "authenticated";



GRANT SELECT,MAINTAIN ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT UPDATE("statut") ON TABLE "public"."orders" TO "authenticated";



GRANT UPDATE("remise") ON TABLE "public"."orders" TO "authenticated";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."parametres_site" TO "authenticated";
GRANT ALL ON TABLE "public"."parametres_site" TO "service_role";
GRANT SELECT ON TABLE "public"."parametres_site" TO "anon";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."produits" TO "authenticated";
GRANT ALL ON TABLE "public"."produits" TO "service_role";
GRANT SELECT ON TABLE "public"."produits" TO "anon";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."produits_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."produits_notes" TO "service_role";



GRANT ALL ON TABLE "public"."promo_codes" TO "service_role";
GRANT SELECT ON TABLE "public"."promo_codes" TO "authenticated";



GRANT ALL ON TABLE "public"."retours" TO "service_role";
GRANT SELECT ON TABLE "public"."retours" TO "authenticated";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."stocks" TO "authenticated";
GRANT ALL ON TABLE "public"."stocks" TO "service_role";
GRANT SELECT ON TABLE "public"."stocks" TO "anon";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































