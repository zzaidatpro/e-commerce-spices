'use client';

import React, { useTransition } from 'react';
import { updateOrderStatus } from '@/actions/actionOrders';

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: string;
}

export default function UpdateOrderStatusForm({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleStatusChange}
      disabled={isPending}
      className="px-2 py-1 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-shop-orange disabled:opacity-50 cursor-pointer"
    >
      <option value="pending">En attente</option>
      <option value="shipped">Expédiée</option>
      <option value="delivered">Livrée</option>
      <option value="cancelled">Annulée</option>
    </select>
  );
}