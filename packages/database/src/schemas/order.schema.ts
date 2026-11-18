import { z } from 'zod';
import { Constants, Tables, TablesInsert, TablesUpdate } from '../types/db.types';

export const statutCommandeSchema = z.enum(Constants.public.Enums.statut_commande);

const uuidNullable = z.string().uuid().nullable();
const dateNullable = z.string().nullable();

// orders
export const orderSchema = z.object({
  id: z.string().uuid(),
  client_id: uuidNullable,
  adresse_liv_id: uuidNullable,
  statut: statutCommandeSchema,
  total: z.number(),
  remise: z.number().nonnegative(),
  remise_at: dateNullable,
  expediee_at: dateNullable,
  livreur_id: uuidNullable,
  encaissement_montant: z.number().nullable(),
  encaissement_livreur_id: uuidNullable,
  encaissement_par: uuidNullable,
  encaissement_at: dateNullable,
  vente_confirmee_at: dateNullable,
  created_at: z.string(),
}) satisfies z.ZodType<Tables<'orders'>>;

export const orderInsertSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: uuidNullable.optional(),
  adresse_liv_id: uuidNullable.optional(),
  statut: statutCommandeSchema.optional(),
  total: z.number().optional(),
  remise: z.number().nonnegative().optional(),
  remise_at: dateNullable.optional(),
  expediee_at: dateNullable.optional(),
  livreur_id: uuidNullable.optional(),
  encaissement_montant: z.number().nullable().optional(),
  encaissement_livreur_id: uuidNullable.optional(),
  encaissement_par: uuidNullable.optional(),
  encaissement_at: dateNullable.optional(),
  vente_confirmee_at: dateNullable.optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesInsert<'orders'>>;

export const orderUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: uuidNullable.optional(),
  adresse_liv_id: uuidNullable.optional(),
  statut: statutCommandeSchema.optional(),
  total: z.number().optional(),
  remise: z.number().nonnegative().optional(),
  remise_at: dateNullable.optional(),
  expediee_at: dateNullable.optional(),
  livreur_id: uuidNullable.optional(),
  encaissement_montant: z.number().nullable().optional(),
  encaissement_livreur_id: uuidNullable.optional(),
  encaissement_par: uuidNullable.optional(),
  encaissement_at: dateNullable.optional(),
  vente_confirmee_at: dateNullable.optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesUpdate<'orders'>>;

// Champs qu'un membre du staff peut modifier directement.
// Le reste (remise, livreur, encaissement, dates de flux) passe par les fonctions dédiées.
export const orderStaffUpdateSchema = z.object({
  statut: z.enum(['en_attente', 'payée', 'annulée']).optional(),
});

// orders items
export const orderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  produit_id: z.string().uuid().nullable(),
  quantite: z.number(),
  prix_facture: z.number(),
}) satisfies z.ZodType<Tables<'order_items'>>;

export const orderItemInsertSchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid(),
  produit_id: z.string().uuid().nullable().optional(),
  quantite: z.number(),
  prix_facture: z.number(),
}) satisfies z.ZodType<TablesInsert<'order_items'>>;

export const orderItemUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  produit_id: z.string().uuid().nullable().optional(),
  quantite: z.number().optional(),
  prix_facture: z.number().optional(),
}) satisfies z.ZodType<TablesUpdate<'order_items'>>;