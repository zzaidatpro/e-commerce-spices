'use client';

import React from 'react';
import { Package, Clock, CheckCircle2, Truck } from 'lucide-react';

export interface OrderItem {
  id: string;
  date: string;
  statut: 'Livré' | 'En cours' | 'Expédié';
  total: number;
  nombreArticles: number;
}

interface OrderHistoryMoleculeProps {
  orders?: OrderItem[];
}

export const OrderHistoryMolecule = ({ orders = [] }: OrderHistoryMoleculeProps) => {
  // Exemples de commandes factices si la liste est vide
  const defaultOrders: OrderItem[] = [
    { id: 'CMD-8492', date: '22 Oct. 2026', statut: 'Livré', total: 4500, nombreArticles: 3 },
    { id: 'CMD-9104', date: '27 Oct. 2026', statut: 'En cours', total: 2800, nombreArticles: 2 },
  ];

  const activeOrders = orders.length > 0 ? orders : defaultOrders;

  const getStatusBadge = (statut: OrderItem['statut']) => {
    switch (statut) {
      case 'Livré':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> {statut}
          </span>
        );
      case 'En cours':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> {statut}
          </span>
        );
      case 'Expédié':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
            <Truck className="w-3 h-3" /> {statut}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-background border border-border/80 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-shop-orange" />
          <h2 className="text-sm font-bold text-foreground">Historique des commandes</h2>
        </div>
        <span className="text-xs text-muted-foreground">{activeOrders.length} commande(s)</span>
      </div>

      <div className="flex flex-col gap-3">
        {activeOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 bg-secondary/20 border border-border/60 rounded-xl hover:border-border transition-colors text-left"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground">{order.id}</span>
              <span className="text-[11px] text-muted-foreground">{order.date} • {order.nombreArticles} article(s)</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-shop-orange">{order.total.toFixed(2)} Da</span>
              {getStatusBadge(order.statut)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryMolecule;