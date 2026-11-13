'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import AddToCartButton from '../atoms/AddToCartButton';
import { ajouterFavori, retirerFavori } from '@/actions/actionWishlist'; 

export interface ProductItem {
  id: string;
  nom: string;
  slug: string;
  region?: string | null;
  family?: string | null;
  image_url?: string | null;
  prix_unitaire: number;
  stock?: number;
}

interface ProductCardProps {
  product: ProductItem;
  initialIsFavorite?: boolean;
}

export function ProductCard({ product, initialIsFavorite = false }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
  setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);
  
  const productSlug = product.slug;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêche d'ouvrir la page produit au clic sur le cœur
    e.stopPropagation();

    const previousState = isFavorite;
    setIsFavorite(!previousState); // Mise à jour optimiste de l'UI

    startTransition(async () => {
      const res = previousState 
        ? await retirerFavori(product.id) 
        : await ajouterFavori(product.id);

      if (res && res.error) {
        setIsFavorite(previousState); // En cas d'erreur, on rétablit l'état
        console.error(res.error);
      }
    });
  };

  return (
    <div className="group bg-background rounded-xl border border-border/60 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <Link
        href={`/p/${productSlug}`}
        className="flex flex-col flex-1"
      >
        <div className="relative aspect-square w-full bg-muted overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.nom}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
              Image non disponible
            </div>
          )}

          {/* Badge région */}
          {product.region && (
            <span className="absolute top-2 left-2 bg-background/80 backdrop-blur-md text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md border border-border/40">
              {product.region}
            </span>
          )}

          {/* Bouton Cœur (Wishlist) intégré directement */}
          <div className="absolute top-2 right-2 z-10">
            <button
              type="button"
              onClick={handleToggleFavorite}
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
          </div>
        </div>
        
        <div className="p-3 flex flex-col flex-1 justify-between space-y-2">
          <div className="space-y-0.5 text-left">
            {product.family && (
              <span className="text-[10px] font-medium text-shop-orange uppercase tracking-wider line-clamp-1">
                {product.family}
              </span>
            )}
            <h3 className="text-xs font-bold text-foreground group-hover:text-shop-orange transition-colors line-clamp-2 leading-snug">
              {product.nom}
            </h3>
          </div>

          <div className="text-left">
            <span className="text-xs font-extrabold text-foreground">
              {product.prix_unitaire != null ? `${product.prix_unitaire.toFixed(2)} Da` : 'Sur demande'}
            </span>
          </div>
        </div>
      </Link>

      {/* Bouton d'ajout au panier compact */}
      <div className="p-3 pt-0">
        <AddToCartButton
          product={{
            id: product.id,
            name: product.nom,
            slug: product.slug,
            price: product.prix_unitaire,
            image: product.image_url || undefined,
            weight: product.region || undefined,
          }}
        />
      </div>
    </div>
  );
}