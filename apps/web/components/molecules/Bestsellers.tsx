import Image from "next/image";
import { Button } from "@repo/ui";
import { getSpicesByBestSeller } from "@repo/database";
import { createClient } from "@repo/database";

export async function BestSellers() {
  const supabase = await createClient();
  const products = await getSpicesByBestSeller(supabase, true);

  return (
    <section className="bg-darkColor py-16 text-shop-light-pink lg:py-24">
      <div className="mx-auto max-w-7xl space-y-10 px-4 lg:px-8">
        <h2 className="text-3xl font-semibold md:text-4xl">Les essentiels de votre cuisine</h2>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((spice) => (
            <li key={spice.slug}>
              <article className="group flex h-full flex-col rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-shop-dark-green">
                  <Image
                    src={spice.image_url}
                    alt={spice.nom}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2 px-1 pb-1 pt-4">
                  <p className="text-xs uppercase tracking-widest opacity-60">{spice.origin}</p>
                  <h3 className="text-lg font-semibold">{spice.nom}</h3>
                  <p className="line-clamp-2 text-sm opacity-80">{spice.description}</p>

                  <Button
                    type="button"
                    className="mt-auto bg-shop-orange text-white hover:bg-shop-orange/90 md:translate-y-2 md:opacity-0 md:transition-all md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                  >
                    Ajouter au panier
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
