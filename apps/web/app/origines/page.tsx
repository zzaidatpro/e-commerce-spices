import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRegionsWithSpices } from '@repo/database';

export default async function OriginesPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const regions = await getRegionsWithSpices(supabase as any);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Nos Origines & Terroirs</h1>
      <p className="text-muted-foreground text-sm max-w-2xl">
        Découvrez les régions du monde d'où proviennent nos épices d'exception.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regions.map((region) => (
          <div
            key={region.id}
            className="bg-background rounded-2xl border border-border/50 p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {region.name}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {region.description || 'Une région riche en aromates et en traditions culinaires uniques.'}
              </p>
            </div>

            <div className="border-t border-border/40 pt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {region.products?.length || 0} épices répertoriées
              </span>
              <Link
                href={`/products?region=${region.slug}`}
                className="text-xs font-semibold px-4 py-2 bg-shop-orange/10 text-shop-orange rounded-lg hover:bg-shop-orange/20 transition-colors"
              >
                Explorer la région →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}