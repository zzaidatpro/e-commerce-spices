'use client';

import React, { useTransition, useState } from 'react';
import { Heart } from 'lucide-react';
import { ajouterFavori, retirerFavori } from '@/actions/actionWishlist'; 

interface FavoriteButtonProps {
  produitId: string;
  initialIsFavorite?: boolean;
}

export function FavoriteButton({ produitId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    const previousState = isFavorite;
 
    setIsFavorite(!previousState);

    startTransition(async () => {
      const res = previousState 
        ? await retirerFavori(produitId) 
        : await ajouterFavori(produitId);

      if (res.error) {
       
        setIsFavorite(previousState);
        console.error(res.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-foreground hover:scale-110 transition-all duration-200 shadow-xs cursor-pointer disabled:opacity-50"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-foreground'
        }`}
      />
    </button>
  );
}