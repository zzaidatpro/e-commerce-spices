import Link from 'next/link';
import { requireRole } from '@/actions/helper';

type Periode = 'semaine' | 'mois' | 'annee';

type VenteLigne = {
  produit_id: string;
  nom: string;
  family: string | null;
  image_url: string | null;
  quantite_vendue: number | string;
  chiffre_affaires: number | string;
  nb_commandes: number | string;
};

const PERIODES: { value: Periode; label: string }[] = [
  { value: 'semaine', label: 'Semaine' },
  { value: 'mois', label: 'Mois' },
  { value: 'annee', label: 'Année' },
];

const FUSEAU = 'Africa/Algiers';

function decaler(ref: Date, periode: Periode, sens: -1 | 1): Date {
  const d = new Date(ref);
  if (periode === 'semaine') d.setDate(d.getDate() + 7 * sens);
  else if (periode === 'mois') d.setMonth(d.getMonth() + sens);
  else d.setFullYear(d.getFullYear() + sens);
  return d;
}

function libelle(ref: Date, periode: Periode): string {
  if (periode === 'annee') {
    return ref.toLocaleDateString('fr-FR', { year: 'numeric', timeZone: FUSEAU });
  }
  if (periode === 'mois') {
    return ref.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: FUSEAU });
  }
  return `Semaine du ${ref.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: FUSEAU })}`;
}

export default async function BestSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; date?: string }>;
}) {
  const { periode: periodeBrute, date } = await searchParams;
  const auth = await requireRole(['admin', 'manager']);

  const periode: Periode = (['semaine', 'mois', 'annee'] as const).includes(periodeBrute as Periode)
    ? (periodeBrute as Periode)
    : 'mois';

  // Date de référence : midi UTC évite de basculer de jour selon le fuseau
  const ref =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00Z`) : new Date();

  const { data, error } = await auth.supabase.rpc('meilleures_ventes', {
    p_periode: periode,
    p_ref: ref.toISOString(),
    p_limit: 10,
  });

  if (error) {
    return <p className="text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  const lignes: VenteLigne[] = data ?? [];
  const totalQuantite = lignes.reduce((s: number, l: VenteLigne) => s + Number(l.quantite_vendue), 0);
  const totalCA = lignes.reduce((s: number, l: VenteLigne) => s + Number(l.chiffre_affaires), 0);

  const precedent = decaler(ref, periode, -1).toISOString().slice(0, 10);
  const suivant = decaler(ref, periode, 1).toISOString().slice(0, 10);
  const estAujourdhui = date === undefined;

  const lien = (p: Periode, d?: string) =>
    `/admin/best-sellers?periode=${p}${d ? `&date=${d}` : ''}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Meilleures ventes</h1>
          <p className="text-xs text-muted-foreground capitalize">{libelle(ref, periode)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {PERIODES.map((p) => (
            <Link
              key={p.value}
              href={lien(p.value)}
              className={`px-3 py-1.5 rounded-lg border ${
                periode === p.value
                  ? 'bg-shop-orange text-white border-shop-orange'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-border" />
          <Link href={lien(periode, precedent)} className="px-2 py-1.5 rounded-lg border border-border hover:text-foreground">
            ←
          </Link>
          <Link
            href={lien(periode)}
            className={`px-2 py-1.5 rounded-lg border border-border ${
              estAujourdhui ? 'opacity-50 pointer-events-none' : 'hover:text-foreground'
            }`}
          >
            Aujourd'hui
          </Link>
          <Link href={lien(periode, suivant)} className="px-2 py-1.5 rounded-lg border border-border hover:text-foreground">
            →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="text-[11px] text-muted-foreground">Unités vendues</p>
          <p className="text-lg font-bold text-foreground">{totalQuantite}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="text-[11px] text-muted-foreground">Chiffre d'affaires</p>
          <p className="text-lg font-bold text-shop-orange">
            {totalCA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
          </p>
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
              <th className="p-4 w-12">Rang</th>
              <th className="p-4">Produit</th>
              <th className="p-4">Famille</th>
              <th className="p-4 text-right">Quantité</th>
              <th className="p-4 text-right">Chiffre d'affaires</th>
              <th className="p-4 text-right">Commandes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lignes.length > 0 ? (
              lignes.map((l: VenteLigne, i: number) => (
                <tr key={l.produit_id} className="hover:bg-muted/30">
                  <td className="p-4 font-mono text-muted-foreground">{i + 1}</td>
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
                  <td className="p-4 text-right font-semibold">{Number(l.quantite_vendue)}</td>
                  <td className="p-4 text-right">
                    {Number(l.chiffre_affaires).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                  </td>
                  <td className="p-4 text-right text-muted-foreground">{Number(l.nb_commandes)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Aucune vente payée sur cette période.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}