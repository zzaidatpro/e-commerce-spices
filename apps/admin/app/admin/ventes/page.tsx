import Link from 'next/link';
import { requireRole } from '@/actions/helper';

type VenteJour = {
  jour: string;
  nb_commandes: number | string;
  chiffre_affaires: number | string;
};

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const FUSEAU = 'Africa/Algiers';

function premierDuMois(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function decalerMois(iso: string, sens: -1 | 1): string {
  const d = new Date(`${premierDuMois(iso)}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + sens);
  return d.toISOString().slice(0, 10);
}

export default async function VentesPage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string; jour?: string }>;
}) {
  const { mois: moisBrut, jour } = await searchParams;
  const auth = await requireRole(['admin', 'manager']);

  // Mois affiché : format AAAA-MM, par défaut le mois courant (heure locale)
  const maintenant = new Date().toLocaleDateString('en-CA', { timeZone: FUSEAU });
  const moisIso = moisBrut && /^\d{4}-\d{2}$/.test(moisBrut) ? `${moisBrut}-01` : premierDuMois(maintenant);

  const { data, error } = await auth.supabase.rpc('ventes_par_jour', { p_mois: moisIso });

  if (error) {
    return <p className="text-xs text-destructive">Erreur de chargement : {error.message}</p>;
  }

  const ventes = new Map<string, VenteJour>(
    ((data ?? []) as VenteJour[]).map((v) => [v.jour, v])
  );

  // Grille : on commence au lundi de la semaine du 1er, et on finit au dimanche du dernier jour
  const premier = new Date(`${moisIso}T12:00:00Z`);
  const annee = premier.getUTCFullYear();
  const mois = premier.getUTCMonth();
  const nbJours = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();

  const decalage = (premier.getUTCDay() + 6) % 7; // 0 = lundi
  const cases: (string | null)[] = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= nbJours; j++) {
    cases.push(`${annee}-${String(mois + 1).padStart(2, '0')}-${String(j).padStart(2, '0')}`);
  }
  while (cases.length % 7 !== 0) cases.push(null);

  const totalMois = [...ventes.values()].reduce((s, v) => s + Number(v.chiffre_affaires), 0);
  const nbCommandesMois = [...ventes.values()].reduce((s, v) => s + Number(v.nb_commandes), 0);

  const libelleMois = premier.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const jourSelectionne = jour && ventes.has(jour) ? jour : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground capitalize">{libelleMois}</h1>
          <p className="text-xs text-muted-foreground">
            {nbCommandesMois} commande(s) · {totalMois.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link href={`/admin/ventes?mois=${decalerMois(moisIso, -1).slice(0, 7)}`} className="px-3 py-1.5 rounded-lg border border-border hover:text-foreground">
            ←
          </Link>
          <Link href="/admin/ventes" className="px-3 py-1.5 rounded-lg border border-border hover:text-foreground">
            Aujourd'hui
          </Link>
          <Link href={`/admin/ventes?mois=${decalerMois(moisIso, 1).slice(0, 7)}`} className="px-3 py-1.5 rounded-lg border border-border hover:text-foreground">
            →
          </Link>
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card p-4">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-semibold text-muted-foreground">
          {JOURS_SEMAINE.map((j) => (
            <div key={j}>{j}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cases.map((iso, index) => {
            if (!iso) return <div key={`vide-${index}`} />;

            const vente = ventes.get(iso);
            const numero = Number(iso.slice(8, 10));
            const selectionne = jourSelectionne === iso;

            return (
              <Link
                key={iso}
                href={`/admin/ventes?mois=${iso.slice(0, 7)}&jour=${iso}`}
                className={`relative flex flex-col items-start p-2 min-h-16 rounded-xl border text-xs transition-colors ${
                  selectionne
                    ? 'border-shop-orange bg-shop-orange/5'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <span className="font-semibold text-foreground">{numero}</span>
                {vente && (
                  <>
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-shop-orange" />
                    <span className="mt-auto text-[10px] text-muted-foreground">
                      {Number(vente.nb_commandes)} cmd
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {jourSelectionne && ventes.get(jourSelectionne) && (
        <div className="border border-border rounded-2xl bg-card p-4 text-xs flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">
              {new Date(`${jourSelectionne}T12:00:00Z`).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                timeZone: 'UTC',
              })}
            </p>
            <p className="text-muted-foreground">
              {Number(ventes.get(jourSelectionne)!.nb_commandes)} commande(s) ·{' '}
              {Number(ventes.get(jourSelectionne)!.chiffre_affaires).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
              })}{' '}
              DA
            </p>
          </div>
          <Link
            href={`/admin/orders?date=${jourSelectionne}`}
            className="text-shop-orange font-semibold hover:underline"
          >
            Voir les commandes du jour
          </Link>
        </div>
      )}
    </div>
  );
}