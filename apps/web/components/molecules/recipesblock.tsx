import Image from "next/image";
import Link from "next/link";
import { homeContent } from "@repo/database";

export function RecipesBlock() {
  const { recipes } = homeContent;

  return (
    <section className="bg-background py-16 text-foreground lg:py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-10 px-4 lg:px-8">
        <h2 className="text-3xl font-semibold md:text-4xl">{recipes.title}</h2>

        <ul className="grid gap-6 md:grid-cols-2">
          {recipes.items.map((recipe) => (
            <li key={recipe.title}>
              <Link
                href={recipe.href}
                className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-md sm:flex-row"
              >
                <div className="relative aspect-4/3 shrink-0 sm:aspect-auto sm:w-2/5 bg-muted">
                 <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    sizes="(min-width: 640px) 20vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 items-center p-6">
                  <h3 className="text-xl font-semibold leading-snug text-card-foreground">{recipe.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}