export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      adresses_livraison: {
        Row: {
          adresse_complete: string;
          created_at: string;
          id: string;
          latitude: number | null;
          longitude: number | null;
          profile_id: string;
          type_lieu: Database['public']['Enums']['type_emplacement'];
          url_google_maps: string | null;
        };
        ComputedFields: never;
        Insert: {
          adresse_complete: string;
          created_at?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          profile_id: string;
          type_lieu?: Database['public']['Enums']['type_emplacement'];
          url_google_maps?: string | null;
        };
        Update: {
          adresse_complete?: string;
          created_at?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          profile_id?: string;
          type_lieu?: Database['public']['Enums']['type_emplacement'];
          url_google_maps?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'adresses_livraison_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      codes_livraison: {
        Row: {
          code_hash: string;
          created_at: string;
          envoye_au_livreur_at: string | null;
          expires_at: string;
          order_id: string;
          tentatives: number;
          used_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          code_hash: string;
          created_at?: string;
          envoye_au_livreur_at?: string | null;
          expires_at: string;
          order_id: string;
          tentatives?: number;
          used_at?: string | null;
        };
        Update: {
          code_hash?: string;
          created_at?: string;
          envoye_au_livreur_at?: string | null;
          expires_at?: string;
          order_id?: string;
          tentatives?: number;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'codes_livraison_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: true;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      demandes_code: {
        Row: {
          demande_at: string;
          demande_par: string;
          id: string;
          order_id: string;
          traitee_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          demande_at?: string;
          demande_par: string;
          id?: string;
          order_id: string;
          traitee_at?: string | null;
        };
        Update: {
          demande_at?: string;
          demande_par?: string;
          id?: string;
          order_id?: string;
          traitee_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'demandes_code_demande_par_fkey';
            columns: ['demande_par'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'demandes_code_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      favoris: {
        Row: {
          created_at: string;
          produit_id: string;
          profile_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          produit_id: string;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          produit_id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favoris_produit_id_fkey';
            columns: ['produit_id'];
            isOneToOne: false;
            referencedRelation: 'produits';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favoris_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      feedbacks: {
        Row: {
          created_at: string;
          from_profile_id: string;
          id: string;
          message: string;
          status: string;
          subject: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          from_profile_id: string;
          id?: string;
          message: string;
          status?: string;
          subject: string;
        };
        Update: {
          created_at?: string;
          from_profile_id?: string;
          id?: string;
          message?: string;
          status?: string;
          subject?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedbacks_from_profile_id_fkey';
            columns: ['from_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          prix_facture: number;
          produit_id: string | null;
          quantite: number;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          order_id: string;
          prix_facture: number;
          produit_id?: string | null;
          quantite: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          prix_facture?: number;
          produit_id?: string | null;
          quantite?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_produit_id_fkey';
            columns: ['produit_id'];
            isOneToOne: false;
            referencedRelation: 'produits';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          adresse_liv_id: string | null;
          client_id: string | null;
          created_at: string;
          encaissement_at: string | null;
          encaissement_livreur_id: string | null;
          encaissement_montant: number | null;
          encaissement_par: string | null;
          expediee_at: string | null;
          id: string;
          livreur_id: string | null;
          remise: number;
          remise_at: string | null;
          statut: Database['public']['Enums']['statut_commande'];
          total: number;
          vente_confirmee_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          adresse_liv_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          encaissement_at?: string | null;
          encaissement_livreur_id?: string | null;
          encaissement_montant?: number | null;
          encaissement_par?: string | null;
          expediee_at?: string | null;
          id?: string;
          livreur_id?: string | null;
          remise?: number;
          remise_at?: string | null;
          statut?: Database['public']['Enums']['statut_commande'];
          total?: number;
          vente_confirmee_at?: string | null;
        };
        Update: {
          adresse_liv_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          encaissement_at?: string | null;
          encaissement_livreur_id?: string | null;
          encaissement_montant?: number | null;
          encaissement_par?: string | null;
          expediee_at?: string | null;
          id?: string;
          livreur_id?: string | null;
          remise?: number;
          remise_at?: string | null;
          statut?: Database['public']['Enums']['statut_commande'];
          total?: number;
          vente_confirmee_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_adresse_liv_id_fkey';
            columns: ['adresse_liv_id'];
            isOneToOne: false;
            referencedRelation: 'adresses_livraison';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_encaissement_livreur_id_fkey';
            columns: ['encaissement_livreur_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_encaissement_par_fkey';
            columns: ['encaissement_par'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_livreur_id_fkey';
            columns: ['livreur_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      parametres_site: {
        Row: {
          cle: string;
          libelle: string;
          updated_at: string;
          updated_by: string | null;
          valeur: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          cle: string;
          libelle: string;
          updated_at?: string;
          updated_by?: string | null;
          valeur: NonNullable<Json>;
        };
        Update: {
          cle?: string;
          libelle?: string;
          updated_at?: string;
          updated_by?: string | null;
          valeur?: NonNullable<Json>;
        };
        Relationships: [
          {
            foreignKeyName: 'parametres_site_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      produits: {
        Row: {
          created_at: string;
          description: string | null;
          family: string | null;
          id: string;
          image_url: string | null;
          is_best_seller: boolean;
          is_featured: boolean;
          nom: string;
          origin: string | null;
          prix_unitaire: number;
          region: string | null;
          sku: string | null;
          slug: string | null;
          stock: number;
          weight: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          family?: string | null;
          id?: string;
          image_url?: string | null;
          is_best_seller?: boolean;
          is_featured?: boolean;
          nom: string;
          origin?: string | null;
          prix_unitaire: number;
          region?: string | null;
          sku?: string | null;
          slug?: string | null;
          stock?: number;
          weight?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          family?: string | null;
          id?: string;
          image_url?: string | null;
          is_best_seller?: boolean;
          is_featured?: boolean;
          nom?: string;
          origin?: string | null;
          prix_unitaire?: number;
          region?: string | null;
          sku?: string | null;
          slug?: string | null;
          stock?: number;
          weight?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          code_livreur: string | null;
          created_at: string;
          date_naissance: string | null;
          email: string | null;
          id: string;
          nom: string;
          peut_generer_promo: boolean;
          prenom: string;
          role: Database['public']['Enums']['type_role'];
          status: Database['public']['Enums']['statut_profil'];
          telephone: string | null;
          whatsapp: string | null;
        };
        ComputedFields: never;
        Insert: {
          code_livreur?: string | null;
          created_at?: string;
          date_naissance?: string | null;
          email?: string | null;
          id: string;
          nom: string;
          peut_generer_promo?: boolean;
          prenom: string;
          role?: Database['public']['Enums']['type_role'];
          status?: Database['public']['Enums']['statut_profil'];
          telephone?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          code_livreur?: string | null;
          created_at?: string;
          date_naissance?: string | null;
          email?: string | null;
          id?: string;
          nom?: string;
          peut_generer_promo?: boolean;
          prenom?: string;
          role?: Database['public']['Enums']['type_role'];
          status?: Database['public']['Enums']['statut_profil'];
          telephone?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      promo_codes: {
        Row: {
          code: string;
          created_at: string;
          expires_at: string;
          id: string;
          order_id: string | null;
          pourcentage: number;
          profile_id: string;
          used_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          code: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          order_id?: string | null;
          pourcentage: number;
          profile_id: string;
          used_at?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          order_id?: string | null;
          pourcentage?: number;
          profile_id?: string;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'promo_codes_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'promo_codes_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      rates: {
        Row: {
          client_id: string;
          commentaire: string | null;
          created_at: string;
          id: string;
          note: number;
          produit_id: string;
          publie: boolean;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          client_id: string;
          commentaire?: string | null;
          created_at?: string;
          id?: string;
          note: number;
          produit_id: string;
          publie?: boolean;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          commentaire?: string | null;
          created_at?: string;
          id?: string;
          note?: number;
          produit_id?: string;
          publie?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rates_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rates_produit_id_fkey';
            columns: ['produit_id'];
            isOneToOne: false;
            referencedRelation: 'produits';
            referencedColumns: ['id'];
          },
        ];
      };
      retours: {
        Row: {
          decide_at: string | null;
          decide_par: string | null;
          demande_at: string;
          demande_par: string | null;
          id: string;
          montant_rembourse: number | null;
          motif: string;
          order_id: string;
          reference_paiement: string | null;
          rembourse_at: string | null;
          statut: string;
          stock_remis: boolean;
        };
        ComputedFields: never;
        Insert: {
          decide_at?: string | null;
          decide_par?: string | null;
          demande_at?: string;
          demande_par?: string | null;
          id?: string;
          montant_rembourse?: number | null;
          motif: string;
          order_id: string;
          reference_paiement?: string | null;
          rembourse_at?: string | null;
          statut?: string;
          stock_remis?: boolean;
        };
        Update: {
          decide_at?: string | null;
          decide_par?: string | null;
          demande_at?: string;
          demande_par?: string | null;
          id?: string;
          montant_rembourse?: number | null;
          motif?: string;
          order_id?: string;
          reference_paiement?: string | null;
          rembourse_at?: string | null;
          statut?: string;
          stock_remis?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'retours_decide_par_fkey';
            columns: ['decide_par'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'retours_demande_par_fkey';
            columns: ['demande_par'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'retours_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      stocks: {
        Row: {
          id: string;
          mis_a_jour_le: string;
          produit_id: string;
          quantite: number;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          mis_a_jour_le?: string;
          produit_id: string;
          quantite?: number;
        };
        Update: {
          id?: string;
          mis_a_jour_le?: string;
          produit_id?: string;
          quantite?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'stocks_produit_id_fkey';
            columns: ['produit_id'];
            isOneToOne: true;
            referencedRelation: 'produits';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      avis_publics: {
        Row: {
          auteur: string | null;
          commentaire: string | null;
          created_at: string;
          id: string;
          note: number;
          produit_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: 'rates_produit_id_fkey';
            columns: ['produit_id'];
            isOneToOne: false;
            referencedRelation: 'produits';
            referencedColumns: ['id'];
          },
        ];
      };
      produits_notes: {
        Row: {
          n1: number | null;
          n2: number | null;
          n3: number | null;
          n4: number | null;
          n5: number | null;
          nb_avis: number | null;
          note_moyenne: number | null;
          produit_id: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: 'rates_produit_id_fkey';
            columns: ['produit_id'];
            isOneToOne: false;
            referencedRelation: 'produits';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      a_achete_produit: { Args: { p_produit_id: string }; Returns: boolean };
      classement_favoris: {
        Args: { p_limit?: number };
        Returns: {
          family: string;
          image_url: string;
          nb_favoris: number;
          nom: string;
          produit_id: string;
          stock: number;
        }[];
      };
      commandes_a_relancer: {
        Args: Record<PropertyKey, never>;
        Returns: {
          client_email: string;
          client_nom: string;
          client_prenom: string;
          client_telephone: string;
          client_whatsapp: string;
          code_expire_at: string;
          expediee_depuis: string;
          order_id: string;
          total: number;
        }[];
      };
      commandes_eligibles_retour: {
        Args: Record<PropertyKey, never>;
        Returns: {
          client_nom: string;
          client_prenom: string;
          commande_id: string;
          confirmee_le: string;
          jours_restants: number;
          total_commande: number;
        }[];
      };
      confirmer_livraison: { Args: { p_code: string; p_order: string }; Returns: Json };
      contact_client_commande: {
        Args: { p_order: string };
        Returns: {
          email: string;
          nom: string;
          prenom: string;
          telephone: string;
          whatsapp: string;
        }[];
      };
      create_order: {
        Args: {
          p_adresse: string;
          p_items: Json;
          p_type_lieu: Database['public']['Enums']['type_emplacement'];
          p_url: string;
        };
        Returns: string;
      };
      decider_retour: { Args: { p_accepte: boolean; p_retour: string }; Returns: undefined };
      demander_nouveau_code: { Args: { p_order: string }; Returns: Json };
      demander_retour: { Args: { p_motif: string; p_order: string }; Returns: string };
      designer_livreur: { Args: { p_livreur: string; p_order: string }; Returns: undefined };
      enregistrer_encaissement: {
        Args: { p_code_livreur: string; p_montant: number; p_order: string };
        Returns: undefined;
      };
      est_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      est_livreur: { Args: Record<PropertyKey, never>; Returns: boolean };
      est_staff: { Args: Record<PropertyKey, never>; Returns: boolean };
      etat_code_livraison: {
        Args: { p_order: string };
        Returns: {
          envoye_at: string;
          existe: boolean;
          expires_at: string;
        }[];
      };
      expedier_commande: { Args: { p_livreur: string; p_order: string }; Returns: undefined };
      generer_code_livraison: { Args: { p_order: string }; Returns: string };
      generer_code_livreur: { Args: Record<PropertyKey, never>; Returns: string };
      generer_codes_promo: { Args: Record<PropertyKey, never>; Returns: number };
      is_admin_or_livreur: { Args: { allowed_roles: string[] }; Returns: boolean };
      liste_clients: {
        Args: Record<PropertyKey, never>;
        Returns: {
          created_at: string;
          email: string;
          id: string;
          nb_commandes: number;
          nom: string;
          prenom: string;
          status: string;
          telephone: string;
          whatsapp: string;
        }[];
      };
      liste_livreurs: {
        Args: Record<PropertyKey, never>;
        Returns: {
          code_livreur: string;
          id: string;
          nom: string;
          prenom: string;
          telephone: string;
        }[];
      };
      livreur_peut_voir_adresse: { Args: { p_addr: string }; Returns: boolean };
      marquer_code_envoye: { Args: { p_order: string }; Returns: undefined };
      meilleures_ventes: {
        Args: { p_limit?: number; p_periode?: string; p_ref?: string };
        Returns: {
          chiffre_affaires: number;
          family: string;
          image_url: string;
          nb_commandes: number;
          nom: string;
          produit_id: string;
          quantite_vendue: number;
        }[];
      };
      mon_role: { Args: Record<PropertyKey, never>; Returns: string };
      mon_statut: { Args: Record<PropertyKey, never>; Returns: string };
      peut_generer_promo: { Args: Record<PropertyKey, never>; Returns: boolean };
      rembourser_retour: {
        Args: { p_montant: number; p_reference: string; p_retour: string; p_stock_remis: boolean };
        Returns: undefined;
      };
      tableau_de_bord: { Args: Record<PropertyKey, never>; Returns: Json };
      valider_et_payer_commande: { Args: { p_order_id: string }; Returns: undefined };
      ventes_par_jour: {
        Args: { p_mois?: string };
        Returns: {
          chiffre_affaires: number;
          jour: string;
          nb_commandes: number;
        }[];
      };
    };
    Enums: {
      statut_commande:
        | 'en_attente'
        | 'pay├⌐e'
        | 'exp├⌐di├⌐e'
        | 'livr├⌐e'
        | 'annul├⌐e'
        | 'confirm├⌐e'
        | 'rembours├⌐e';
      statut_profil: 'pending' | 'approved' | 'blocked';
      type_emplacement: 'maison' | 'magasin' | 'depot';
      type_role: 'client' | 'admin' | 'livreur' | 'manager';
      user_role: 'client' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      statut_commande: [
        'en_attente',
        'pay├⌐e',
        'exp├⌐di├⌐e',
        'livr├⌐e',
        'annul├⌐e',
        'confirm├⌐e',
        'rembours├⌐e',
      ],
      statut_profil: ['pending', 'approved', 'blocked'],
      type_emplacement: ['maison', 'magasin', 'depot'],
      type_role: ['client', 'admin', 'livreur', 'manager'],
      user_role: ['client', 'admin'],
    },
  },
} as const;
