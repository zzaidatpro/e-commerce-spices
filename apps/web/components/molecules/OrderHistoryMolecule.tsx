'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Eye } from 'lucide-react';
import { statutClient } from '@/lib/statuts-client';

export interface OrderRecord {
  id: string;
  created_at: string;
  statut: string;
  total: number | string;
}

interface OrderHistoryMoleculeProps {
  orders?: OrderRecord[];
}

const euros = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`;

export const OrderHistoryMolecule = ({ orders = [] }: OrderHistoryMoleculeProps) => {
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
            const statut = statutClient(order.statut);
            const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-secondary/20 border border-border/60 rounded-xl gap-2"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground">#{order.id.slice(0, 8)}</span>
                  <span className="text-[11px] text-muted-foreground">{date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-shop-orange">
                    {euros(Number(order.total))}
                  </span>

                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statut.style}`}>
                    {statut.label}
                  </span>

                  <Link
                    href={`/orders/${order.id}`}
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