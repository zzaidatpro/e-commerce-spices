'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { majCoordonneesLivreurAction } from '@/actions/actionProfilLivreur';

const champ =
  'w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-shop-orange/50';

export function CoordonneesLivreurForm({
  nom,
  prenom,
  telephone,
  whatsapp,
}: {
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  whatsapp: string | null;
}) {
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await majCoordonneesLivreurAction(formData);
      if (res.error) setMessage({ ok: false, texte: res.error });
      else setMessage({ ok: true, texte: 'Coordonnées enregistrées.' });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-border rounded-2xl bg-card p-6">
      <h2 className="text-sm font-bold text-foreground">Mes coordonnées</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prenom" className="text-xs font-semibold text-foreground">Prénom</label>
          <input id="prenom" name="prenom" required maxLength={100} defaultValue={prenom ?? ''} className={champ} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nom" className="text-xs font-semibold text-foreground">Nom</label>
          <input id="nom" name="nom" required maxLength={100} defaultValue={nom ?? ''} className={champ} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telephone" className="text-xs font-semibold text-foreground">Téléphone</label>
          <input id="telephone" name="telephone" type="tel" required defaultValue={telephone ?? ''} placeholder="0550 12 34 56" className={champ} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="whatsapp" className="text-xs font-semibold text-foreground">WhatsApp (facultatif)</label>
          <input id="whatsapp" name="whatsapp" type="tel" defaultValue={whatsapp ?? ''} placeholder="Si différent du téléphone" className={champ} />
        </div>
      </div>

      {message && (
        <p className={`text-xs ${message.ok ? 'text-green-600' : 'text-destructive'}`}>{message.texte}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-end px-4 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50"
      >
        {isPending ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}