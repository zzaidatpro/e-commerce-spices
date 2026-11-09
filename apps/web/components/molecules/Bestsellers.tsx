// apps/web/components/.../Bestsellers.tsx
import Image from "next/image";
import { getSpicesByBestSeller } from "@repo/database";
import { createUserClient } from "@repo/database/client";
import AddToCartButton from "../atoms/AddToCartButton";

export async function BestSellers() {
  const supabase = await createUserClient();
  
  const products = await getSpicesByBestSeller(supabase, true);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16 text-foreground lg:py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-10 px-4 lg:px-8">
        <h2 className="text-3xl font-semibold md:text-4xl">Les essentiels de votre cuisine</h2>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((spice: any) => {
            const imageUrl = spice.image_url || spice.image || "/images/placeholder.jpg";

          
            const cartProduct = {
              id: spice.id,
              slug: spice.slug,
              name: spice.nom || spice.name || 'Produit',
              price: spice.prix_unitaire || 0,
              image: imageUrl,
            };

            return (
              <li key={spice.slug || spice.id}>
                <article className="group flex h-full flex-col rounded-2xl bg-card text-card-foreground border border-border p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                  {/* Visuel */}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={imageUrl}
                      alt={spice.nom || spice.name || 'Produit'}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Informations et Bouton */}
                  <div className="flex flex-1 flex-col justify-between gap-4 pt-4">
                    <div className="space-y-1.5">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {spice.origin || spice.region || ''}
                      </p>
                      <h3 className="text-base font-semibold text-foreground">
                        {spice.nom || spice.name}
                      </h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {spice.description}
                      </p>
                    </div>

                    {/* Prix et Bouton d'ajout alignés proprement en bas */}
                    <div className="space-y-3 pt-2 mt-auto border-t border-border/40">
                      <div className="text-base font-bold text-shop-orange">
                        {`${spice.prix_unitaire} Da`}
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