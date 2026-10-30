'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '../atoms/AddToCartButton';

export interface ProductItem {
  id: string;
  nom: string;
  slug: string | null;
  region?: string | null;
  family?: string | null;
  image_url?: string | null;
  prix_unitaire?: number | null;
}

interface ProductCardProps {
  product: ProductItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const productSlug = product.slug || product.id;
  const price = product.prix_unitaire ?? 0;

  return (
    <div className="group bg-background rounded-xl border border-border/60 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <Link
        href={`/products/${productSlug}`}
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

          {product.region && (
            <span className="absolute top-2 left-2 bg-background/80 backdrop-blur-md text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-md border border-border/40">
              {product.region}
            </span>
          )}
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
            slug: productSlug,
            price: price,
            image: product.image_url || undefined,
            weight: product.region || undefined,
          }}
        />
      </div>
    </div>
  );
}