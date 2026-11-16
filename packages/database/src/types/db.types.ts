export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
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
          expires_at: string;
          order_id: string;
          tentatives: number;
          used_at: string | null;
        };
        Insert: {
          code_hash: string;
          created_at?: string;
          expires_at: string;
          order_id: string;
          tentatives?: number;
          used_at?: string | null;
        };
        Update: {
          code_hash?: string;
          created_at?: string;
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
      favoris: {
        Row: {
          created_at: string;
          produit_id: string;
          profile_id: string;
        };
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
          expediee_at: string | null;
          id: string;
          remise: number;
          statut: Database['public']['Enums']['statut_commande'];
          total: number;
        };
        Insert: {
          adresse_liv_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          expediee_at?: string | null;
          id?: string;
          remise?: number;
          statut?: Database['public']['Enums']['statut_commande'];
          total?: number;
        };
        Update: {
          adresse_liv_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          expediee_at?: string | null;
          id?: string;
          remise?: number;
          statut?: Database['public']['Enums']['statut_commande'];
          total?: number;
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
        ];
      };
      parametres_site: {
        Row: {
          cle: string;
          libelle: string;
          updated_at: string;
          updated_by: string | null;
          valeur: Json;
        };
        Insert: {
          cle: string;
          libelle: string;
          updated_at?: string;
          updated_by?: string | null;
          valeur: Json;
        };
        Update: {
          cle?: string;
          libelle?: string;
          updated_at?: string;
          updated_by?: string | null;
          valeur?: Json;
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
          created_at: string;
          date_naissance: string | null;
          email: string | null;
          id: string;
          nom: string;
          prenom: string;
          role: Database['public']['Enums']['type_role'];
          status: string;
          telephone: string | null;
          whatsapp: string | null;
        };
        Insert: {
          created_at?: string;
          date_naissance?: string | null;
          email?: string | null;
          id: string;
          nom: string;
          prenom: string;
          role?: Database['public']['Enums']['type_role'];
          status?: string;
          telephone?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          created_at?: string;
          date_naissance?: string | null;
          email?: string | null;
          id?: string;
          nom?: string;
          prenom?: string;
          role?: Database['public']['Enums']['type_role'];
          status?: string;
          telephone?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [];
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
      stocks: {
        Row: {
          id: string;
          mis_a_jour_le: string;
          produit_id: string;
          quantite: number;
        };
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
          created_at: string | null;
          id: string | null;
          note: number | null;
          produit_id: string | null;
          updated_at: string | null;
        };
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
          produit_id: string | null;
        };
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
      commandes_a_relancer: {
        Args: never;
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
      confirmer_livraison: {
        Args: { p_code: string; p_order: string };
        Returns: Json;
      };
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
      est_admin: { Args: never; Returns: boolean };
      est_staff: { Args: never; Returns: boolean };
      generer_code_livraison: { Args: { p_order: string }; Returns: string };
      is_admin_or_livreur: {
        Args: { allowed_roles: string[] };
        Returns: boolean;
      };
      liste_clients: {
        Args: never;
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
      mon_role: { Args: never; Returns: string };
      mon_statut: { Args: never; Returns: string };
      valider_et_payer_commande: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      statut_commande: 'en_attente' | 'payée' | 'expediée' | 'livrée' | 'annulée';
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      statut_commande: ['en_attente', 'payée', 'expediée', 'livrée', 'annulée'],
      statut_profil: ['pending', 'approved', 'blocked'],
      type_emplacement: ['maison', 'magasin', 'depot'],
      type_role: ['client', 'admin', 'livreur', 'manager'],
      user_role: ['client', 'admin'],
    },
  },
} as const;
