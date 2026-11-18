'use client';

import { useEffect, useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { ajouterFavori, retirerFavori } from '@/actions/actionWishlist';

export function FavoriteToggle({
  produitId,
  initialIsFavorite,
}: {
  produitId: string;
  initialIsFavorite: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const basculer = () => {
    const precedent = isFavorite;
    setErreur(null);
    setIsFavorite(!precedent);

    startTransition(async () => {
      const res = precedent
        ? await retirerFavori(produitId)
        : await ajouterFavori(produitId);

      if (res.error) {
        setIsFavorite(precedent);
        setErreur(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={basculer}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          }`}
        />
        {isFavorite ? 'Retirer de ma liste' : 'Ajouter à ma liste de souhaits'}
      </button>
      {erreur && <span className="text-[11px] text-destructive text-center">{erreur}</span>}
    </div>
  );
}