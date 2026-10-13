import { InsertTables } from "src/types";
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Le nom du produit est requis (min 2 caractères)"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0"),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif"),
  category: z.string().min(1, "La catégorie est requise"),
})satisfies z.ZodType<Partial<InsertTables<"produits">>>;

export type ProductInput = z.infer<typeof productSchema>;