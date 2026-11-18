'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function RafraichirButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="px-3 py-2 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
    >
      {isPending ? 'Actualisation...' : 'Actualiser'}
    </button>
  );
}