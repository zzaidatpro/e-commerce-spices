import Image from 'next/image';
import { createClient } from '@repo/database/server';
import AddToCartButton from '../atoms/AddToCartButton';

type Essentiel = {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  prix_unitaire: number;
  image_url: string | null;
  region: string | null;
  family: string | null;
  stock: number;
};

export async function BestSellers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('produits')
    .select('id, nom, slug, description, prix_unitaire, image_url, region, family, stock')
    .eq('is_best_seller', true)
    .gt('stock', 0)
    .order('nom', { ascending: true })
    .limit(8);

  if (error) {
    console.error('Erreur essentiels :', error.message);
    return null;
  }

  const products: Essentiel[] = data ?? [];
  if (products.length === 0) return null;

  return (
    <section className="bg-background py-16 text-foreground lg:py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-10 px-4 lg:px-8">
        <h2 className="text-3xl font-semibold md:text-4xl">Les essentiels de votre cuisine</h2>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p: Essentiel) => {
            const cartProduct = {
              id: p.id,
              slug: p.slug,
              name: p.nom,
              price: Number(p.prix_unitaire),
              image: p.image_url ?? undefined,
              weight: p.region ?? undefined,
            };

            return (
              <li key={p.id}>
                <article className="group flex h-full flex-col rounded-2xl bg-card text-card-foreground border border-border p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.nom}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Image non disponible
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-4 pt-4">
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {p.region ?? ''}
                      </p>
                      <h3 className="text-base font-semibold text-foreground">{p.nom}</h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                    </div>

                    <div className="space-y-3 pt-2 mt-auto border-t border-border/40">
                      <div className="text-base font-bold text-shop-orange">
                        {`${Number(p.prix_unitaire).toFixed(2)} Da`}
                      </div>
                      <AddToCartButton
                        product={cartProduct}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-shop-orange hover:bg-shop-orange/90 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                      />
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}