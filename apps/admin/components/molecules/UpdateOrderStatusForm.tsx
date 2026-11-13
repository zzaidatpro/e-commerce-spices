'use client';

import React, { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/actions/actionOrders';
import { STATUTS_COMMANDE, TRANSITIONS, type StatutCommande } from '@/lib/permissions';

const LABELS: Record<StatutCommande, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

interface Props {
  orderId: string;
  currentStatus: StatutCommande;
  isAdmin: boolean;
}

export default function UpdateOrderStatusForm({ orderId, currentStatus, isAdmin }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const options = isAdmin ? STATUTS_COMMANDE : [currentStatus, ...TRANSITIONS[currentStatus]];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as StatutCommande;
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="px-2 py-1 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-shop-orange disabled:opacity-50 cursor-pointer"
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </div>
  );
}