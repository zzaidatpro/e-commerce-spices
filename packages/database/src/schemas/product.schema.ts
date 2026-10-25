import { z } from 'zod';
import { Tables, TablesInsert, TablesUpdate } from '../types/db.types';

// schema produit
export const productSchema = z.object({
  id: z.string().uuid(),
  nom: z.string(),
  description: z.string().nullable(),
  prix_unitaire: z.number(),
  stock: z.number(),
  image_url: z.string().nullable(),
  sku: z.string().nullable(),
  family: z.string().nullable(),
  region: z.string().nullable(),
  origin: z.string().nullable(),
  weight: z.string().nullable(),
  is_best_seller: z.boolean(),
  is_featured: z.boolean(),
  slug: z.string().nullable(),
  created_at: z.string(),
}) satisfies z.ZodType<Tables<'produits'>>;

export const productInsertSchema = z.object({
  id: z.string().uuid().optional(),
  nom: z.string(),
  description: z.string().nullable().optional(),
  prix_unitaire: z.number(),
  stock: z.number().optional(),
  image_url: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  family: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  is_best_seller: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  slug: z.string().nullable().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesInsert<'produits'>>;

export const productUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  nom: z.string().optional(),
  description: z.string().nullable().optional(),
  prix_unitaire: z.number().optional(),
  stock: z.number().optional(),
  image_url: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  family: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  is_best_seller: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  slug: z.string().nullable().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesUpdate<'produits'>>;

// stock
export const stockSchema = z.object({
  id: z.string().uuid(),
  produit_id: z.string().uuid(),
  quantite: z.number(),
  mis_a_jour_le: z.string(),
}) satisfies z.ZodType<Tables<'stocks'>>;

export const stockInsertSchema = z.object({
  id: z.string().uuid().optional(),
  produit_id: z.string().uuid(),
  quantite: z.number().optional(),
  mis_a_jour_le: z.string().optional(),
}) satisfies z.ZodType<TablesInsert<'stocks'>>;

export const stockUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  produit_id: z.string().uuid().optional(),
  quantite: z.number().optional(),
  mis_a_jour_le: z.string().optional(),
}) satisfies z.ZodType<TablesUpdate<'stocks'>>;