
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'client'::type_role,
  telephone text,
  whatsapp text,
  date_naissance date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.adresses_livraison (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  type_lieu USER-DEFINED NOT NULL DEFAULT 'maison'::type_emplacement,
  adresse_complete text NOT NULL,
  url_google_maps text,
  longitude numeric,
  latitude numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT adresses_livraison_pkey PRIMARY KEY (id),
  CONSTRAINT adresses_livraison_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.produits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text,
  prix_unitaire numeric NOT NULL CHECK (prix_unitaire >= 0::numeric),
  sku text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  image_url text,
  origin text,
  weight text,
  stock integer NOT NULL DEFAULT 0,
  region text,
  family text,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  slug text UNIQUE,
  CONSTRAINT produits_pkey PRIMARY KEY (id)
);
CREATE TABLE public.stocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  produit_id uuid NOT NULL UNIQUE,
  quantite integer NOT NULL DEFAULT 0 CHECK (quantite >= 0),
  mis_a_jour_le timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stocks_pkey PRIMARY KEY (id),
  CONSTRAINT stocks_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid,
  adresse_liv_id uuid,
  statut USER-DEFINED NOT NULL DEFAULT 'en_attente'::statut_commande,
  total numeric NOT NULL DEFAULT 0.00 CHECK (total >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  remise numeric NOT NULL DEFAULT 0 CHECK (remise >= 0::numeric),
  expediee_at timestamp with time zone,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_adresse_liv_id_fkey FOREIGN KEY (adresse_liv_id) REFERENCES public.adresses_livraison(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  produit_id uuid,
  quantite integer NOT NULL CHECK (quantite > 0),
  prix_facture numeric NOT NULL CHECK (prix_facture >= 0::numeric),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id)
);
CREATE TABLE public.rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  produit_id uuid NOT NULL,
  client_id uuid NOT NULL,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  publie boolean NOT NULL DEFAULT true,
  CONSTRAINT rates_pkey PRIMARY KEY (id),
  CONSTRAINT rates_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id),
  CONSTRAINT rates_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.favoris (
  profile_id uuid NOT NULL,
  produit_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT favoris_pkey PRIMARY KEY (profile_id, produit_id),
  CONSTRAINT favoris_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT favoris_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id)
);
CREATE TABLE public.feedbacks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_profile_id uuid NOT NULL,
  subject text NOT NULL CHECK (char_length(subject) >= 3 AND char_length(subject) <= 150),
  message text NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'read'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedbacks_pkey PRIMARY KEY (id),
  CONSTRAINT feedbacks_from_profile_id_fkey FOREIGN KEY (from_profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.parametres_site (
  cle text NOT NULL,
  valeur jsonb NOT NULL,
  libelle text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT parametres_site_pkey PRIMARY KEY (cle),
  CONSTRAINT parametres_site_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.codes_livraison (
  order_id uuid NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  tentatives integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT codes_livraison_pkey PRIMARY KEY (order_id),
  CONSTRAINT codes_livraison_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

