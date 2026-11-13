import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Heart } from 'lucide-react';
import { createClient } from '@repo/database/server';
import { ProductCard } from '@/components/molecules/product-card';
import { RetirerFavoriButton } from '@/components/molecules/RetirerFavoriButton';
import { getFavoriIds } from '@/lib/favoris';

type Produit = {
  id: string;
  nom: string;
  slug: string;
  prix_unitaire: number;
  image_url: string | null;
  family: string | null;
  region: string | null;
  stock: number;
};

export default async function WishlistPage() {
    
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/');

  const { data: favoris, error } = await supabase
    .from('favoris')
    .select('produit_id, created_at, produits ( id, nom, slug, prix_unitaire, image_url, family, region, stock )')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="p-6 text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  const articles = (favoris ?? [])
    .map((f: any) => (Array.isArray(f.produits) ? f.produits[0] : f.produits) as Produit | null)
    .filter((p): p is Produit => p !== null);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ma liste de souhaits</h1>
        <p className="text-sm text-muted-foreground">
          Les produits que vous avez gardés pour plus tard.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="w-10 h-10 text-muted-foreground opacity-50" />
          <p className="text-sm font-medium text-foreground">Votre liste est vide.</p>
          <Link href="/products" className="text-xs font-semibold text-shop-orange hover:underline">
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {articles.map((produit) => (
            <div key={produit.id} className="flex flex-col gap-2">
              <div className="relative">
                <ProductCard product={produit} />
                {produit.stock === 0 && (
                  <span className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Rupture
                  </span>
                )}
              </div>
              <div className="flex justify-end px-1">
                <RetirerFavoriButton produitId={produit.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}