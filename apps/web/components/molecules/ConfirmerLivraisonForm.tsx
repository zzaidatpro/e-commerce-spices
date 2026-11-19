'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { confirmerLivraisonAction } from '@/actions/actionLivraison';

export function ConfirmerLivraisonForm({ orderId, reference }: { orderId: string; reference: string }) {
  const [code, setCode] = useState('');
  const [retour, setRetour] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const soumettre = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRetour(null);
    startTransition(async () => {
      const res = await confirmerLivraisonAction(orderId, code);
      setRetour(res);
      if (res.ok) setCode('');
    });
  };

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-3 border border-shop-orange/40 rounded-2xl bg-shop-orange/5 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Votre commande #{reference} est en route</p>
        <p className="text-xs text-muted-foreground">
          Quand votre livreur vous remet le colis, saisissez le code à 6 chiffres qu'il vous a transmis.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-32 px-3 py-2 border border-border rounded-xl bg-background text-center font-mono text-lg tracking-widest"
        />
        <button
          type="submit"
          disabled={isPending || code.length !== 6}
          className="px-4 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50"
        >
          {isPending ? '...' : 'Confirmer la réception'}
        </button>
      </div>

      {retour && (
        <p className={`text-xs ${retour.ok ? 'text-green-600' : 'text-destructive'}`}>{retour.message}</p>
      )}
    </form>
  );
}