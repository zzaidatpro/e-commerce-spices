import React from 'react';
import { createClient } from '@repo/database/server';
import ProductCatalogClient from '@/components/molecules/ProductCatalogClient';
import { getFavoriIds } from '@/lib/favoris';

interface ProductsPageProps {
  searchParams: Promise<{ family?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialFamilyQuery = resolvedSearchParams.family || 'tous';

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('produits')
    .select('*')
    .order('nom', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des produits:', error.message);
  }

  const favoriIds = await getFavoriIds();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8 min-h-screen">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Catalogue des produits</h1>
        <p className="text-xs text-muted-foreground">
          Explorez et filtrez l'ensemble de nos sélections aromatiques.
        </p>
      </div>

      <ProductCatalogClient
        initialProducts={products ?? []}
        initialFamily={initialFamilyQuery}
        favoriIds={favoriIds}
      />
    </div>
  );
}