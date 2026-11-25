"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "./helper";
import { STATUTS_STAFF, type StatutStaff } from "@/lib-admin/commandes";

export async function changerStatutAction(orderId: string, statut: string) {
  const auth = await requireRole(["admin", "manager"]).catch(() => null);
  if (!auth) return { error: "Accès refusé." };

  if (!STATUTS_STAFF.includes(statut as StatutStaff)) {
    return { error: "Statut non autorisé. La livraison est confirmée par le client." };
  }

  const { error } = await auth.supabase.from("orders").update({ statut }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function appliquerRemiseAction(orderId: string, formData: FormData) {
  const auth = await requireRole(["admin"]).catch(() => null);
  if (!auth) return { error: "Accès refusé." };

  const remise = Number(formData.get("remise"));
  if (!Number.isFinite(remise) || remise < 0) return { error: "Remise invalide." };

  const { error } = await auth.supabase.from("orders").update({ remise }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export type ResultatAction<T extends object = {}> = ({ success: true } & T) | { error: string };

export async function genererCodeAction(orderId: string) {
  const auth = await requireRole(["admin", "manager"]).catch(() => null);
  if (!auth) return { error: "Accès refusé." };

  const { data, error } = await auth.supabase.rpc("generer_code_livraison", { p_order: orderId });
  if (error) return { error: error.message };

  return { success: true, code: String(data) };
}
