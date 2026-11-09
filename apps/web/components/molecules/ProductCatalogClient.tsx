'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ProductCard } from '@/components/molecules/product-card';
import CategoryFilter from '@/components/molecules/CategoryFilter';

export interface Product {
  id: string;
  nom: string;
  slug: string;
  prix_unitaire?: number;
  image_url: string;
  family: string;
  region: string;
  description: string;
}

interface ProductCatalogClientProps {
  initialProducts: Product[];
  initialFamily?: string;
}

export default function ProductCatalogClient({ 
  initialProducts, 
  initialFamily = 'tous' 
}: ProductCatalogClientProps) {
  
  // Initialisation de l'état avec la famille de l'URL
  const [selectedFamily, setSelectedFamily] = useState(initialFamily);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      
      const productName = (product.nom || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = productName.includes(query);

      const productFamily = (product.family || '').toLowerCase();
      const matchesFamily = 
        selectedFamily.toLowerCase() === 'tous' || 
        productFamily === selectedFamily.toLowerCase();

      return matchesSearch && matchesFamily;
    });
  }, [initialProducts, searchQuery, selectedFamily]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedFamily('tous');
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Barre de recherche & Filtres par boutons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-background p-4 border border-border/80 rounded-2xl shadow-xs">
        
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-9 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <CategoryFilter 
            activeFamily={selectedFamily} 
            onSelectFamily={(family) => setSelectedFamily(family)} 
          />
        </div>
      </div>

      {/* Compteur de résultats */}
      <div className="text-xs text-muted-foreground px-1 flex justify-between items-center">
        <span>
          {filteredProducts.length} produit(s) trouvé(s) 
          {selectedFamily.toLowerCase() !== 'tous' && (
            <span className="font-semibold text-foreground"> dans "{selectedFamily}"</span>
          )}
          {searchQuery && <span className="font-semibold text-foreground"> pour "{searchQuery}"</span>}
        </span>
        {(searchQuery || selectedFamily.toLowerCase() !== 'tous') && (
          <button 
            onClick={handleReset} 
            className="text-shop-orange hover:underline font-medium cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Grille des produits filtrés */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-background border border-border/80 rounded-2xl p-6 flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-foreground">Aucun produit ne correspond à vos critères.</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-shop-orange text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Voir tous les produits
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
}