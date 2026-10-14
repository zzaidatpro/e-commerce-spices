import { z } from "zod";
import type { TablesInsert } from "../types";

const orderItemSchema = z.object({
  produit_id: z.string().uuid("ID de produit invalide"),
  quantite: z.coerce.number().int().positive("La quantité minimale est de 1"),
  prix_facture: z.coerce.number().positive("Le prix facturé doit être supérieur à 0"),
}) satisfies z.ZodType<Partial<TablesInsert<"order_items">>>;

export const orderSchema = z.object({
  client_id: z.string().uuid("ID client invalide").optional().nullable(),
  adresse_liv_id: z.string().uuid("ID adresse invalide").optional().nullable(),
  statut: z.enum(["en_attente", "payée", "expédiée", "livrée", "annulée"]).default("en_attente"),
  total: z.coerce.number().positive("Le total doit être supérieur à 0"),
  items: z.array(orderItemSchema).min(1, "La commande doit contenir au moins un article"),
})

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;