"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "./helper";
import { getAdminClient } from "@/lib-admin/supabase/admin";

export async function majStockAction(produitId: string, quantite: number) {
  const auth = await requireRole(["admin", "manager"]).catch(() => null);
  if (!auth) return { success: false, error: "Accès refusé." };

  if (!Number.isInteger(quantite) || quantite < 0) {
    return { success: false, error: "Quantité invalide." };
  }

  // Le manager ne peut pas écrire produits.stock via la RLS : écriture serveur, après contrôle
  const { error } = await getAdminClient().from("produits").update({ stock: quantite }).eq("id", produitId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/stock");
  return { success: true };
}
