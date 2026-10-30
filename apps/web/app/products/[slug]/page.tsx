import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createUserClient } from '@repo/database/client';
import { ArrowLeft, Tag, MapPin, ShoppingCart } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = await createUserClient();

  // Récupération du produit correspondant au slug
  const { data: product, error } = await supabase
    .from('produits')
    .select('*')
    .eq('slug', slug)
    .single();

  // Si le produit n'existe pas ou qu'il y a une erreur, afficher la page 404
  if (error || !product) {
    notFound();
  }

  const imageUrl = product.image_url || product.image || '/placeholder.png';

  return (
    <main className="min-h-screen max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {/* Bouton de retour vers le catalogue */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-background p-6 rounded-2xl border border-border/60">
        {/* Visuel du produit */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.nom || product.name || 'Produit'}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Informations détaillées */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Badges Famille et Région */}
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {(product.family || product.famille) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-shop-orange/10 text-shop-orange">
                  <Tag className="w-3 h-3" />
                  {product.family || product.famille}
                </span>
              )}
              {product.region && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {product.region}
                </span>
              )}
            </div>

            {/* Nom du produit */}
            <h1 id='test_h1' className="text-3xl font-bold tracking-tight text-foreground">
              {product.nom || product.name}
            </h1>

            {/* Prix */}
            <div className="text-2xl font-semibold text-shop-orange">
              {product.prix ? `${product.prix} €` : 'Prix sur demande'}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description || 'Aucune description disponible pour ce produit.'}
            </p>
          </div>

          {/* Bouton d'action */}
          <div className="pt-4 border-t border-border/40">
            <button className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium rounded-xl transition-colors shadow-sm">
              <ShoppingCart className="w-5 h-5" />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}