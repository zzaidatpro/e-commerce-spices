import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Tag, MapPin } from 'lucide-react';
import { createClient } from '@repo/database/server';
import AddToCartButton from '@/components/atoms/AddToCartButton';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('produits')
    .select('id, nom, slug, description, prix_unitaire, image_url, family, region, stock')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Erreur produit :', error.message);
  }

  if (!product) {
    notFound();
  }

  const prix = Number(product.prix_unitaire);
  const enRupture = product.stock === 0;

  const cartProductPayload = {
    id: product.id,
    name: product.nom,
    slug: product.slug ?? slug,
    price: prix,
    image: product.image_url ?? undefined,
    weight: product.region ?? undefined,
  };

  return (
    <main className="min-h-screen max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-background p-6 rounded-2xl border border-border/60">
        {/* Visuel */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.nom}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              Image non disponible
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {product.family && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-shop-orange/10 text-shop-orange">
                  <Tag className="w-3 h-3" />
                  {product.family}
                </span>
              )}
              {product.region && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {product.region}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.nom}</h1>

            <div className="text-2xl font-semibold text-shop-orange">
              {Number.isFinite(prix) ? `${prix.toFixed(2)} Da` : 'Prix sur demande'}
            </div>

            {enRupture && (
              <p className="text-sm font-semibold text-red-600">Rupture de stock</p>
            )}

            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description || 'Aucune description disponible pour ce produit.'}
            </p>
          </div>

          <div className="pt-4 border-t border-border/40">
            <AddToCartButton
              product={cartProductPayload}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
            />
          </div>
        </div>
      </div>
    </main>
  );
}