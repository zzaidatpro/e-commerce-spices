'use client';

import { useTransition } from 'react';
import { HeartOff } from 'lucide-react';
import { retirerFavori } from '@/actions/actionWishlist';

export function RetirerFavoriButton({ produitId }: { produitId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => { await retirerFavori(produitId); })}
      className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
    >
      <HeartOff className="w-3.5 h-3.5" />
      {isPending ? 'Retrait...' : 'Retirer'}
    </button>
  );
}