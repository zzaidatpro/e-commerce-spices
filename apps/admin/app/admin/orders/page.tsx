import Link from 'next/link';
import { requireRole } from '@/actions/helper';
import { STATUT_LABELS } from '@/lib/commandes';

type ClientOption = { id: string; nom: string | null; prenom: string | null; email: string | null };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const auth = await requireRole(['admin', 'manager']);
  const supabase = auth.supabase;

  // Liste des clients : sert au filtre et aux noms affichés
  const { data: clientsData } = await supabase.rpc('liste_clients');
  const clients: ClientOption[] = clientsData ?? [];
  const nomDe = new Map(
    clients.map((c) => [c.id, `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || c.email || 'Client'])
  );

  let query = supabase
    .from('orders')
    .select('id, created_at, total, remise, statut, client_id')
    .order('created_at', { ascending: false });

  if (client) query = query.eq('client_id', client);

  const { data: orders, error } = await query;

  if (error) {
    return <p className="text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Commandes</h1>
          <p className="text-xs text-muted-foreground">{orders?.length ?? 0} commande(s)</p>
        </div>

        <form method="GET" className="flex items-center gap-2">
          <select
            name="client"
            defaultValue={client ?? ''}
            className="px-3 py-2 border border-border rounded-xl bg-background text-xs"
          >
            <option value="">Tous les clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {nomDe.get(c.id)}
              </option>
            ))}
          </select>
          <button type="submit" className="px-3 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl">
            Filtrer
          </button>
          {client && (
            <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
              Réinitialiser
            </Link>
          )}
        </form>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
              <th className="p-4">Commande</th>
              <th className="p-4">Client</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders && orders.length > 0 ? (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-shop-orange hover:underline">
                      #{o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="p-4">{nomDe.get(o.client_id) ?? 'Client inconnu'}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-4 font-semibold">
                    {Number(o.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                    {Number(o.remise) > 0 && (
                      <span className="block text-[10px] text-green-600">
                        remise {Number(o.remise).toLocaleString('fr-FR')} DA
                      </span>
                    )}
                  </td>
                  <td className="p-4">{STATUT_LABELS[o.statut] ?? o.statut}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}