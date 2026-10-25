import React from "react";
import { createClient } from "@repo/database";
import { CategorySidebar } from "@/components/molecules/category-sidebar";
import { ProductCard, ProductItem } from "@/components/molecules/product-card";

interface PageProps {
  searchParams: Promise<{
    family?: string | string[];
    region?: string | string[];
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  const rawFamily = resolvedSearchParams.family;
  const selectedFamilies = Array.isArray(rawFamily) ? rawFamily : rawFamily ? [rawFamily] : [];

  const rawRegion = resolvedSearchParams.region;
  const selectedRegions = Array.isArray(rawRegion) ? rawRegion : rawRegion ? [rawRegion] : [];

  const supabase = await createClient();

  const { data: rawProducts } = await supabase
    .from('produits')
    .select('*');

  const products: ProductItem[] = (rawProducts as ProductItem[]) || [];

  let query = supabase.from('produits').select('*');

  if (selectedFamilies.length > 0) {
    query = query.in('family', selectedFamilies);
  }
  if (selectedRegions.length > 0) {
    query = query.in('region', selectedRegions);
  }

  const { data: filteredProducts } = await query;
  const displayedProducts: ProductItem[] = (filteredProducts as ProductItem[]) || [];

  const rawFamilies = products.map((p: any) => p.family || p.famille).filter(Boolean) as string[];
  const uniqueFamilies = Array.from(new Set(rawFamilies)).map((nom, index) => ({
    id: String(index + 1),
    nom: nom,
    slug: nom,
  }));

  const rawRegions = products.map((p: any) => p.region).filter(Boolean) as string[];
  const uniqueRegions = Array.from(new Set(rawRegions)).map((nom, index) => ({
    id:String(index + 1),
    nom: nom,
    slug: nom,
  }));

  return (
    // Utilisation d'un conteneur grid ou flex optimisé pour garder les éléments côte à côte sans casser l'affichage
    <div className="grid grid-cols-[240px_1fr] gap-6 p-4 md:p-6 max-w-7xl mx-auto items-start">
      
      {/* Sidebar à largeur fixe pour garantir le côte à côte */}
      <aside className="sticky top-6">
        <CategorySidebar 
          groups={{
            families: uniqueFamilies,
            regions: uniqueRegions,
          }} 
        />
      </aside>

      <main className="space-y-6 min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Catalogue des Épices
          </h1>
          {(selectedFamilies.length > 0 || selectedRegions.length > 0) && (
            <a
              href="/"
              className="text-xs font-semibold px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Réinitialiser
            </a>
          )}
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground text-sm">Aucun produit ne correspond à vos critères.</p>
          </div>
        )}
      </main>
    </div>
  );
}