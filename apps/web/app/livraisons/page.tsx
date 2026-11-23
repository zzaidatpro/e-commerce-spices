import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import { createClient } from '@repo/database/server';
import { CoordonneesLivreurForm } from '@/components/molecules/CoordonneesLivreurForm';
import { LivraisonCard, type Livraison } from '@/components/molecules/LivraisonCard';

type Periode = 'jour' | 'semaine' | 'mois';
type Contact = { nom: string | null; prenom: string | null; telephone: string | null } | null;
type LigneHistorique = {
  periode_debut: string;
  nb_livraisons: number;
  montant_total: number | string;
  nb_confirmees: number;
  nb_refusees: number;
};

const PERIODES: Periode[] = ['jour', 'semaine', 'mois'];
const LIBELLE: Record<Periode, string> = { jour: 'Jour', semaine: 'Semaine', mois: 'Mois' };

export default async function LivraisonsPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode } = await searchParams;
  const p: Periode = PERIODES.includes(periode as Periode) ? (periode as Periode) : 'mois';

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: moi } = await supabase
    .from('profiles')
    .select('prenom, nom, telephone, whatsapp, code_livreur, role')
    .eq('id', user.id)
    .single();

  if (moi?.role !== 'livreur') redirect('/unauthorized');

  const { data: historiqueBrut } = await supabase.rpc('historique_livreur', { p_periode: p });
  const historique = (historiqueBrut ?? []) as LigneHistorique[];
  const totalMontant = historique.reduce((s, l) => s + Number(l.montant_total), 0);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, total, statut, code_recu_at, acceptee_at, expediee_at, montant_declare, remise_at,
      adresses_livraison:adresse_liv_id (adresse_complete, type_lieu, url_google_maps),
      order_items (id, quantite, produits (nom))
    `)
    .eq('livreur_id', user.id)
    .in('statut', ['payée', 'en_attente', 'expédiée', 'livrée'])
    .order('created_at', { ascending: true });

  if (error) {
    return <p className="p-6 text-xs text-destructive">Erreur : {error.message}</p>;
  }

  const livraisons = (data ?? []) as unknown as Livraison[];

  // Coordonnées du client : livraison en cours
  const contacts = await Promise.all(
    livraisons.map((l) =>
      l.statut === 'expédiée' ? supabase.rpc('contact_livraison', { p_order: l.id }) : null
    )
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          {moi?.prenom} {moi?.nom}
        </p>
        <p className="text-xs text-muted-foreground">Votre code livreur</p>
        <p className="text-3xl font-mono font-bold tracking-widest text-foreground">
          {moi?.code_livreur ?? '—'}
        </p>
      </div>

      <section className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Historique</h2>
          <div className="flex gap-2 text-xs">
            {PERIODES.map((x) => (
              <Link
                key={x}
                href={`/livraisons?periode=${x}`}
                className={`px-3 py-1.5 rounded-lg border ${
                  p === x
                    ? 'bg-shop-orange text-white border-shop-orange'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {LIBELLE[x]}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Total déclaré :{' '}
          <span className="font-semibold text-foreground">
            {totalMontant.toLocaleString('fr-FR')} DA
          </span>
        </p>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-semibold">
              <th className="py-2">Période</th>
              <th className="py-2">Livraisons</th>
              <th className="py-2">Confirmées</th>
              <th className="py-2">Refusées</th>
              <th className="py-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {historique.length > 0 ? (
              historique.map((l) => (
                <tr key={l.periode_debut}>
                  <td className="py-2">
                    {new Date(`${l.periode_debut}T12:00:00Z`).toLocaleDateString('fr-FR', {
                      day: p === 'mois' ? undefined : 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'Africa/Algiers',
                    })}
                  </td>
                  <td className="py-2">{l.nb_livraisons}</td>
                  <td className="py-2">{l.nb_confirmees}</td>
                  <td className="py-2">{l.nb_refusees}</td>
                  <td className="py-2 text-right font-semibold">
                    {Number(l.montant_total).toLocaleString('fr-FR')} DA
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  Aucune livraison sur cette période.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <CoordonneesLivreurForm
        nom={moi?.nom ?? null}
        prenom={moi?.prenom ?? null}
        telephone={moi?.telephone ?? null}
        whatsapp={moi?.whatsapp ?? null}
      />

      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Truck className="w-5 h-5 text-shop-orange" />
        Mes livraisons en cours ({livraisons.length})
      </h1>

      {livraisons.length === 0 && (
        <p className="text-xs text-muted-foreground">Aucune livraison en cours.</p>
      )}

      {livraisons.map((l, i) => (
        <LivraisonCard
          key={l.id}
          livraison={l}
          contact={(contacts[i]?.data?.[0] ?? null) as Contact}
        />
      ))}
    </div>
  );
}