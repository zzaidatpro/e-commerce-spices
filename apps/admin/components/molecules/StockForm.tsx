'use client';

import { useState, useTransition } from 'react';
import { majStockAction } from '@/actions/actionStock';

export function StockForm({ produitId, stock }: { produitId: string; stock: number }) {
  const [valeur, setValeur] = useState(String(stock));
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const enregistrer = () => {
    setErreur(null);
    startTransition(async () => {
      const res = await majStockAction(produitId, Number(valeur));
      if (res.error) setErreur(res.error);
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <input
        type="number"
        min={0}
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
        className="w-24 px-2 py-1 border border-border rounded-lg bg-background text-xs"
      />
      <button
        type="button"
        onClick={enregistrer}
        disabled={isPending || valeur === String(stock)}
        className="px-2.5 py-1.5 bg-shop-orange text-white text-[11px] font-bold rounded-lg disabled:opacity-50"
      >
        {isPending ? '...' : 'Enregistrer'}
      </button>
      {erreur && <span className="text-[10px] text-destructive">{erreur}</span>}
    </div>
  );
}