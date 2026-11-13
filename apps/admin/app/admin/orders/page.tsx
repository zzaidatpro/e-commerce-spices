import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ShoppingBag, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import UpdateOrderStatusForm from "@/components/molecules/UpdateOrderStatusForm"; // Composant client pour modifier le statut

export const revalidate = 0;

export default async function OrdersManagementPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  // Récupérer les commandes avec les informations de profil associées si disponibles
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles:user_id (email, name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-xs">
        Erreur lors du chargement des commandes : {error.message}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3" /> Livrée
          </span>
        );
      case "shipped":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-bold">
            <Truck className="w-3 h-3" /> Expédiée
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-[10px] font-bold">
            <XCircle className="w-3 h-3" /> Annulée
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-bold">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Gestion des Commandes</h1>
        <p className="text-xs text-muted-foreground">
          Suivez et mettez à jour le statut des commandes clients en temps réel.
        </p>
      </div>

      {/* Tableau des commandes */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
              <th className="p-4">ID Commande</th>
              <th className="p-4">Client</th>
              <th className="p-4">Total</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions / Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono font-semibold text-foreground">#{order.id.slice(0, 8)}</td>
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{order.profiles?.name || "Client e-commerce"}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {order.profiles?.email || order.shipping_email || "Email non renseigné"}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-foreground">{Number(order.total_amount || 0).toFixed(2)} €</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4 text-right">
                    {/* Formulaire interactif pour modifier le statut */}
                    <UpdateOrderStatusForm orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Aucune commande enregistrée pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
