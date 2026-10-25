import { z } from 'zod';
import { Tables, TablesInsert, TablesUpdate } from '../types/db.types';

export const typeEmplacementSchema = z.enum(['maison', 'magasin', 'depot']);

export const addressSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  adresse_complete: z.string(),
  type_lieu: typeEmplacementSchema,
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  url_google_maps: z.string().nullable(),
  created_at: z.string(),
}) satisfies z.ZodType<Tables<'adresses_livraison'>>;

export const addressInsertSchema = z.object({
  id: z.string().uuid().optional(),
  profile_id: z.string().uuid(),
  adresse_complete: z.string(),
  type_lieu: typeEmplacementSchema.optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  url_google_maps: z.string().nullable().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesInsert<'adresses_livraison'>>;

export const addressUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  profile_id: z.string().uuid().optional(),
  adresse_complete: z.string().optional(),
  type_lieu: typeEmplacementSchema.optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  url_google_maps: z.string().nullable().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesUpdate<'adresses_livraison'>>;