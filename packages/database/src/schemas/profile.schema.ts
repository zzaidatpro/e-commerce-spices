import { z } from 'zod';
import { Constants, Tables, TablesInsert, TablesUpdate } from '../types/db.types';

export const typeRoleSchema = z.enum(Constants.public.Enums.type_role);
export const statutProfilSchema = z.enum(Constants.public.Enums.statut_profil);

export const profileSchema = z.object({
  id: z.string().uuid(),
  nom: z.string(),
  prenom: z.string(),
  email: z.string().nullable(),
  telephone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  date_naissance: z.string().nullable(),
  role: typeRoleSchema,
  status: statutProfilSchema,
  code_livreur: z.string().length(6).nullable(),
  peut_generer_promo: z.boolean(),
  created_at: z.string(),
}) satisfies z.ZodType<Tables<'profiles'>>;

export const profileInsertSchema = z.object({
  id: z.string().uuid(),
  nom: z.string(),
  prenom: z.string(),
  email: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  date_naissance: z.string().nullable().optional(),
  role: typeRoleSchema.optional(),
  status: statutProfilSchema.optional(),
  peut_generer_promo: z.boolean().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesInsert<'profiles'>>;

// code_livreur n'est jamais modifiable : il est généré par trigger et figé
export const profileUpdateSchema = z.object({
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  date_naissance: z.string().nullable().optional(),
  role: typeRoleSchema.optional(),
  status: statutProfilSchema.optional(),
  peut_generer_promo: z.boolean().optional(),
}) satisfies z.ZodType<TablesUpdate<'profiles'>>;