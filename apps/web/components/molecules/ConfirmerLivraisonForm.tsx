'use client';

import { useState, useTransition } from 'react';
import {
  confirmerLivraisonAction,
  demanderNouveauCodeAction,
} from '@/actions/actionLivraison';

type Props = {
  orderId: string;
};

export function ConfirmerLivraisonForm({ orderId }: Props) {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [isConfirming, startConfirmTransition] = useTransition();
  const [isRequestingCode, startRequestTransition] = useTransition();

  const handleConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    startConfirmTransition(async () => {
      const res = await confirmerLivraisonAction(orderId, code);
      setFeedback(res);
      if (res.ok) {
        setCode('');
      }
    });
  };

  const handleDemanderNouveauCode = () => {
    setFeedback(null);

    startRequestTransition(async () => {
      const res = await demanderNouveauCodeAction(orderId);
      setFeedback(res);
    });
  };

  const isBusy = isConfirming || isRequestingCode;

  return (
    <div className="space-y-4">
      <form onSubmit={handleConfirm} className="space-y-3">
        <div>
          <label htmlFor={`code-${orderId}`} className="block text-sm font-medium">
            Code de livraison (6 chiffres)
          </label>
          <input
            id={`code-${orderId}`}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            disabled={isBusy}
            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isBusy}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isConfirming ? 'Vérification...' : 'Confirmer la réception'}
          </button>

          <button
            type="button"
            onClick={handleDemanderNouveauCode}
            disabled={isBusy}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50"
          >
            {isRequestingCode ? 'Envoi en cours...' : 'Demander un nouveau code'}
          </button>
        </div>
      </form>

      {feedback && (
        <p
          role="status"
          className={`rounded-md p-3 text-sm ${
            feedback.ok
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}