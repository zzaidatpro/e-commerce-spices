import { z } from "zod";
import type { TablesInsert } from "../types";

// Formulaire détaillé côté UI
export const addressFormSchema = z.object({
  numero: z.string().min(1, "Le numéro est requis"),
  rue: z.string().min(3, "La rue est requise"),
  commune: z.string().min(2, "La commune est requise"),
  ville: z.string().min(2, "La ville est requise"),
  type_lieu: z.enum(["maison", "magasin", "dépôt"]).default("maison"),
  url_google_maps: z.string().url("URL Google Maps invalide").optional().or(z.literal("")),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

// Schéma complet validé pour Supabase
export const addressSchema = z.object({
  profile_id: z.string().uuid("ID de profil invalide"),
  adresse_complete: z.string().min(5, "L'adresse complète est requise"),
  type_lieu: z.enum(["maison", "magasin", "dépôt"]).default("maison"),
  url_google_maps: z.string().url().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
}) 

export type AddressFormInput = z.infer<typeof addressFormSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

/**
 * Utilitaire pour transformer le formulaire détaillé en chaîne unique `adresse_complete`
 */
export function formatCompleteAddress(data: AddressFormInput): string {
  const parts = [`N° ${data.numero}`, data.rue, data.commune, data.ville];
  return parts.filter(Boolean).join(", ");
}