'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, Truck, Eye } from 'lucide-react';

export interface OrderRecord {
  id: string;
  slug?: string;
  created_at: string;
  status: string;
  total_amount: number;
}

interface OrderHistoryMoleculeProps {
  orders?: OrderRecord[];
}

export const OrderHistoryMolecule = ({ orders = [] }: OrderHistoryMoleculeProps) => {
    const getStatusBadge = (statut: string) => {
    const s = statut?.toLowerCase();

    // 🟢 Commande confirmée par l'admin -> Badge vert "Commande saisie"
    if (s === 'confirmed' || s === 'completed' || s === 'saisie' || s === 'livré') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Commande saisie
        </span>
      );
    }

    // 🔵 Commande expédiée
    if (s === 'shipped' || s === 'expédié' || s === 'expedie') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
          <Truck className="w-3 h-3" /> Expédié
        </span>
      );
    }

    // 🟠 Commande en attente (statut par défaut ou 'pending')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> En attente
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-background border border-border/80 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-shop-orange" />
          <h2 className="text-sm font-bold text-foreground">Historique des commandes</h2>
        </div>
        <span className="text-xs text-muted-foreground">{orders.length} commande(s)</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          Aucune commande enregistrée pour le moment.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const targetSlug = order.slug || order.id;
            const formattedDate = new Date(order.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-secondary/20 border border-border/60 rounded-xl hover:border-border transition-colors text-left gap-2"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground">
                    #{order.slug || order.id.slice(0, 8)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{formattedDate}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-shop-orange">
                    {order.total_amount?.toLocaleString('fr-FR')} DZD
                  </span>
                  
                  {/* Badge de statut dynamiquement mis à jour */}
                  {getStatusBadge(order.status)}

                  {/* Bouton sécurisé "Voir ma commande" */}
                  <Link
                    href={`/orders/${targetSlug}`}
                    className="p-1.5 bg-muted hover:bg-shop-orange hover:text-white text-foreground rounded-lg transition-all"
                    title="Voir ma commande"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryMolecule;