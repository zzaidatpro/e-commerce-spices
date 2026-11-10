import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ProductCatalogClient from '@/components/molecules/ProductCatalogClient';

interface ProductsPageProps {
  searchParams: Promise<{
    family?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  // Récupère la famille depuis l'URL (ex: /products?family=poudres), ou 'tous' par défaut
  const initialFamilyQuery = resolvedSearchParams.family || 'tous';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // Récupération globale de tous les produits depuis Supabase
  const { data: products, error } = await supabase
    .from('produits')
    .select('*')
    .order('nom', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des produits:', error.message);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8 min-h-screen">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Catalogue des produits</h1>
        <p className="text-xs text-muted-foreground">
          Explorez et filtrez l'ensemble de nos sélections aromatiques.
        </p>
      </div>

      {/* On transmet la famille de l'URL au composant client */}
      <ProductCatalogClient 
        initialProducts={products || []} 
        initialFamily={initialFamilyQuery} 
      />
    </div>
  );
}