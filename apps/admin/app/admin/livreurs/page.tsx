import { requireRole } from '@/actions/helper';

type Livreur = {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  status: string;
  code_livreur: string | null;
};

const STATUT_STYLE: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-600',
  pending: 'bg-amber-500/10 text-amber-600',
  blocked: 'bg-red-500/10 text-red-600',
};

export default async function LivreursPage() {
  const auth = await requireRole(['admin', 'manager']);

  // Le manager ne lit pas profiles : on passe par la fonction dédiée (sans le code)
  const { data: livreursBruts, error } = await auth.supabase.rpc('liste_livreurs');

  if (error) {
    return <p className="text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  const livreurs: Livreur[] = (livreursBruts ?? []) as Livreur[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Livreurs</h1>
        <p className="text-xs text-muted-foreground">
          Seuls les livreurs approuvés peuvent être désignés sur une commande.
        </p>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
              <th className="p-4">Livreur</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {livreurs.length > 0 ? (
              livreurs.map((l: Livreur) => (
                <tr key={l.id}>
                  <td className="p-4 font-semibold text-foreground">
                    {`${l.prenom ?? ''} ${l.nom ?? ''}`.trim() || 'Sans nom'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${STATUT_STYLE[l.status] ?? ''}`}>
                      {l.status === 'approved' ? 'Approuvé' : l.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{l.code_livreur ?? '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  Aucun livreur approuvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}