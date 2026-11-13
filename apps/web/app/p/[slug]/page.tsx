import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { ProductCard } from "@/components/molecules/product-card";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    },
  );

  const { data: product, error } = await supabase
    .from("produits")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  if (error || !product) {
    notFound();
  }
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-shop-orange transition-colors bg-background border border-border/60 px-3 py-2 rounded-lg shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux produits
        </Link>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Colonne gauche : carte produit */}
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            <ProductCard product={product} />
          </div>

          {/* Colonne droite : description */}
          <aside className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Description</h2>
            {product.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Description bientôt disponible.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
