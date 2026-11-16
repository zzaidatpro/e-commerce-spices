import Link from 'next/link';
import { requireRole } from '@/actions/helper';
import { ClientStatutButton } from '@/components/atoms/ClientStatutButton';

type ClientLigne = {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  whatsapp: string | null;
  status: string | null;
  nb_commandes: number | string;
  created_at: string;
};

const STATUT_STYLE: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-600 border border-green-500/20',
  blocked: 'bg-red-500/10 text-red-600 border border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
};

const STATUT_LABEL: Record<string, string> = {
  approved: 'Actif',
  blocked: 'Bloqué',
  pending: 'En attente',
};

function versWhatsapp(numero: string | null): string | null {
  if (!numero) return null;
  const chiffres = numero.replace(/\D/g, '');
  if (!chiffres) return null;
  return chiffres.startsWith('0') ? `213${chiffres.slice(1)}` : chiffres;
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const auth = await requireRole(['admin', 'manager']);
  const isAdmin = auth.role === 'admin';

  const { data, error } = await auth.supabase.rpc('liste_clients');

  if (error) {
    return <p className="text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  const lignes: ClientLigne[] = data ?? [];
  const recherche = (q ?? '').trim().toLowerCase();

  const clients: ClientLigne[] = lignes.filter((c: ClientLigne) => {
    if (!recherche) return true;
    return [c.nom, c.prenom, c.email, c.telephone]
      .filter((v): v is string => Boolean(v))
      .some((v: string) => v.toLowerCase().includes(recherche));
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Clients</h1>
          <p className="text-xs text-muted-foreground">
            {clients.length} client(s){isAdmin ? '' : ' · lecture seule'}
          </p>
        </div>

        <form method="GET" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Nom, e-mail, téléphone..."
            className="px-3 py-2 border border-border rounded-xl bg-background text-xs w-64"
          />
          <button type="submit" className="px-3 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl">
            Rechercher
          </button>
          {q && (
            <Link href="/admin/clients" className="text-xs text-muted-foreground hover:underline">
              Effacer
            </Link>
          )}
        </form>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
              <th className="p-4">Client</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Commandes</th>
              <th className="p-4">Inscrit le</th>
              <th className="p-4">Statut</th>
              {isAdmin && <th className="p-4 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.length > 0 ? (
              clients.map((c: ClientLigne) => {
                const statut = c.status ?? 'pending';
                const whatsapp = versWhatsapp(c.whatsapp);
                const nomComplet = `${c.prenom ?? ''} ${c.nom ?? ''}`.trim();

                return (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="p-4 font-semibold text-foreground">
                      {nomComplet || 'Sans nom'}
                    </td>
                    <td className="p-4">
                      <div className="text-muted-foreground">{c.email ?? '—'}</div>
                      {c.telephone && (
                        <a href={`tel:${c.telephone}`} className="text-shop-orange hover:underline">
                          {c.telephone}
                        </a>
                      )}
                      {whatsapp && (
                        <a
                          href={`https://wa.me/${whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-shop-orange hover:underline"
                        >
                          WhatsApp
                        </a>
                      )}
                    </td>
                    <td className="p-4">{Number(c.nb_commandes)}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          STATUT_STYLE[statut] ?? ''
                        }`}
                      >
                        {STATUT_LABEL[statut] ?? statut}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <ClientStatutButton clientId={c.id} statut={statut} />
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-muted-foreground">
                  Aucun client trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}