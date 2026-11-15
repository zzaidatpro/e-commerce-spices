'use client';

import { useState, useTransition } from 'react';
import { setClientStatutAction } from '@/actions/actionClients';

export function ClientStatutButton({ clientId, statut }: { clientId: string; statut: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const bloque = statut === 'blocked';

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const res = await setClientStatutAction(clientId, bloque ? 'approved' : 'blocked');
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white disabled:opacity-50 ${
          bloque ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
        }`}
      >
        {isPending ? '...' : bloque ? 'Débloquer' : 'Bloquer'}
      </button>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </div>
  );
}