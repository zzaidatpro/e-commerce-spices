import { z } from 'zod';
import { Constants, Tables, TablesInsert, TablesUpdate } from '../types/db.types';

export const statutCommandeSchema = z.enum(Constants.public.Enums.statut_commande);

const uuidNullable = z.string().uuid().nullable();
const dateNullable = z.string().nullable();
const montantNullable = z.number().nonnegative().nullable();

// orders
export const orderSchema = z.object({
  id: z.string().uuid(),
  client_id: uuidNullable,
  adresse_liv_id: uuidNullable,
  statut: statutCommandeSchema,
  total: z.number(),
  remise: z.number().nonnegative(),
  created_at: z.string(),

  livreur_id: uuidNullable,
  designe_at: dateNullable,
  code_envoye_at: dateNullable,
  code_recu_at: dateNullable,
  acceptee_at: dateNullable,
  expediee_at: dateNullable,
  demarree_at: dateNullable,
  remise_at: dateNullable,
  montant_declare: montantNullable,
  montant_declare_at: dateNullable,

  encaissement_montant: montantNullable,
  encaissement_livreur_id: uuidNullable,
  encaissement_par: uuidNullable,
  encaissement_at: dateNullable,
  vente_confirmee_at: dateNullable,
  terminee_at: dateNullable,
}) satisfies z.ZodType<Tables<'orders'>>;

export const orderInsertSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: uuidNullable.optional(),
  adresse_liv_id: uuidNullable.optional(),
  statut: statutCommandeSchema.optional(),
  total: z.number().optional(),
  remise: z.number().nonnegative().optional(),
  created_at: z.string().optional(),
  livreur_id: uuidNullable.optional(),
  designe_at: dateNullable.optional(),
  code_envoye_at: dateNullable.optional(),
  code_recu_at: dateNullable.optional(),
  acceptee_at: dateNullable.optional(),
  expediee_at: dateNullable.optional(),
  demarree_at: dateNullable.optional(),
  remise_at: dateNullable.optional(),
  montant_declare: montantNullable.optional(),
  montant_declare_at: dateNullable.optional(),
  encaissement_montant: montantNullable.optional(),
  encaissement_livreur_id: uuidNullable.optional(),
  encaissement_par: uuidNullable.optional(),
  encaissement_at: dateNullable.optional(),
  vente_confirmee_at: dateNullable.optional(),
  terminee_at: dateNullable.optional(),
}) satisfies z.ZodType<TablesInsert<'orders'>>;

export const orderUpdateSchema = z.object({
  client_id: uuidNullable.optional(),
  adresse_liv_id: uuidNullable.optional(),
  statut: statutCommandeSchema.optional(),
  total: z.number().optional(),
  remise: z.number().nonnegative().optional(),
  livreur_id: uuidNullable.optional(),
  designe_at: dateNullable.optional(),
  code_envoye_at: dateNullable.optional(),
  code_recu_at: dateNullable.optional(),
  acceptee_at: dateNullable.optional(),
  expediee_at: dateNullable.optional(),
  demarree_at: dateNullable.optional(),
  remise_at: dateNullable.optional(),
  montant_declare: montantNullable.optional(),
  montant_declare_at: dateNullable.optional(),
  encaissement_montant: montantNullable.optional(),
  encaissement_livreur_id: uuidNullable.optional(),
  encaissement_par: uuidNullable.optional(),
  encaissement_at: dateNullable.optional(),
  vente_confirmee_at: dateNullable.optional(),
  terminee_at: dateNullable.optional(),
}) satisfies z.ZodType<TablesUpdate<'orders'>>;

// Ce que le staff peut modifier directement : statut libre, uniquement en amont
export const orderStaffUpdateSchema = z.object({
  statut: z.enum(['en_attente', 'payée', 'annulée']).optional(),
});

// order_items
export const orderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  produit_id: uuidNullable,
  quantite: z.number().int().positive(),
  prix_facture: z.number().nonnegative(),
}) satisfies z.ZodType<Tables<'order_items'>>;

export const orderItemInsertSchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid(),
  produit_id: uuidNullable.optional(),
  quantite: z.number().int().positive(),
  prix_facture: z.number().nonnegative(),
}) satisfies z.ZodType<TablesInsert<'order_items'>>;

export const orderItemUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  produit_id: uuidNullable.optional(),
  quantite: z.number().int().positive().optional(),
  prix_facture: z.number().nonnegative().optional(),
}) satisfies z.ZodType<TablesUpdate<'order_items'>>;