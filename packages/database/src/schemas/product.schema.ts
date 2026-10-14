import { z } from "zod";
import type { TablesInsert } from "../types";

export const productSchema = z.object({
  nom: z.string().min(2, "Le nom du produit est requis"),
  description: z.string().min(10, "La description est trop courte").optional().nullable(),
  prix_unitaire: z.coerce.number().positive("Le prix unitaire doit être supérieur à 0"),
  sku: z.string().optional().nullable(),
  image_url: z.string().url("URL d'image invalide").optional().nullable(),
}) satisfies z.ZodType<Partial<TablesInsert<"produits">>>;

export type ProductInput = z.infer<typeof productSchema>;