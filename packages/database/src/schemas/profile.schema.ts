import { z } from "zod";
import type { TablesInsert, TablesUpdate } from "../types";

export const profileSchema = z.object({
  id: z.string().uuid("ID utilisateur invalide"),
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le prénom est requis"),
  telephone: z.string().min(10, "Numéro de téléphone invalide").optional().nullable(),
  whatsapp: z.string().min(10, "Numéro WhatsApp invalide").optional().nullable(),
  date_naissance: z.string().optional().nullable(),
  role: z.enum(["client", "admin", "livreur"]).default("client"),
}) satisfies z.ZodType<Partial<TablesInsert<"profiles">>>;

export const profileUpdateSchema = profileSchema.partial() satisfies z.ZodType<Partial<TablesUpdate<"profiles">>>;

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;