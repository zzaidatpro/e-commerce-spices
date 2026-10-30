import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRegionsWithSpices } from '@repo/database';
import { slugify } from '@repo/ui';


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RegionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const allProducts = await getRegionsWithSpices(supabase as any);

  // Filtrage flexible : comparaison du slug
  const regionProducts = (allProducts || []).filter(
    (product: any) => slugify(product.origin || '') === slug
  );

  if (!regionProducts || regionProducts.length === 0) {
    notFound();
  }

  const regionName = regionProducts[0]?.origin || 'Terroir';

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="space-y-3">
        <Link
          href="/origines"
          className="text-xs font-semibold text-shop-orange hover:underline inline-flex items-center gap-1"
        >
          ← les origines
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Terroir : {regionName}
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Découvrez notre sélection exclusive d'épices d'exception provenant de la région {regionName}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {regionProducts.map((product: any) => {
          const imageUrl = product.image_url || product.image || '/images/placeholder.jpg';

          return (
            <Link
              key={product.id || product.slug}
              href={`/products/${product.slug}`}
              className="group flex flex-col bg-card rounded-2xl border border-border/60 p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted mb-3">
                <Image
                  src={imageUrl}
                  alt={product.nom || 'Produit'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>

              <div className="flex flex-col flex-1 justify-between space-y-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {product.origin}
                  </span>
                  <h2 className="font-bold text-foreground text-base line-clamp-1 group-hover:text-shop-orange transition-colors">
                    {product.nom}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border/40">
                  <span className="font-bold text-shop-orange text-sm">
                    {product.prix ? `${product.prix} €` : ''}
                  </span>
                  <span className="text-xs font-medium text-foreground group-hover:translate-x-1 transition-transform">
                    Voir →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}