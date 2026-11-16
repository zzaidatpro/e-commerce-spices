import { requireRole } from '@/actions/helper';

type FavoriLigne = {
  produit_id: string;
  nom: string;
  family: string | null;
  image_url: string | null;
  stock: number;
  nb_favoris: number | string;
};

export default async function FavorisPage({
  searchParams,
}: {
  searchParams: Promise<{ limite?: string }>;
}) {
  const { limite } = await searchParams;
  const auth = await requireRole(['admin', 'manager']);

  const nbLignes = [10, 25, 50].includes(Number(limite)) ? Number(limite) : 25;

  const { data, error } = await auth.supabase.rpc('classement_favoris', { p_limit: nbLignes });

  if (error) {
    return <p className="text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  const lignes: FavoriLigne[] = data ?? [];
  const total = lignes.reduce((somme: number, l: FavoriLigne) => somme + Number(l.nb_favoris), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Produits les plus mis en favori</h1>
          <p className="text-xs text-muted-foreground">
            {lignes.length} produit(s) · {total} favori(s) au total
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Afficher :</span>
          {[10, 25, 50].map((n) => (
            <a
              key={n}
              href={`/admin/favoris?limite=${n}`}
              className={`px-3 py-1.5 rounded-lg border ${
                nbLignes === n
                  ? 'bg-shop-orange text-white border-shop-orange'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {n}
            </a>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
              <th className="p-4 w-12">Rang</th>
              <th className="p-4">Produit</th>
              <th className="p-4">Famille</th>
              <th className="p-4">Favoris</th>
              <th className="p-4">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lignes.length > 0 ? (
              lignes.map((l: FavoriLigne, index: number) => (
                <tr key={l.produit_id} className="hover:bg-muted/30">
                  <td className="p-4 font-mono text-muted-foreground">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {l.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.image_url}
                          alt={l.nom}
                          className="w-9 h-9 object-cover rounded-lg border border-border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-muted" />
                      )}
                      <span className="font-semibold text-foreground">{l.nom}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{l.family ?? '—'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-full bg-red-500/10 text-red-600 font-bold">
                      {Number(l.nb_favoris)}
                    </span>
                  </td>
                  <td className="p-4">
                    {l.stock === 0 ? (
                      <span className="text-red-600 font-semibold">Rupture</span>
                    ) : (
                      <span className="font-mono">{l.stock}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Aucun produit n'a encore été ajouté en favori.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}