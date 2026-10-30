import React from 'react';
import { createUserClient } from '@repo/database/client';
import { ProductCard, ProductItem } from '@/components/molecules/product-card';
import { ShoppingBag, Search } from 'lucide-react';

export default async function ProductsCatalogPage() {
  const supabase = await createUserClient();

  // Récupération de tous les produits depuis la table `produits`
  const { data: produits, error } = await supabase
    .from('produits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des produits :", error.message);
  }

  const items: ProductItem[] = produits || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Catalogue des Épices & Condiments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explorez notre sélection authentique d'épices d'exception, mélanges et aromates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 bg-secondary/40 border border-border/60 rounded-xl w-fit">
          <ShoppingBag className="w-4 h-4 text-shop-orange" />
          <span>{items.length} produit{items.length > 1 ? 's' : ''} disponible{items.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Grille des produits ou État vide */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-secondary/20 border border-border/60 rounded-2xl text-center gap-4">
          <div className="p-4 bg-background border border-border/80 rounded-full shadow-xs">
            <Search className="w-10 h-10 text-muted-foreground stroke-1" />
          </div>
          <div className="max-w-md space-y-1">
            <h2 className="text-lg font-bold text-foreground">Aucun produit trouvé</h2>
            <p className="text-sm text-muted-foreground">
              Le catalogue est actuellement vide ou en cours de mise à jour.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}