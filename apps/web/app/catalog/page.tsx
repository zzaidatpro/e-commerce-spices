import React from "react";
import { createClient } from "@repo/database";
import { CategorySidebar } from "@/components/molecules/category-sidebar";
import { ProductCard, ProductItem } from "@/components/molecules/product-card";

export const metadata = { title: "Catalogue" };

interface PageProps {
  searchParams: Promise<{
    family?: string | string[];
    region?: string | string[];
  }>;
}

const toArray = (value?: string | string[]) =>
  Array.isArray(value) ? value : value ? [value] : [];

export default async function CataloguePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedFamilies = toArray(params.family);
  const selectedRegions = toArray(params.region);

  const supabase = await createClient();

  let query = supabase.from("produits").select("*");
  if (selectedFamilies.length > 0) query = query.in("family", selectedFamilies);
  if (selectedRegions.length > 0) query = query.in("region", selectedRegions);

  const { data } = await query;
  const displayedProducts = (data as ProductItem[] | null) ?? [];

  const { data: allRows } = await supabase.from("produits").select("family, region");
  const rows = (allRows ?? []) as { family?: string; region?: string }[];

  const toOptions = (values: (string | undefined)[]) =>
    Array.from(new Set(values.filter((v): v is string => Boolean(v)))).map((nom, index) => ({
      id: String(index + 1),
      nom,
      slug: nom,
    }));

  const families = toOptions(rows.map((r) => r.family));
  const regions = toOptions(rows.map((r) => r.region));
  const hasFilter = selectedFamilies.length > 0 || selectedRegions.length > 0;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[240px_1fr] items-start gap-6 p-4 md:p-6">
      <aside className="sticky top-6">
        <CategorySidebar groups={{ families, regions }} />
      </aside>

      <main className="min-w-0 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Catalogue des épices</h1>
          {hasFilter && (
            <a
              href="/catalogue"
              className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/80"
            >
              Réinitialiser
            </a>
          )}
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">Aucun produit ne correspond à vos critères.</p>
          </div>
        )}
      </main>
    </div>
  );
}