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
  status: z.string(), 
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
  status: z.string().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesInsert<'profiles'>>;

export const profileUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  date_naissance: z.string().nullable().optional(),
  role: typeRoleSchema.optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
}) satisfies z.ZodType<TablesUpdate<'profiles'>>;