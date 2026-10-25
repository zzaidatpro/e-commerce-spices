import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group bg-background rounded-2xl border border-border/50 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300"
    >
      {/* Visualisation de l'image */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.nom}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Image non disponible
          </div>
        )}

        {product.region && (
          <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-md text-foreground text-xs font-semibold px-2.5 py-1 rounded-full border border-border/40">
            {product.region}
          </span>
        )}
      </div>

      {/* Informations textuelles */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-1">
          {product.family && (
            <span className="text-xs font-medium text-shop-orange uppercase tracking-wider">
              {product.family}
            </span>
          )}
          <h3 className="text-base font-bold text-foreground group-hover:text-shop-orange transition-colors line-clamp-1">
            {product.nom}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-lg font-extrabold text-foreground">
            {product.prix_unitaire != null ? `${product.prix_unitaire.toFixed(2)} Da` : 'Prix sur demande'}
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 bg-shop-orange/10 text-shop-orange rounded-lg group-hover:bg-shop-orange group-hover:text-white transition-colors">
            Découvrir
          </span>
        </div>
      </div>
    </Link>
  );
}