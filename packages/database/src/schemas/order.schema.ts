import { z } from 'zod';
import { Tables, TablesInsert, TablesUpdate } from '../types/db.types';

export const statutCommandeSchema = z.enum(['en_attente', 'payee', 'expediee', 'livree', 'annulee']);

// orders
export const orderSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid().nullable(),
  adresse_liv_id: z.string().uuid().nullable(),
  statut: statutCommandeSchema,
  total: z.number(),
  created_at: z.string(),
}) satisfies z.ZodType<Tables<'orders'>>;

export const orderInsertSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid().nullable().optional(),
  adresse_liv_id: z.string().uuid().nullable().optional(),
  statut: statutCommandeSchema.optional(),
  total: z.number().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesInsert<'orders'>>;

export const orderUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid().nullable().optional(),
  adresse_liv_id: z.string().uuid().nullable().optional(),
  statut: statutCommandeSchema.optional(),
  total: z.number().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesUpdate<'orders'>>;

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