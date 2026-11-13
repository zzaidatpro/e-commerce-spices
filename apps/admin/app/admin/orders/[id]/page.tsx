import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ArrowLeft, Package, User, MapPin, Calendar, CreditCard } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(process.env.NEXT_SUPABASE_URL!, process.env.NEXT_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  // 1. Récupérer les détails de la commande avec le profil client associé
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles:user_id (name, email)
    `,
    )
    .eq("id", id)
    .single();

  // 2. Récupérer les articles associés à cette commande (table de liaison order_items + produits)
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
      *,
      products:product_id (name, image_url, price)
    `,
    )
    .eq("order_id", id);

  if (orderError || !order) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-destructive font-medium mb-4">Commande introuvable ou erreur de chargement.</p>
        <Link href="/admin/orders" className="text-xs text-shop-orange hover:underline">
          &larr; Retour à la liste des commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Bouton de retour et titre */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux commandes</span>
        </Link>
        <span className="font-mono text-xs font-bold px-3 py-1 bg-muted rounded-full">ID: #{order.id}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne principale : Articles achetés */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="border border-border rounded-2xl bg-card p-6">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-shop-orange" />
              Articles de la commande
            </h2>

            <div className="divide-y divide-border">
              {items && items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products?.name || "Produit"}
                          className="w-12 h-12 object-cover rounded-lg border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          {item.products?.name || "Produit personnalisé / supprimé"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Quantité : {item.quantity} × {Number(item.price_at_purchase || 0).toFixed(2)} €
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {(item.quantity * Number(item.price_at_purchase || 0)).toFixed(2)} €
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Aucun article trouvé pour cette commande.
                </p>
              )}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between font-bold text-sm">
              <span>Total général</span>
              <span className="text-shop-orange">{Number(order.total_amount || 0).toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Colonne latérale : Infos client et livraison */}
        <div className="flex flex-col gap-6">
          {/* Informations Client */}
          <div className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-shop-orange" />
              Client
            </h3>
            <div className="text-xs flex flex-col gap-1 text-muted-foreground">
              <span className="font-semibold text-foreground">{order.profiles?.name || "Client e-commerce"}</span>
              <span>{order.profiles?.email || order.shipping_email || "Non renseigné"}</span>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-shop-orange" />
              Adresse de livraison
            </h3>
            <div className="text-xs text-muted-foreground">
              <p>{order.shipping_address || "Adresse non spécifiée"}</p>
              <p>
                {order.shipping_city} {order.shipping_postal_code}
              </p>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-shop-orange" />
              <span>{new Date(order.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-shop-orange" />
              <span className="capitalize">
                Statut : <strong className="text-foreground">{order.status}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
