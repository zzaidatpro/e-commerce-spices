'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { expedierAction, encaisserAction } from '@/actions/actionVentes';

const champ = 'px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs';
const bouton = 'px-3 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50';

export function ExpedierForm({
  orderId,
  livreurs,
}: {
  orderId: string;
  livreurs: { id: string; nom: string | null; prenom: string | null }[];
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const livreurId = String(new FormData(e.currentTarget).get('livreur') ?? '');
    setErreur(null);
    startTransition(async () => {
      const res = await expedierAction(orderId, livreurId);
      if (res.error) setErreur(res.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-foreground">Livreur désigné</label>
      <select name="livreur" required defaultValue="" className={champ}>
        <option value="" disabled>
          Choisir un livreur
        </option>
        {livreurs.map((l) => (
          <option key={l.id} value={l.id}>
            {l.prenom} {l.nom}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isPending} className={bouton}>
        {isPending ? '...' : 'Expédier la commande'}
      </button>
      {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
    </form>
  );
}

export function EncaissementForm({ orderId, total }: { orderId: string; total: number }) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErreur(null);
    startTransition(async () => {
      const res = await encaisserAction(orderId, formData);
      if (res.error) setErreur(res.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <p className="text-[11px] text-muted-foreground">
        Le livreur remet l'argent. Saisissez son code et le montant reçu.
      </p>
      <input name="code_livreur" required maxLength={6} placeholder="Code livreur" className={`${champ} uppercase`} />
      <input name="montant" type="number" step="0.01" defaultValue={total} required className={champ} />
      <button type="submit" disabled={isPending} className={bouton}>
        {isPending ? '...' : 'Confirmer la vente'}
      </button>
      {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
    </form>
  );
}