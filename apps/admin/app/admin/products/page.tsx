import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Plus, Package, Edit, Trash2 } from "lucide-react";

export const revalidate = 0; // Pour s'assurer que les données affichées sont toujours fraîches

export default async function ProductsManagementPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(process.env.NEXT_SUPABASE_URL!, process.env.NEXT_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const { data: products, error } = await supabase
    .from("produits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-xs">
        Erreur lors du chargement des produits : {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestion du Catalogue</h1>
          <p className="text-xs text-muted-foreground">Gérez la liste de vos épices, sauces et stocks.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-shop-orange hover:bg-shop-orange/90 text-white font-bold text-xs rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un produit</span>
        </Link>
      </div>

      {/* Tableau des produits */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
              <th className="p-4">Produit</th>
              <th className="p-4">Famille</th>
              <th className="p-4">Prix</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.nom}
                        className="w-10 h-10 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-foreground">{product.nom}</div>
                      <div className="text-[10px] text-muted-foreground">ID: {product.id}</div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{product.family || "Non catégorisé"}</td>
                  <td className="p-4 font-semibold text-foreground">{Number(product.prix_unitaire).toFixed(2)} Da</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        product.stock > 10
                          ? "bg-green-500/10 text-green-600"
                          : product.stock > 0
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} en stock` : "Rupture"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Aucun produit trouvé dans le catalogue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
