import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRegionsWithSpices } from '@repo/database';
import { slugify } from '@repo/ui';


export default async function OriginesPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const products = await getRegionsWithSpices(supabase as any);
  const regionsMap = (products || []).reduce((acc: Record<string, any>, product: any) => {
    if (!product.origin) return acc;
    
    const originName = product.origin;
    const originSlug = slugify(originName);

    if (!acc[originSlug]) {
      acc[originSlug] = {
        name: originName,
        slug: originSlug,
        image_url: product.image_url || product.image || '/images/placeholder.jpg',
        count: 0,
      };
    }
    acc[originSlug].count += 1;
    return acc;
  }, {});

  const regions = Object.values(regionsMap);

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-4 md:p-8">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Origines & Terroirs</h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Partez à la découverte des grandes régions du monde qui façonnent nos épices d'exception.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {regions.map((region: any) => (
          <Link
            key={region.slug}
            href={`/origines/${region.slug}`}
            className="group flex flex-col bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              <Image
                src={region.image_url}
                alt={region.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>

            <div className="flex flex-col flex-1 justify-between p-5 space-y-3">
              <div>
                <h2 className="text-xl font-bold text-foreground group-hover:text-shop-orange transition-colors">
                  {region.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {region.count} {region.count > 1 ? 'produits référencés' : 'produit référencé'}
                </p>
              </div>

              <span className="inline-flex items-center text-xs font-semibold text-shop-orange pt-2">
                Explorer le terroir →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}