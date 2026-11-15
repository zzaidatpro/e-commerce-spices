'use client';

import { useState, useTransition, type FormEvent } from 'react';
import {
  changerStatutAction,
  appliquerRemiseAction,
  genererCodeAction,
} from '@/actions/actionOrders';
import { STATUT_LABELS, STATUTS_STAFF } from '@/lib/commandes';

const champ =
  'px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs';
const bouton =
  'px-3 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50';

export function OrderStatusForm({ orderId, statut }: { orderId: string; statut: string }) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Une commande livrée est figée : aucun autre statut n'est proposé
  const figee = statut === 'livrée';
  const options: string[] = figee ? ['livrée'] : [...STATUTS_STAFF];

  const handleChange = (nouveau: string) => {
    setErreur(null);
    startTransition(async () => {
      const res = await changerStatutAction(orderId, nouveau);
      if (res.error) setErreur(res.error);
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <select
        value={statut}
        disabled={figee || isPending}
        onChange={(e) => handleChange(e.target.value)}
        className={champ}
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {STATUT_LABELS[s]}
          </option>
        ))}
      </select>
      {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
    </div>
  );
}

export function RemiseForm({ orderId, remise }: { orderId: string; remise: number }) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur(null);
    setOk(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await appliquerRemiseAction(orderId, formData);
      if (res.error) setErreur(res.error);
      else setOk(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-foreground">Remise totale (DA)</label>
      <div className="flex gap-2">
        <input
          name="remise"
          type="number"
          min={0}
          step="0.01"
          defaultValue={remise}
          className={champ}
        />
        <button type="submit" disabled={isPending} className={bouton}>
          Appliquer
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Montant total de la remise, pas un supplément. Le total est recalculé automatiquement.
      </p>
      {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
      {ok && <span className="text-[11px] text-green-600">Remise appliquée.</span>}
    </form>
  );
}

export function CodeLivraisonButton({ orderId }: { orderId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const generer = () => {
    setErreur(null);
    startTransition(async () => {
      const res = await genererCodeAction(orderId);
      if (res.error) setErreur(res.error);
      else if (res.code) setCode(res.code);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={generer} disabled={isPending} className={bouton}>
        {isPending ? 'Génération...' : code ? 'Régénérer le code' : 'Générer le code de livraison'}
      </button>

      {code && (
        <div className="p-3 border border-shop-orange/40 rounded-xl bg-shop-orange/5">
          <p className="text-[11px] text-muted-foreground">Code à remettre au livreur :</p>
          <p className="text-2xl font-mono font-bold tracking-widest text-foreground">{code}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Notez-le maintenant : il ne sera plus affiché. Régénérer invalide le code précédent.
          </p>
        </div>
      )}
      {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
    </div>
  );
}