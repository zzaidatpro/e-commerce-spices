import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { ProductCard } from '@/components/molecules/product-card'; 

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  console.log("--> Slug récupéré depuis l'URL :", slug);
 


  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
 
  // Récupération des données du produit
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .or(`slug.eq.${slug}`)
    .single();

  if (error || !product) {
    notFound();
  }
    console.log("--> Résultat de la requête Supabase :", { product, error });

  if (error || !product) {
    notFound();
  }
  return (
    <main className="min-h-screen bg-background p-6 flex flex-col items-center justify-center space-y-4">
      {/* Bouton de retour vers /products */}
      <div className="w-full max-w-sm">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-shop-orange transition-colors bg-background border border-border/60 px-3 py-2 rounded-lg shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux produits
        </Link>
      </div>

      {/* Affichage unique de la ProductCard */}
      <div className="w-full max-w-sm">
        <ProductCard product={product} />
      </div>
    </main>
  );
}