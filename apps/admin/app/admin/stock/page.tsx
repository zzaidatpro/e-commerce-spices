import Link from 'next/link';
import { requireRole } from '@/actions/helper';
import { StockForm } from '@/components/molecules/StockForm';

type ProduitStock = {
  id: string;
  nom: string;
  family: string | null;
  stock: number;
  image_url: string | null;
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ alerte?: string }>;
}) {
  const { alerte } = await searchParams;
  const auth = await requireRole(['admin', 'manager']);

  const { data: param } = await auth.supabase
    .from('parametres_site')
    .select('valeur')
    .eq('cle', 'seuil_alerte_stock')
    .maybeSingle();
  const seuil = Number(param?.valeur ?? 200);

  const { data, error } = await auth.supabase
    .from('produits')
    .select('id, nom, family, stock, image_url')
    .order('stock', { ascending: true });

  if (error) {
    return <p className="text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  const produits: ProduitStock[] = data ?? [];
  const enAlerte = produits.filter((p: ProduitStock) => p.stock < seuil);
  const affiches = alerte === '1' ? enAlerte : produits;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Stock</h1>
          <p className="text-xs text-muted-foreground">
            Seuil d'alerte : {seuil} unités · {enAlerte.length} produit(s) en alerte
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {alerte === '1' ? (
            <Link href="/admin/stock" className="text-muted-foreground hover:underline">
              Afficher tous les produits
            </Link>
          ) : (
            <Link href="/admin/stock?alerte=1" className="text-shop-orange font-semibold hover:underline">
              Afficher les alertes seulement
            </Link>
          )}
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
              <th className="p-4">Produit</th>
              <th className="p-4">Famille</th>
              <th className="p-4">Stock</th>
              <th className="p-4">État</th>
              <th className="p-4 text-right">Mise à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {affiches.length > 0 ? (
              affiches.map((p: ProduitStock) => {
                const rupture = p.stock === 0;
                const alerteStock = p.stock > 0 && p.stock < seuil;
                return (
                  <tr
                    key={p.id}
                    className={rupture ? 'bg-red-500/5' : alerteStock ? 'bg-amber-500/5' : 'hover:bg-muted/30'}
                  >
                    <td className="p-4 font-semibold text-foreground">{p.nom}</td>
                    <td className="p-4 text-muted-foreground">{p.family ?? '—'}</td>
                    <td className="p-4 font-mono font-semibold">{p.stock}</td>
                    <td className="p-4">
                      {rupture ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600">
                          Rupture
                        </span>
                      ) : alerteStock ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                          Alerte
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600">
                          Suffisant
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <StockForm produitId={p.id} stock={p.stock} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  {alerte === '1' ? 'Aucun produit en alerte.' : 'Aucun produit.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}