'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { confirmerVenteAction } from '@/actions/actionVentes';

export function ConfirmerVenteButton({ orderId, pret }: { orderId: string; pret: boolean }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmer = () => {
    setErreur(null);
    startTransition(async () => {
      const res = await confirmerVenteAction(orderId);
      if (res.error) setErreur(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={confirmer}
        disabled={!pret || isPending}
        className="self-start px-4 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50"
      >
        {isPending ? '...' : 'Confirmer la vente'}
      </button>
      {!pret && (
        <p className="text-[11px] text-muted-foreground">
          Disponible quand le montant déclaré par le livreur égale le total.
        </p>
      )}
      {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
    </div>
  );
}