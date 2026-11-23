'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { repondreFeedbackAction, marquerFeedbackLuAction } from '@/actions/actionFeedback';

const champ = 'w-full px-3 py-2 border border-border rounded-xl bg-background text-xs';

export function RepondreForm({ id, reponseActuelle }: { id: string; reponseActuelle: string | null }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const soumettre = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const texte = String(new FormData(e.currentTarget).get('reponse') ?? '');
    setErreur(null);
    startTransition(async () => {
      const r = await repondreFeedbackAction(id, texte);
      if (r.error) setErreur(r.error);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-2">
      <textarea name="reponse" required minLength={5} rows={3} defaultValue={reponseActuelle ?? ''} className={champ} />
      <div className="flex items-center justify-between">
        {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
        <button
          type="submit"
          disabled={isPending}
          className="ml-auto px-3 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50"
        >
          {isPending ? '...' : reponseActuelle ? 'Modifier la réponse' : 'Répondre'}
        </button>
      </div>
    </form>
  );
}

export function MarquerLuButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await marquerFeedbackLuAction(id);
          router.refresh();
        })
      }
      className="text-[11px] text-shop-orange hover:underline disabled:opacity-50"
    >
      Marquer comme lu
    </button>
  );
}