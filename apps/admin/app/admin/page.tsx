import Link from 'next/link';
import { requireRole } from '@/actions/helper';
import { RafraichirButton } from '@/components/molecules/RafraichirButton';

type Synthese = {
  a_traiter: {
    commandes_sans_livreur: number;
    commandes_a_expedier: number;
    remises_a_confirmer: number;
    retours_a_decider: number;
    retours_a_rembourser: number;
    relances_livraison: number;
  };
  aujourdhui: { commandes: number; chiffre_affaires: number };
  stock: { sous_seuil: number; ruptures: number };
  fidelite: { codes_valables: number; codes_utilises: number } | null;
};

const euros = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`;

function Carte({
  titre,
  valeur,
  href,
  alerte = false,
}: {
  titre: string;
  valeur: number | string;
  href?: string;
  alerte?: boolean;
}) {
  const contenu = (
    <div
      className={`p-4 rounded-2xl border bg-card flex flex-col gap-1 ${
        alerte && Number(valeur) > 0 ? 'border-shop-orange/60 bg-shop-orange/5' : 'border-border'
      }`}
    >
      <span className="text-[11px] text-muted-foreground">{titre}</span>
      <span className="text-xl font-bold text-foreground">{valeur}</span>
    </div>
  );
  return href ? <Link href={href} className="hover:opacity-90">{contenu}</Link> : contenu;
}

export default async function DashboardPage() {
  const auth = await requireRole(['admin', 'manager']);
  const isAdmin = auth.role === 'admin';

  const { data, error } = await auth.supabase.rpc('tableau_de_bord');
  if (error) {
    return <p className="text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  const s = data as Synthese;
  const maintenant = new Date().toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Algiers',
  });

  const aTraiterTotal =
    s.a_traiter.commandes_sans_livreur +
    s.a_traiter.commandes_a_expedier +
    s.a_traiter.remises_a_confirmer +
    s.a_traiter.retours_a_decider +
    s.a_traiter.retours_a_rembourser +
    s.a_traiter.relances_livraison;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-xs text-muted-foreground capitalize">{maintenant}</p>
        </div>
        <RafraichirButton />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">
          À traiter {aTraiterTotal > 0 && <span className="text-shop-orange">({aTraiterTotal})</span>}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Carte titre="Commandes sans livreur" valeur={s.a_traiter.commandes_sans_livreur} href="/admin/orders" alerte />
          <Carte titre="Commandes à expédier" valeur={s.a_traiter.commandes_a_expedier} href="/admin/orders" alerte />
          <Carte titre="Remises à confirmer" valeur={s.a_traiter.remises_a_confirmer} href="/admin/orders" alerte />
          <Carte titre="Retours à décider" valeur={s.a_traiter.retours_a_decider} href="/admin/retours" alerte />
          {isAdmin && (
            <Carte titre="Remboursements à effectuer" valeur={s.a_traiter.retours_a_rembourser} href="/admin/retours" alerte />
          )}
          <Carte titre="Livraisons en retard" valeur={s.a_traiter.relances_livraison} href="/admin/orders" alerte />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">Aujourd'hui</h2>
        <div className="grid grid-cols-2 gap-4 max-w-xl">
          <Carte titre="Commandes" valeur={s.aujourdhui.commandes} href="/admin/ventes" />
          <Carte titre="Chiffre d'affaires" valeur={euros(Number(s.aujourdhui.chiffre_affaires))} href="/admin/ventes" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">Stock</h2>
        <div className="grid grid-cols-2 gap-4 max-w-xl">
          <Carte titre="Sous le seuil d'alerte" valeur={s.stock.sous_seuil} href="/admin/stock?alerte=1" alerte />
          <Carte titre="En rupture" valeur={s.stock.ruptures} href="/admin/stock?alerte=1" alerte />
        </div>
      </section>

      {isAdmin && s.fidelite && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-foreground">Fidélité</h2>
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <Carte titre="Codes valables" valeur={s.fidelite.codes_valables} href="/admin/settings" />
            <Carte titre="Codes utilisés" valeur={s.fidelite.codes_utilises} href="/admin/settings" />
          </div>
        </section>
      )}
    </div>
  );
}